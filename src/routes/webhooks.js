const express = require('express');
const { getStripe } = require('../services/stripe');
const { getDb } = require('../models/db');
const config = require('../config');

const router = express.Router();

// Stripe requires the raw body to verify signatures — mount this route
// BEFORE express.json() in index.js using express.raw({ type: 'application/json' }).
router.post('/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, config.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    handleCheckoutCompleted(event.data.object);
  }

  res.json({ received: true });
});

// When a Stripe checkout session completes, check if a referral promo code was used.
// If so: mark the redemption as converted, increment the link's conversion count,
// and credit the referrer's reward balance.
function handleCheckoutCompleted(session) {
  const db = getDb();
  const discounts = session.total_details?.breakdown?.discounts || [];

  for (const d of discounts) {
    const promoCodeId = d.discount?.promotion_code;
    if (!promoCodeId) continue;

    // Find the redemption that used this promo code
    const redemption = db.prepare(
      "SELECT * FROM redemptions WHERE stripe_coupon_id = ? AND status = 'pending'"
    ).get(promoCodeId);

    if (!redemption) continue;

    // Mark converted
    db.prepare("UPDATE redemptions SET status = 'converted' WHERE id = ?").run(redemption.id);

    // Increment link conversion count
    const link = db.prepare('SELECT * FROM referral_links WHERE id = ?').get(redemption.link_id);
    if (!link) continue;

    db.prepare('UPDATE referral_links SET conversions = conversions + 1 WHERE id = ?').run(link.id);
    db.prepare('UPDATE referrers SET reward_balance = reward_balance + ? WHERE id = ?')
      .run(config.REWARD_AMOUNT, link.referrer_id);

    console.log(`Conversion confirmed: link ${link.id}, referrer credited ${config.REWARD_AMOUNT} cents`);
  }
}

module.exports = router;
