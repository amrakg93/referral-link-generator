'use strict';

const { sendMail } = require('./email');
const config = require('../config');

// ─── Email templates ──────────────────────────────────────────────────────────

const BASE_URL = config.BASE_URL || 'http://localhost:3006';
const DASHBOARD_URL = `${BASE_URL}/dashboard`;

const TEMPLATES = {
  // ── onConversion ──────────────────────────────────────────────────────────
  conversion(options) {
    const { amount, friendEmail } = options;
    const amountLabel = amount != null ? `$${(amount / 100).toFixed(2)}` : 'a reward';
    return {
      subject: '🎉 Someone used your referral link!',
      html: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f6f8fa;color:#1f2937;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fa;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="padding:40px 32px 32px;text-align:center;">
<p style="font-size:48px;margin:0 0 16px;">🎉</p>
<h1 style="font-size:22px;margin:0 0 8px;color:#111827;">New Referral Converted!</h1>
<p style="font-size:15px;color:#6b7280;margin:0 0 24px;line-height:1.5;">
  Someone used your referral link and completed a purchase.<br>
  You've earned <strong style="color:#059669;">${amountLabel}</strong> in rewards.
</p>
${friendEmail ? `<p style="font-size:13px;color:#9ca3af;margin:0 0 24px;">Referred by: ${friendEmail}</p>` : ''}
<a href="${DASHBOARD_URL}" style="display:inline-block;padding:12px 28px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">View My Dashboard</a>
<p style="font-size:13px;color:#9ca3af;margin:24px 0 0;">Keep sharing your link to earn more rewards!</p>
</td></tr>
</table>
<p style="font-size:12px;color:#9ca3af;margin:16px 0 0;">RefLinkGen &middot; <a href="${DASHBOARD_URL}" style="color:#2563eb;">Dashboard</a></p>
</td></tr>
</table>
</body>
</html>`,
    };
  },

  // ── weeklyDigest ──────────────────────────────────────────────────────────
  weeklyDigest(options) {
    const { clicks, conversions, earnings } = options;
    const earningsLabel = earnings != null ? `$${(earnings / 100).toFixed(2)}` : '$0.00';
    const rate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : '0.0';

    return {
      subject: '📊 Your Weekly Referral Digest',
      html: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f6f8fa;color:#1f2937;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fa;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="padding:40px 32px 32px;text-align:center;">
<p style="font-size:48px;margin:0 0 16px;">📊</p>
<h1 style="font-size:22px;margin:0 0 16px;color:#111827;">Your Weekly Report</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr>
<td align="center" style="padding:16px 8px;width:33%;">
<p style="font-size:28px;font-weight:700;color:#2563eb;margin:0 0 4px;">${clicks}</p>
<p style="font-size:13px;color:#6b7280;margin:0;">Clicks</p>
</td>
<td align="center" style="padding:16px 8px;width:33%;">
<p style="font-size:28px;font-weight:700;color:#059669;margin:0 0 4px;">${conversions}</p>
<p style="font-size:13px;color:#6b7280;margin:0;">Conversions</p>
</td>
<td align="center" style="padding:16px 8px;width:33%;">
<p style="font-size:28px;font-weight:700;color:#f59e0b;margin:0 0 4px;">${rate}%</p>
<p style="font-size:13px;color:#6b7280;margin:0;">Conversion&nbsp;Rate</p>
</td>
</tr>
</table>
<p style="font-size:15px;color:#374151;margin:0 0 24px;line-height:1.5;">
  You've earned <strong style="color:#059669;">${earningsLabel}</strong> in rewards this week.
</p>
<a href="${DASHBOARD_URL}" style="display:inline-block;padding:12px 28px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">See Full Stats</a>
</td></tr>
</table>
<p style="font-size:12px;color:#9ca3af;margin:16px 0 0;">RefLinkGen &middot; <a href="${DASHBOARD_URL}" style="color:#2563eb;">Dashboard</a></p>
</td></tr>
</table>
</body>
</html>`,
    };
  },

  // ── reEngagement ──────────────────────────────────────────────────────────
  reEngagement(options) {
    const { daysSinceLastActivity } = options;
    const days = daysSinceLastActivity || 30;
    return {
      subject: '👋 It\'s been quiet — your referral link is still active',
      html: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f6f8fa;color:#1f2937;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fa;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="padding:40px 32px 32px;text-align:center;">
<p style="font-size:48px;margin:0 0 16px;">👋</p>
<h1 style="font-size:22px;margin:0 0 8px;color:#111827;">It's been a while</h1>
<p style="font-size:15px;color:#6b7280;margin:0 0 24px;line-height:1.5;">
  It's been <strong>${days} days</strong> since your last referral activity.<br>
  Your referral link is still active and ready to share!
</p>
<a href="${DASHBOARD_URL}" style="display:inline-block;padding:12px 28px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">Share My Link</a>
<p style="font-size:13px;color:#9ca3af;margin:24px 0 0;">Share your link on social media, in emails, or on your website to start earning rewards again.</p>
</td></tr>
</table>
<p style="font-size:12px;color:#9ca3af;margin:16px 0 0;">RefLinkGen &middot; <a href="${DASHBOARD_URL}" style="color:#2563eb;">Dashboard</a></p>
</td></tr>
</table>
</body>
</html>`,
    };
  },
};

// ─── Public functions ─────────────────────────────────────────────────────────

/**
 * Notify a referrer that someone used their referral link.
 * @param {string} referrerEmail
 * @param {number} amount - reward in cents
 * @param {string} [friendEmail] - email of the referred friend
 */
async function onConversion(referrerEmail, amount, friendEmail) {
  const tpl = TEMPLATES.conversion({ amount, friendEmail });
  return sendMail({ to: referrerEmail, ...tpl });
}

/**
 * Send a weekly stats digest to a referrer.
 * @param {string} referrerEmail
 * @param {number} clicks
 * @param {number} conversions
 * @param {number} earnings - in cents
 */
async function weeklyDigest(referrerEmail, clicks, conversions, earnings) {
  const tpl = TEMPLATES.weeklyDigest({ clicks, conversions, earnings });
  return sendMail({ to: referrerEmail, ...tpl });
}

/**
 * Re-engagement email when a referrer has been inactive.
 * @param {string} referrerEmail
 * @param {number} daysSinceLastActivity
 */
async function reEngagement(referrerEmail, daysSinceLastActivity) {
  const tpl = TEMPLATES.reEngagement({ daysSinceLastActivity });
  return sendMail({ to: referrerEmail, ...tpl });
}

module.exports = { onConversion, weeklyDigest, reEngagement };
