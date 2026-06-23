'use strict';

/**
 * Cron / scheduled-task routes for email notifications.
 *
 * Two trigger modes:
 *   1. HTTP endpoint — call GET /api/cron/weekly-digest or
 *      GET /api/cron/re-engagement from an external cron service
 *      (e.g. cron-job.org, Uptime Robot, or a system cron).
 *   2. node-cron in-process scheduler — auto-runs weeklyDigest
 *      every Monday at 9AM and re-engagement every day at noon.
 */

const express = require('express');
const { getDb } = require('../models/db');
const { weeklyDigest, reEngagement } = require('../services/notifications');

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a map of referrer_id → { clicks, conversions, earnings } for the
 * past 7 days (weekly digest) or since a given date.
 */
function weeklyStatsForReferrers(db) {
  const rows = db.prepare(`
    SELECT
      rl.referrer_id,
      COALESCE(SUM(rl.clicks), 0)  AS total_clicks,
      COALESCE(SUM(rl.conversions), 0) AS total_conversions,
      COALESCE(SUM(rr.reward_balance), 0) AS total_earnings
    FROM referral_links rl
    JOIN referrers r ON r.id = rl.referrer_id
    LEFT JOIN referrers rr ON rr.id = rl.referrer_id
    WHERE rl.created_at >= datetime('now', '-7 days')
    GROUP BY rl.referrer_id
  `).all();

  return rows;
}

/**
 * Find referrers whose last link activity was more than `thresholdDays` ago.
 */
function inactiveReferrers(db, thresholdDays = 30) {
  const rows = db.prepare(`
    SELECT r.id, r.email,
           CAST(julianday('now') - julianday(MAX(rl.created_at)) AS INTEGER) AS days_since_last
    FROM referrers r
    JOIN referral_links rl ON rl.referrer_id = r.id
    GROUP BY r.id
    HAVING days_since_last >= ?
  `).all(thresholdDays);

  return rows;
}

// ─── HTTP endpoints (for external cron triggers) ──────────────────────────────

/**
 * GET /api/cron/weekly-digest
 * Send weekly digest to every referrer with any activity in the past 7 days.
 */
router.get('/cron/weekly-digest', async (req, res) => {
  const db = getDb();
  const results = [];

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

    const earnings = ref.reward_balance || 0;
    const result = await weeklyDigest(ref.email, stats.clicks, stats.conversions, earnings);
    results.push({ email: ref.email, ...result });
  }

  const sent = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`[cron] weekly-digest: ${sent} sent, ${failed} failed`);
  res.json({ sent, failed, results });
});

/**
 * GET /api/cron/re-engagement
 * Send re-engagement emails to referrers inactive for 30+ days.
 */
router.get('/cron/re-engagement', async (req, res) => {
  const db = getDb();
  const results = [];

  const inactive = inactiveReferrers(db, 30);

  for (const ref of inactive) {
    const result = await reEngagement(ref.email, ref.days_since_last);
    results.push({ email: ref.email, daysSinceLast: ref.days_since_last, ...result });
  }

  const sent = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`[cron] re-engagement: ${sent} sent, ${failed} failed`);
  res.json({ sent, failed, results });
});

module.exports = router;
