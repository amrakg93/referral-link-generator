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
const cronRoutes = require('./routes/cron');

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
app.use('/api', cronRoutes);

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

  // ── Scheduled email tasks (node-cron) ──────────────────────────────────
  try {
    const cron = require('node-cron');
    const { weeklyDigest, reEngagement } = require('./services/notifications');
    const { getDb } = require('./models/db');

    // Weekly digest — every Monday at 9:00 AM
    cron.schedule('0 9 * * 1', async () => {
      console.log('[cron] Running weekly digest...');
      const db = getDb();
      const referrers = db.prepare(`
        SELECT DISTINCT r.id, r.email, r.reward_balance
        FROM referrers r
        JOIN referral_links rl ON rl.referrer_id = r.id
        WHERE rl.created_at >= datetime('now', '-7 days')
      `).all();

      for (const ref of referrers) {
        const stats = db.prepare(`
          SELECT
            COALESCE(SUM(rl.clicks), 0) AS clicks,
            COALESCE(SUM(rl.conversions), 0) AS conversions
          FROM referral_links rl
          WHERE rl.referrer_id = ? AND rl.created_at >= datetime('now', '-7 days')
        `).get(ref.id);

        await weeklyDigest(ref.email, stats.clicks, stats.conversions, ref.reward_balance || 0);
      }
      console.log(`[cron] Weekly digest sent to ${referrers.length} referrers`);
    });

    // Re-engagement — daily at 12:00 PM, for referrers inactive 30+ days
    cron.schedule('0 12 * * *', async () => {
      console.log('[cron] Running re-engagement check...');
      const db = getDb();
      const inactive = db.prepare(`
        SELECT r.id, r.email,
               CAST(julianday('now') - julianday(MAX(rl.created_at)) AS INTEGER) AS days_since_last
        FROM referrers r
        JOIN referral_links rl ON rl.referrer_id = r.id
        GROUP BY r.id
        HAVING days_since_last >= 30
      `).all();

      for (const ref of inactive) {
        await reEngagement(ref.email, ref.days_since_last);
      }
      console.log(`[cron] Re-engagement sent to ${inactive.length} inactive referrers`);
    });

    console.log('[cron] Scheduled tasks registered (weekly digest Mon 9AM, re-engagement daily 12PM)');
  } catch (err) {
    // node-cron is optional — if not installed, scheduled tasks won't run
    // but HTTP-triggered cron endpoints still work
    console.warn('[cron] node-cron not available — scheduled tasks disabled. Install with: npm install node-cron');
  }

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

