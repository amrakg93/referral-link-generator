module.exports = {
  PORT: process.env.PORT || 3006,
  BASE_URL: process.env.BASE_URL || 'http://localhost:3006',
  DATABASE_PATH: process.env.DATABASE_PATH || './data/app.db',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  DISCOUNT_PERCENT: parseInt(process.env.DISCOUNT_PERCENT || '20'),
  REWARD_AMOUNT: parseInt(process.env.REWARD_AMOUNT || '1000'),
  // Pricing
  STRIPE_PRO_MONTHLY_PRICE_ID: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  STRIPE_PRO_ANNUAL_PRICE_ID: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  STRIPE_FREE_PRICE_ID: process.env.STRIPE_FREE_PRICE_ID,
  // Reviews
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL || 'reviews@reflinkgen.com',
  G2_REVIEW_URL: process.env.G2_REVIEW_URL,
  CAPTERRA_REVIEW_URL: process.env.CAPTERRA_REVIEW_URL,
  HAPPINESS_THRESHOLD: parseInt(process.env.HAPPINESS_THRESHOLD || '10'),
};
