const config = require('../config');

let _stripe = null;

function getStripe() {
  if (!_stripe) {
    if (!config.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY missing — Stripe features unavailable');
    const Stripe = require('stripe');
    _stripe = new Stripe(config.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// Returns the referral coupon, creating it if it doesn't exist.
// Looks for an existing coupon tagged with metadata.referral_system = 'true'
// so re-deploying doesn't create duplicates.
async function getOrCreateCoupon() {
  const stripe = getStripe();
  const list = await stripe.coupons.list({ limit: 100 });
  const existing = list.data.find((c) => c.metadata?.referral_system === 'true' && c.valid);
  if (existing) return existing;

  return stripe.coupons.create({
    percent_off: config.DISCOUNT_PERCENT,
    duration: 'once',
    name: `Referral Discount (${config.DISCOUNT_PERCENT}% off)`,
    metadata: { referral_system: 'true' },
  });
}

// Creates a single-use promotion code from the shared referral coupon.
// code should be the referral link code (e.g. "A1B2C3D4") so it's recognizable.
async function createPromoCode(code) {
  const stripe = getStripe();
  const coupon = await getOrCreateCoupon();
  return stripe.promotionCodes.create({
    coupon: coupon.id,
    code: `REF-${code}`,
    max_redemptions: 1,
    metadata: { referral_code: code },
  });
}

// Looks up an active promo code by its string (e.g. "REF-A1B2C3D4").
// Used in the webhook to trace which referral link triggered a conversion.
async function findPromoCode(codeStr) {
  const stripe = getStripe();
  const list = await stripe.promotionCodes.list({ code: codeStr, active: true, limit: 1 });
  return list.data[0] || null;
}

module.exports = { getStripe, getOrCreateCoupon, createPromoCode, findPromoCode };
