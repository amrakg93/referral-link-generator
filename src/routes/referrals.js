const express = require('express');
const { getDb } = require('../models/db');
const crypto = require('crypto');
const config = require('../config');
const { createPromoCode } = require('../services/stripe');
const router = express.Router();

function uid() {
  return crypto.randomBytes(6).toString('hex');
}

function makeCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Incoming referral link — records click and redirects to product checkout
router.get('/ref/:code', (req, res) => {
  const db = getDb();
  const link = db.prepare('SELECT * FROM referral_links WHERE code = ?').get(req.params.code);
  if (!link) return res.status(404).json({ error: 'Invalid referral link' });

  db.prepare('UPDATE referral_links SET clicks = clicks + 1 WHERE id = ?').run(link.id);
  // Redirect to product's Stripe checkout or landing page
  // Build a checkout URL with the referral promo code baked in
  const promoCode = `REF-${link.code}`;
  const checkoutUrl = `${config.BASE_URL}/checkout/${link.product_id}?promo=${promoCode}`;
  res.redirect(checkoutUrl);
});

router.post('/links', async (req, res) => {
  const { productId, referrerEmail, stripeCustomerId } = req.body;
  if (!productId || !referrerEmail) return res.status(400).json({ error: 'productId and referrerEmail required' });

  const db = getDb();

  let referrer = db.prepare('SELECT * FROM referrers WHERE email = ? AND product_id = ?').get(referrerEmail, productId);
  if (!referrer) {
    const id = uid();
    db.prepare('INSERT INTO referrers (id, product_id, email, stripe_customer_id) VALUES (?, ?, ?, ?)')
      .run(id, productId, referrerEmail, stripeCustomerId || null);
    referrer = db.prepare('SELECT * FROM referrers WHERE id = ?').get(id);
  }

  const code = makeCode();
  const linkId = uid();
  const baseUrl = config.BASE_URL;
  const linkUrl = `${baseUrl}/ref/${code}`;

  db.prepare('INSERT INTO referral_links (id, product_id, referrer_id, code, link_url) VALUES (?, ?, ?, ?, ?)')
    .run(linkId, productId, referrer.id, code, linkUrl);

  res.json({ id: linkId, code, url: linkUrl });
});

// List all links for a product (used by the admin dashboard)
router.get('/links', (req, res) => {
  const { productId } = req.query;
  if (!productId) return res.status(400).json({ error: 'productId query param required' });

  const db = getDb();
  const links = db.prepare(`
    SELECT rl.*, rr.email as referrer_email, rr.reward_balance
    FROM referral_links rl
    JOIN referrers rr ON rr.id = rl.referrer_id
    WHERE rl.product_id = ?
    ORDER BY rl.created_at DESC
  `).all(productId);

  res.json(links);
});

router.get('/links/:id', (req, res) => {
  const db = getDb();
  const link = db.prepare(`
    SELECT rl.*, rr.email as referrer_email, rr.reward_balance
    FROM referral_links rl
    JOIN referrers rr ON rr.id = rl.referrer_id
    WHERE rl.id = ?
  `).get(req.params.id);

  if (!link) return res.status(404).json({ error: 'Link not found' });
  res.json(link);
});

router.get('/stats/:productId', (req, res) => {
  const db = getDb();
  const totalLinks = db.prepare('SELECT COUNT(*) as count FROM referral_links WHERE product_id = ?').get(req.params.productId);
  const totalClicks = db.prepare('SELECT COALESCE(SUM(clicks), 0) as count FROM referral_links WHERE product_id = ?').get(req.params.productId);
  const totalConversions = db.prepare('SELECT COALESCE(SUM(conversions), 0) as count FROM referral_links WHERE product_id = ?').get(req.params.productId);

  res.json({
    totalLinks: totalLinks.count,
    totalClicks: totalClicks.count,
    totalConversions: totalConversions.count,
    conversionRate: totalClicks.count > 0 ? ((totalConversions.count / totalClicks.count) * 100).toFixed(1) : 0,
  });
});

router.post('/redeem', async (req, res) => {
  const { code, referredEmail } = req.body;
  if (!code) return res.status(400).json({ error: 'code required' });

  const db = getDb();
  const link = db.prepare('SELECT * FROM referral_links WHERE code = ?').get(code);
  if (!link) return res.status(404).json({ error: 'Invalid referral code' });

  db.prepare('UPDATE referral_links SET clicks = clicks + 1 WHERE id = ?').run(link.id);

  // Create a real single-use Stripe promo code. Fall back gracefully if
  // Stripe isn't configured (e.g. local dev without keys).
  let promoCode = null;
  let stripePromoId = null;
  try {
    const stripePromo = await createPromoCode(code);
    promoCode = stripePromo.code;
    stripePromoId = stripePromo.id;
  } catch (err) {
    console.warn('Stripe promo code creation skipped:', err.message);
  }

  const redemptionId = uid();
  db.prepare('INSERT INTO redemptions (id, link_id, referred_email, stripe_coupon_id, status) VALUES (?, ?, ?, ?, ?)')
    .run(redemptionId, link.id, referredEmail || null, stripePromoId, 'pending');

  res.json({
    id: redemptionId,
    promoCode,
    discountPercent: config.DISCOUNT_PERCENT,
    message: promoCode
      ? `Apply code ${promoCode} at checkout for ${config.DISCOUNT_PERCENT}% off`
      : `${config.DISCOUNT_PERCENT}% discount will be applied at checkout`,
  });
});

router.post('/links/:id/convert', (req, res) => {
  const db = getDb();
  const link = db.prepare('SELECT * FROM referral_links WHERE id = ?').get(req.params.id);
  if (!link) return res.status(404).json({ error: 'Link not found' });

  db.prepare('UPDATE referral_links SET conversions = conversions + 1 WHERE id = ?').run(req.params.id);
  db.prepare('UPDATE referrers SET reward_balance = reward_balance + ? WHERE id = ?').run(config.REWARD_AMOUNT, link.referrer_id);

  res.json({ ok: true });
});

module.exports = router;
