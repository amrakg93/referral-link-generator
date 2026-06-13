module.exports = {
  PORT: process.env.PORT || 3006,
  BASE_URL: process.env.BASE_URL || 'http://localhost:3006',
  DATABASE_PATH: process.env.DATABASE_PATH || './data/app.db',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  DISCOUNT_PERCENT: parseInt(process.env.DISCOUNT_PERCENT || '20'),
  REWARD_AMOUNT: parseInt(process.env.REWARD_AMOUNT || '1000'),
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};
