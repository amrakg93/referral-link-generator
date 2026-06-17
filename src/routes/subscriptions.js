const express = require('express');
const { getStripe } = require('../services/stripe');
const { getDb } = require('../models/db');
const config = require('../config');
const crypto = require('crypto');

const router = express.Router();

function uid() {
  return crypto.randomBytes(8).toString('hex');
}

// Create a Stripe Checkout session for subscribing to a plan
router.post('/create-checkout-session', async (req, res) => {
  const { priceId } = req.body;
  if (!priceId) return res.status(400).json({ error: 'priceId required' });

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: priceId === config.STRIPE_FREE_PRICE_ID ? 'payment' : 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.BASE_URL}/pricing`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create a Stripe Customer Portal session
router.post('/create-portal-session', async (req, res) => {
  const { stripeCustomerId } = req.body;
  if (!stripeCustomerId) return res.status(400).json({ error: 'stripeCustomerId required' });

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${config.BASE_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Portal session error:', err.message);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get subscription info for a customer
router.get('/subscription/:stripeCustomerId', (req, res) => {
  const db = getDb();
  const sub = db.prepare('SELECT * FROM subscriptions WHERE stripe_customer_id = ?')
    .get(req.params.stripeCustomerId);

  if (!sub) return res.json({ tier: 'free', reviewRequestsRemaining: 10 });

  // Count review products and requests this month
  const reviewProducts = db.prepare('SELECT COUNT(*) as count FROM review_products WHERE subscription_id = ?')
    .get(sub.id);
  const monthlyRequests = db.prepare(
    "SELECT COUNT(*) as count FROM review_requests WHERE product_id IN (SELECT id FROM review_products WHERE subscription_id = ?) AND created_at >= datetime('now', 'start of month')"
  ).get(sub.id);

  const limit = sub.tier === 'pro' ? Infinity : 10;

  res.json({
    tier: sub.tier,
    status: sub.status,
    reviewProducts: reviewProducts.count,
    reviewRequestsThisMonth: monthlyRequests.count,
    reviewRequestsLimit: limit,
  });
});

module.exports = router;
