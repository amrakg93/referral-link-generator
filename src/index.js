const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const config = require('./config');
const { initDb } = require('./models/db');
const referralRoutes = require('./routes/referrals');
const webhookRoutes = require('./routes/webhooks');
const reviewRoutes = require('./routes/reviews');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'script-src': ["'self'", "'unsafe-inline'"],
      'script-src-attr': ["'unsafe-inline'"],
    },
  },
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Webhook route must come before express.json() — Stripe needs the raw body
// to verify the signature. The route itself applies express.raw() internally.
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());

// Marketing pages (served before API routes)
app.get('/', (req, res) => res.sendFile('landing.html', { root: 'src/public' }));
app.get('/pricing', (req, res) => res.sendFile('pricing.html', { root: 'src/public' }));
app.get('/privacy', (req, res) => res.sendFile('privacy.html', { root: 'src/public' }));
app.get('/terms', (req, res) => res.sendFile('terms.html', { root: 'src/public' }));
app.get('/about', (req, res) => res.sendFile('about.html', { root: 'src/public' }));

// Dashboard (moved from root)
app.get('/dashboard', (req, res) => res.sendFile('index.html', { root: 'src/public' }));

// Static assets (css, js, images) — after explicit routes
app.use(express.static('src/public'));

app.use('/api', referralRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

async function start() {
  await initDb();

  // Production safety checks — warn but don't crash on missing optional keys
  const required = { STRIPE_SECRET_KEY: config.STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET: config.STRIPE_WEBHOOK_SECRET };
  const missing = Object.entries(required).filter(([, v]) => !v);
  if (missing.length) {
    console.warn('⚠ Missing env vars (Stripe features disabled):', missing.map(([k]) => k).join(', '));
  }
  console.log(`BASE_URL: ${config.BASE_URL}`);

  const server = app.listen(config.PORT, () => {
    console.log(`Referral Link Generator running on :${config.PORT}`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down`);
    server.close(() => {
      const db = require('./models/db').getDb();
      if (db) db.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000); // force exit after 10s
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch(console.error);

module.exports = app;

