# Privacy Policy

**Effective Date:** June 2025  
**Last Updated:** June 2025  
**Contact:** privacy@reflinkgen.com

---

## 1. Introduction

Referral Link Generator ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our self-hosted referral software ("Software") and associated services.

**Important:** This Software is self-hosted. You deploy it on your own infrastructure (Railway, Render, Fly.io, VPS, etc.). We do not operate a SaaS platform that collects your data. Your data stays on your servers, in your database, under your control.

---

## 2. Information We Collect

### 2.1 Data You Provide Directly
When you use the Software's admin dashboard or API, you may provide:
- **Account email** — for referrer identification and payout notifications
- **Stripe API keys** — stored in your environment variables, used only to communicate with Stripe on your behalf
- **Product/checkout configuration** — product IDs, discount percentages, reward amounts
- **Referral links generated** — unique codes, referrer emails, click/conversion tracking

### 2.2 Data Collected Automatically
- **HTTP request logs** — IP address, user agent, referrer, timestamp (standard web server logs)
- **Referral click data** — timestamp, referrer code, user agent (for fraud detection)
- **Conversion events** — Stripe webhook payloads (session IDs, amounts, customer emails)

### 2.3 Data from Third Parties
- **Stripe** — customer emails, payment status, subscription details (via webhooks you configure)
- **Your application** — user emails passed to the embed widget for referral link generation

---

## 3. How We Use Your Information

We (the Software running on YOUR infrastructure) use data to:
- Generate unique referral links and Stripe promo codes
- Track clicks and attribute conversions to referrers
- Credit referrer balances when conversions occur
- Display analytics in your admin dashboard
- Send webhook notifications to your configured endpoints
- Prevent fraud (duplicate clicks, self-referrals)

**We do NOT:**
- Send any data to our servers (there are none)
- Share data with third parties except Stripe (which you configure)
- Use data for advertising or profiling
- Retain data beyond what your database stores

---

## 4. Data Storage & Security

- **Database:** SQLite file on your server (`/app/data/referrals.db`)
- **Encryption:** TLS in transit (your domain + SSL), at rest depends on your infrastructure
- **Access control:** Your admin dashboard, your server, your SSH keys
- **Backups:** Your responsibility — back up `/app/data/` directory

---

## 5. Data Retention

- **Referral links & codes:** Until you delete them via dashboard or API
- **Click/conversion logs:** Until you purge the database
- **Referrer balances:** Until paid out or manually reset
- **Stripe webhook events:** Processed and discarded; Stripe retains per their policy

---

## 6. Your Rights

Since you self-host, you have full control:
- **Access:** Query your SQLite database directly
- **Rectify:** Update referrer emails, balances via dashboard/API
- **Erase:** Delete records, drop tables, `rm /app/data/referrals.db`
- **Portability:** Export CSV/JSON from dashboard or `sqlite3 .dump`
- **Restrict/Object:** Disable webhooks, stop embedding widget

---

## 7. Third-Party Services

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| **Stripe** | Payments, coupons, promo codes, webhooks | Customer email, amount, metadata (referral code) |
| **Your hosting provider** | Server, network, SSL | Whatever your provider collects |

---

## 8. Children's Privacy

The Software is not directed at children under 16. You are responsible for compliance with COPPA, GDPR-K, etc. in your implementation.

---

## 9. International Transfers

Your data stays where you deploy. Choose a hosting region (US, EU, APAC) that complies with your requirements.

---

## 10. Changes to This Policy

We may update this policy for new Software versions. Check the GitHub repository CHANGELOG for updates. Continued use of updated Software constitutes acceptance.

---

## 11. Contact

**Data Protection Questions:** privacy@reflinkgen.com  
**GitHub Issues:** https://github.com/amrakg93/referral-link-generator/issues

---

*This policy applies to the Referral Link Generator open-source software. If you use a hosted version from a third party, their privacy policy applies.*
