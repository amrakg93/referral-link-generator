# About Referral Link Generator

**Mission:** Make referral programs accessible to every founder — not just funded startups.

---

## The Problem

Referral marketing is the highest-ROI acquisition channel. But existing tools:

| Tool | Monthly Cost | Model | Setup Time |
|------|-------------|-------|------------|
| Referral Factory | $149+ | Seat-based | Days |
| Cello | $200+ | Rev-share + platform fee | Days |
| Friendbuy | $500+ | Enterprise only | Weeks |
| Custom build | Engineering weeks | Full ownership | Months |

**Pre-revenue founders can't afford $149/mo before making $1.**

---

## Our Solution

**Referral Link Generator** — Stripe-native, self-hosted, revenue-share aligned.

### Core Principles

1. **Stripe-native, not Stripe-adjacent**
   - Uses your existing Stripe account
   - Creates real coupons & promo codes
   - Listens to standard `checkout.session.completed` webhook
   - No Connect, no marketplace, no seller onboarding

2. **Self-hosted = your data, your control**
   - Deploy to Railway, Render, Fly.io, VPS in minutes
   - SQLite database — no external DB needed
   - Your domain, your SSL, your backups
   - Docker image included

3. **Revenue-share pricing = aligned incentives**
   - $0/month until you hit $1K referral revenue
   - Then 5% of referral-attributed revenue
   - No seat fees, no tier jumps, no minimums
   - We only make money when YOU make money

4. **Built for developers, usable by founders**
   - 2-line embed: `<script src=".../embed.js"></script>` + `ReferralWidget.init()`
   - Admin dashboard at `/dashboard` — generate links, view stats, track balances
   - REST API for custom integrations
   - 13 tests passing, CI/CD ready

---

## How It Works (Technical)

```
1. Your user visits your app → widget calls POST /api/links
2. Creates referrer record + unique code (REF-A1B2C3D4) + Stripe promo code
3. Friend clicks /ref/A1B2C3D4 → records click → redirects to your Stripe Checkout with ?promo=REF-A1B2C3D4
4. Friend gets 20% off → completes purchase
5. Stripe fires checkout.session.completed webhook
6. Our webhook matches promo code → marks conversion → credits referrer $10 balance
7. You pay referrer monthly (manual or automated)
```

---

## Team

**Solo founder** building in public. Previously:
- Built and sold 2 micro-SaaS products
- Stripe certified, 10+ production integrations
- Advocate for bootstrapped, revenue-first startups

---

## Roadmap

**v1.1 (Q3 2025):**
- [ ] Email notifications (referral earned, payout ready)
- [ ] CSV export from dashboard
- [ ] Multi-product support per deployment
- [ ] Referral link customization (UTMs, custom slugs)

**v1.2 (Q4 2025):**
- [ ] Affiliate tier (recurring commissions for SaaS subscriptions)
- [ ] White-label embed (remove branding)
- [ ] Webhook retry with exponential backoff
- [ ] Grafana/Prometheus metrics endpoint

**v2.0 (2026):**
- [ ] Multi-tenant mode (host multiple programs on one deploy)
- [ ] Advanced fraud detection (IP velocity, device fingerprinting)
- [ ] Native Stripe Billing integration for subscription referrals

---

## Community

- **GitHub:** https://github.com/amrakg93/referral-link-generator
- **Issues/Feature Requests:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Email:** hello@reflinkgen.com

---

## Press / Logos

Logos and brand assets: `assets/brand/` in repo.  
Attribution appreciated but not required.

---

## Thank You

To every founder who chose to build instead of buy.  
To Stripe for the best payments API.  
To the open-source community for sqlite3, Express, and countless dependencies.

**Let's grow together.** 🚀
