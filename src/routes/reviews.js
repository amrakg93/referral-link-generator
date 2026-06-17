const express = require('express');
const { getDb } = require('../models/db');
const crypto = require('crypto');
const config = require('../config');
const router = express.Router();

function uid() {
  return crypto.randomBytes(8).toString('hex');
}

// --- Subscription gating ---
function requirePro(req, res, next) {
  const stripeCustomerId = req.headers['x-stripe-customer-id'];
  if (!stripeCustomerId) return res.status(401).json({ error: 'Authentication required' });

  const db = getDb();
  let sub = db.prepare('SELECT * FROM subscriptions WHERE stripe_customer_id = ?').get(stripeCustomerId);

  // Auto-provision a free tier subscription for first-time users
  if (!sub) {
    const id = crypto.randomBytes(8).toString('hex');
    db.prepare(`INSERT INTO subscriptions (id, stripe_customer_id, status, tier) VALUES (?, ?, 'active', 'free')`)
      .run(id, stripeCustomerId);
    sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);
  }

  if (sub.tier !== 'pro' && sub.status !== 'active') {
    return res.status(403).json({ error: 'Pro plan required', upgradeUrl: '/pricing' });
  }

  req.subscription = sub;
  next();
}

// Check if user is within free tier limits (10 review requests/month)
function checkFreeLimit(req, res, next) {
  if (req.subscription.tier === 'pro') return next();

  const db = getDb();
  const monthlyRequests = db.prepare(
    "SELECT COUNT(*) as count FROM review_requests WHERE product_id IN (SELECT id FROM review_products WHERE subscription_id = ?) AND created_at >= datetime('now', 'start of month')"
  ).get(req.subscription.id);

  if (monthlyRequests.count >= 10) {
    return res.status(429).json({ error: 'Free tier limit reached (10 requests/month). Upgrade to Pro.', upgradeUrl: '/pricing' });
  }

  next();
}

// --- Review product management ---
router.post('/products', requirePro, (req, res) => {
  const { name, g2Url, capterraUrl, ownerEmail } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const db = getDb();
  const id = uid();

  db.prepare('INSERT INTO review_products (id, subscription_id, name, owner_email, g2_url, capterra_url) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.subscription.id, name, ownerEmail || null, g2Url || null, capterraUrl || null);

  res.json({ id, name });
});

router.get('/products', requirePro, (req, res) => {
  const db = getDb();
  const products = db.prepare('SELECT * FROM review_products WHERE subscription_id = ?').all(req.subscription.id);
  res.json(products);
});

// --- User tracking (happiness-based review trigger) ---
router.post('/track', requirePro, checkFreeLimit, (req, res) => {
  const { productId, userId, email, name } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });

  const db = getDb();

  // Verify this product belongs to this subscription
  const product = db.prepare('SELECT * FROM review_products WHERE id = ? AND subscription_id = ?')
    .get(productId, req.subscription.id);
  if (!product) return res.status(403).json({ error: 'Product not found for this subscription' });

  let user = db.prepare('SELECT * FROM review_users WHERE id = ? AND product_id = ?').get(userId, productId);
  if (!user) {
    const newId = userId || uid();
    db.prepare('INSERT OR IGNORE INTO review_users (id, product_id, email, name) VALUES (?, ?, ?, ?)')
      .run(newId, productId, email || null, name || null);
    user = db.prepare('SELECT * FROM review_users WHERE id = ?').get(newId);
  }

  db.prepare('UPDATE review_users SET usage_count = usage_count + 1 WHERE id = ?').run(user.id);
  const updated = db.prepare('SELECT * FROM review_users WHERE id = ?').get(user.id);

  // Auto-trigger when happiness threshold met
  if (updated.usage_count >= config.HAPPINESS_THRESHOLD && !updated.review_requested) {
    db.prepare('UPDATE review_users SET review_requested = 1 WHERE id = ?').run(user.id);
    console.log(`[REVIEW READY] User ${user.id} for product ${productId} (usage: ${updated.usage_count})`);
  }

  res.json({
    usageCount: updated.usage_count,
    reviewReady: updated.usage_count >= config.HAPPINESS_THRESHOLD && !updated.review_requested,
  });
});

// --- Manual review request ---
router.post('/request', requirePro, checkFreeLimit, (req, res) => {
  const { productId, userId, platform } = req.body;
  if (!productId || !userId) return res.status(400).json({ error: 'productId and userId required' });

  const db = getDb();

  const product = db.prepare('SELECT * FROM review_products WHERE id = ? AND subscription_id = ?')
    .get(productId, req.subscription.id);
  if (!product) return res.status(403).json({ error: 'Product not found for this subscription' });

  const id = uid();

  db.prepare('UPDATE review_users SET review_requested = 1 WHERE id = ?').run(userId);
  db.prepare("INSERT INTO review_requests (id, product_id, user_id, platform, sent_at) VALUES (?, ?, ?, ?, datetime('now'))")
    .run(id, productId, userId, platform || 'g2');

  res.json({ id, message: 'Review request sent' });
});

// --- Stats ---
router.get('/stats/:productId', requirePro, (req, res) => {
  const db = getDb();

  const product = db.prepare('SELECT * FROM review_products WHERE id = ? AND subscription_id = ?')
    .get(req.params.productId, req.subscription.id);
  if (!product) return res.status(403).json({ error: 'Product not found for this subscription' });

  const total = db.prepare('SELECT COUNT(*) as count FROM review_users WHERE product_id = ?').get(req.params.productId);
  const requested = db.prepare('SELECT COUNT(*) as count FROM review_users WHERE product_id = ? AND review_requested = 1').get(req.params.productId);
  const submitted = db.prepare('SELECT COUNT(*) as count FROM review_users WHERE product_id = ? AND review_submitted = 1').get(req.params.productId);

  res.json({
    totalUsers: total.count,
    reviewRequested: requested.count,
    reviewSubmitted: submitted.count,
    conversionRate: total.count > 0 ? ((submitted.count / total.count) * 100).toFixed(1) : 0,
  });
});

module.exports = router;
