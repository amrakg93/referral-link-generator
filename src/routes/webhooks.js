const express = require('express');
const { getStripe } = require('../services/stripe');
const { getDb } = require('../models/db');
const config = require('../config');
const { onConversion } = require('../services/notifications');

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
    handleCheckoutCompleted(event.data.object).catch(err =>
      console.error('handleCheckoutCompleted error:', err)
    );
  }

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    handleSubscriptionUpsert(event.data.object).catch(err =>
      console.error('handleSubscriptionUpsert error:', err)
    );
  }

  if (event.type === 'customer.subscription.deleted') {
    handleSubscriptionDeleted(event.data.object).catch(err =>
      console.error('handleSubscriptionDeleted error:', err)
    );
  }

  res.json({ received: true });
});

// When a Stripe checkout session completes, check if a referral promo code was used.
// If so: mark the redemption as converted, increment the link's conversion count,
// and credit the referrer's reward balance.
async function handleCheckoutCompleted(session) {
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

    // Send email notification to the referrer
    try {
      const referrer = db.prepare('SELECT email FROM referrers WHERE id = ?').get(link.referrer_id);
      if (referrer && referrer.email) {
        onConversion(referrer.email, config.REWARD_AMOUNT, redemption.referred_email);
      }
    } catch (notifyErr) {
      console.error('Failed to send conversion notification email:', notifyErr.message);
    }
  }
}

// Upsert subscription record when Stripe subscription is created or updated
async function handleSubscriptionUpsert(subscription) {
  const db = getDb();
  const customerId = subscription.customer;
  const priceId = subscription.items?.data?.[0]?.price?.id;
  const status = subscription.status;

  // Determine tier from price
  let tier = 'free';
  if (priceId === config.STRIPE_PRO_MONTHLY_PRICE_ID || priceId === config.STRIPE_PRO_ANNUAL_PRICE_ID) {
    tier = 'pro';
  }

  const existing = db.prepare('SELECT * FROM subscriptions WHERE stripe_subscription_id = ?')
    .get(subscription.id);

  if (existing) {
    db.prepare(`UPDATE subscriptions SET price_id = ?, status = ?, tier = ?, updated_at = datetime('now') WHERE stripe_subscription_id = ?`)
      .run(priceId, status, tier, subscription.id);
    console.log(`Subscription updated: ${customerId} → ${tier} (${status})`);
  } else {
    const id = require('crypto').randomBytes(8).toString('hex');
    db.prepare(`INSERT INTO subscriptions (id, stripe_customer_id, stripe_subscription_id, price_id, status, tier)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, customerId, subscription.id, priceId, status, tier);
    console.log(`Subscription created: ${customerId} → ${tier} (${status})`);
  }
}

// When a subscription is cancelled, revert to free tier
async function handleSubscriptionDeleted(subscription) {
  const db = getDb();
  db.prepare(`UPDATE subscriptions SET status = 'canceled', tier = 'free', updated_at = datetime('now') WHERE stripe_subscription_id = ?`)
    .run(subscription.id);
  console.log(`Subscription canceled: ${subscription.customer} → free`);
}

module.exports = router;
