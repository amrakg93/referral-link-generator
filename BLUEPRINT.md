# Referral Link Generator — Project Blueprint

> **Status:** LIVE
> **URL:** https://reflinkgen.com
> **Last Updated:** July 1, 2026

---

## 1. Executive Summary

Referral Link Generator is a Stripe-native referral engine + G2/Capterra review collector for indie hackers and early-stage SaaS founders. Embed a 2-line widget, and users get unique referral links with Stripe promo codes automatically. Conversion tracking via Stripe webhooks. Flat pricing — $0 Starter (up to $500/mo) and $29/mo Pro.

**Tagline:** *Stripe-native referrals for indie hackers.*

**MIT Licensed** — self-host with Docker or use the hosted version.

---

## 2. Architecture

```
┌──────────────────────────────────────────────┐
│              Railway (Express/Node.js)        │
│  Landing  /pricing  /dashboard  /about       │
│  /privacy  /terms                            │
│  /api/links  (REST referral API)             │
│  /api/reviews  (G2 review collection)        │
│  /api/webhooks  (Stripe webhook receiver)    │
│  /api/subscriptions  (billing mgmt)          │
│  /api/cron  (scheduled task triggers)        │
│  /ref/{code}  (redirect + click tracking)    │
│  /embed.js  (vanilla JS widget)              │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│            SQLite database                    │
│  Referrers table                             │
│  Referral links table                        │
│  Clicks table                                │
│  Conversions table                           │
│  Reviews table (G2/Capterra requests)        │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│              Stripe                           │
│  Creates coupons & promo codes via API       │
│  Webhook: checkout.session.completed         │
│  → matches promo code → credits referrer     │
└──────────────────────────────────────────────┘
```

### Data Flow

```
Customer visits SaaS app → widget loads
  ├── POST /api/links → creates referrer + unique code REF-A1B2C3D4
  │                     + creates Stripe promo code (20% off)
  └── Widget renders: share link, copy button, social buttons

Friend clicks /ref/A1B2C3D4
  ├── Records click in DB
  ├── Redirects to Stripe Checkout with ?promo=REF-A1B2C3D4
  └── Friend gets discount

Stripe fires checkout.session.completed
  ├── Webhook matches promo code → referrer
  ├── Marks conversion in DB
  ├── Credits referrer $10 balance
  └── Optionally triggers review request (after N conversions)
```

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Hosting** | Railway (hikari CDN edge) | Node.js hosting, auto SSL, global CDN |
| **Domain** | reflinkgen.com | Custom domain |
| **Backend** | Express.js (Node) | API server, route handling |
| **Database** | SQLite (better-sqlite3) | Referral data, clicks, conversions |
| **Payments** | Stripe API | Coupon creation, promo codes, webhooks |
| **Security** | Helmet.js | CSP, HSTS, security headers |
| **Frontend** | Plain HTML + CSS (no framework) | Marketing pages |
| **Dashboard** | Vanilla JS SPA (no framework) | Admin UI |
| **Embed Widget** | Vanilla JS (IIFE) | 2-line drop-in widget |
| **Email** | Nodemailer | Referral digests, re-engagement |
| **Scheduler** | node-cron | Weekly digests, re-engagement emails |
| **Container** | Docker (Dockerfile) | Self-host option |
| **Analytics** | Plausible | Privacy-first page analytics |

---

## 4. File Tree

```
referral-link-generator/
├── src/
│   ├── index.js                  ← Express server (143 lines)
│   ├── config/
│   │   └── index.js              ← Env config loader
│   ├── models/
│   │   └── db.js                 ← SQLite init + queries
│   ├── public/                   ← Static files (served at /)
│   │   ├── landing.html          ← Marketing landing page (498 lines)
│   │   ├── pricing.html          ← Pricing page (497 lines)
│   │   ├── index.html            ← Dashboard SPA (563 lines)
│   │   ├── about.html            ← About page
│   │   ├── privacy.html          ← Privacy policy
│   │   ├── terms.html            ← Terms of service
│   │   ├── embed.js              ← Embed widget (70 lines)
│   │   ├── robots.txt            ← SEO crawl instructions
│   │   ├── sitemap.xml           ← SEO page index
│   │   └── favicon.svg           ← Tab icon
│   ├── routes/
│   │   ├── referrals.js          ← Referral link CRUD API
│   │   ├── reviews.js            ← Review request API
│   │   ├── subscriptions.js      ← Stripe subscription API
│   │   ├── webhooks.js           ← Stripe webhook handler
│   │   └── cron.js               ← HTTP-triggered cron endpoints
│   └── services/
│       ├── stripe.js             ← Stripe API wrapper
│       ├── email.js              ← SMTP email sender
│       └── notifications.js      ← Digest + re-engagement logic
├── tests/
│   └── referrals.test.js         ← API tests
├── data/
│   └── app.db                    ← SQLite database (gitignored)
├── .env                          ← Local env vars (gitignored)
├── .env.example                  ← Template for env vars
├── .dockerignore
├── Dockerfile                    ← Docker image for self-host
├── package.json
├── README.md
├── PRIVACY.md                    ← Source for privacy.html
├── TERMS.md                      ← Source for terms.html
├── ABOUT.md                      ← Source for about.html
└── BLUEPRINT.md                  ← This document
```

---

## 5. Build Roadmap

### Phase 1: Core MVP (Complete)
| Task | Detail |
|------|--------|
| Stripe coupon/promo code integration | Auto-create promo codes per referrer |
| Referral link generation | Unique codes, click tracking |
| Redirect service | `/ref/{code}` → Stripe Checkout with promo |
| Conversion webhook | `checkout.session.completed` → credits referrer |
| Embed widget | Vanilla JS IIFE, 2-line embed |
| Admin dashboard | Link management, stats, referrer list |
| SQLite persistence | All referral data stored locally |

### Phase 2: Reviews & Retention (Complete)
| Task | Detail |
|------|--------|
| G2/Capterra review collection | Track user activity, send review requests |
| Weekly digest emails | Click/conversion stats to referrers |
| Re-engagement emails | Nudge inactive referrers (30+ days) |
| node-cron scheduler | Automated email delivery |
| Subscription billing | Stripe subscriptions for Pro tier |

### Phase 3: Marketing & Launch (Complete)
| Task | Detail |
|------|--------|
| Landing page | Hero, features grid, how it works, comparison table |
| Pricing page | Tier comparison, CTA |
| Legal pages | Privacy, Terms, About |
| SEO infrastructure | robots.txt, sitemap.xml, canonical URLs |
| JSON-LD structured data | WebApplication + FAQPage schemas |
| Open Graph / Twitter Cards | Social share metadata |
| Analytics | Plausible snippet installed |
| Docker image | Self-host deployment package |

### Phase 4: Growth (Planned)
| Task | Detail |
|------|--------|
| Product Hunt launch | Prepare listing, assets, first supporters |
| Blog/content marketing | Long-tail SEO for "Stripe referral program" |
| Stripe Connect expansion | Managed account referrals |
| Multi-workspace | Team accounts |
| API key management | Self-serve API keys for devs |
| Automated onboarding | Welcome email series for new signups |

---

## 6. Feature Inventory

| Feature | Detail | Status |
|---------|--------|--------|
| **Stripe-native referral links** | Coupons, promo codes via Stripe API | ✅ Live |
| **2-line embed widget** | `embed.js` — init with email, renders instantly | ✅ Live |
| **Conversion webhook** | `checkout.session.completed` → credits referrer | ✅ Live |
| **Click tracking** | Each referral link click recorded with timestamp | ✅ Live |
| **Admin dashboard** | Link gen, stats, clicks, conversions, referrer balances | ✅ Live |
| **G2/Capterra review collection** | Auto-request reviews after N conversions | ✅ Live |
| **Weekly digest emails** | Stats sent to referrers every Monday | ✅ Live |
| **Re-engagement emails** | Nudge referrers inactive 30+ days | ✅ Live |
| **Self-host option** | Docker image, MIT license, your data | ✅ Live |
| **Flat pricing** | $0 Starter (up to $500/mo), $29/mo Pro | ✅ Live |
| **Comparison table** | vs Referral Factory, Cello, Friendbuy | ✅ Live |
| **Security headers** | CSP, HSTS, XFO, referrer-policy | ✅ Live |
| **SEO infrastructure** | robots.txt, sitemap, canonical, OG tags, JSON-LD | ✅ Live |
| **Analytics** | Plausible privacy-first tracking | ✅ Live |
| **Favicon** | Branded SVG tab icon | ✅ Live |
| **Cron endpoints** | HTTP-triggered cron for external schedulers | ✅ Backend |

---

## 7. UI Layout & Visual Design

### Brand Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#ffffff` | Page bg |
| Accent | `#533afd` | CTAs, links, buttons |
| Accent hover | `#4434d4` | Button hover |
| Heading | `#061b31` | Headings |
| Body | `#64748d` | Body text |
| Label | `#273951` | Labels |
| Border | `#e5edf5` | Card/section borders |
| Border accent | `#b9b9f9` | Active/focus borders |
| Brand dark | `#1c1e54` | Dark section bg |
| Ruby | `#ea2261` | Secondary accent |
| Magenta | `#f96bee` | Code syntax |
| Success | `#15be53` | Badges, checks |
| Success text | `#108c3d` | Badge text |
| Radius | `4px` / `6px` / `8px` | Buttons / cards / containers |
| Font heading | `Source Sans 3` (300–600) | All body, headings |
| Font mono | `Source Code Pro` (400–700) | Code, embeds |

### Page Layouts

| Page | Layout | Key Elements |
|------|--------|-------------|
| Landing | Full-width light | Hero with embed code, features grid, how-it-works dark section, comparison table, testimonials, CTA |
| Pricing | Card layout light | Two pricing cards (Starter, Pro), feature comparison, FAQ |
| About | Article light | Description, features, pricing, open source info |
| Privacy/Terms | Article light | Sections with headings, legal content |
| Dashboard | App layout light | Setup panel, stat cards, link generation, data table |

### Design Notes
- Light theme throughout — professional SaaS feel
- Scroll-triggered fade-up animations via IntersectionObserver
- `prefers-reduced-motion` respected
- Semantic HTML with ARIA labels
- Responsive: mobile-first breakpoints at 640px and 1024px

---

## 8. Pricing Strategy

| Tier | Price | Limits | Target |
|------|-------|--------|--------|
| **Starter** | $0 | Up to $500/mo referral revenue + 10 reviews/mo | Pre-revenue founders, testing |
| **Pro** | $29/mo or $299/yr | Unlimited everything | Growing SaaS with active referrals |

### Competitive Positioning
| Competitor | Price | Stripe-native | Self-host | Free tier |
|-----------|-------|:-------------:|:---------:|:---------:|
| **Referral Link Generator** | **$0–$29/mo** | **✅ Native** | **✅ Yes** | **✅ $500/mo** |
| Referral Factory | $149+/mo | Separate dashboard | ❌ | 14-day trial |
| Cello | $200+/mo | Custom webhooks | ❌ | 14-day trial |
| Friendbuy | $500+/mo | Custom webhooks | ❌ | Demo only |

**Strategy:** Free tier removes adoption friction. When referral revenue exceeds $500/mo, the upsell is natural — the product pays for itself. No percentage of revenue builds trust. Annual plan ($299/yr = $24.92/mo) incentivizes commitment.

---

## 9. SEO & Content Strategy

### Technical SEO
| Element | Status | Detail |
|---------|--------|--------|
| robots.txt | ✅ | Allow all, points to sitemap |
| Sitemap.xml | ✅ | 6 URLs (root, pricing, about, dashboard, legal) |
| Canonical URLs | ✅ | All pages have self-referencing canonicals |
| Meta descriptions | ✅ | Unique on every page |
| Semantic HTML | ✅ | h1/h2/h3 hierarchy, article tags |
| Mobile responsive | ✅ | CSS flexbox + breakpoints |
| SSL / HTTPS | ✅ | Railway auto SSL (TLSv1.3) |
| HSTS | ✅ | `max-age=31536000; includeSubDomains` |
| JSON-LD | ✅ | WebApplication + FAQPage schemas |
| Open Graph | ✅ | og:title, og:description, og:image on all pages |
| Twitter Cards | ✅ | summary_large_image on marketing pages |

### Content Marketing (Planned)
| Asset | Target Keywords |
|-------|----------------|
| Product Hunt launch | — |
| Blog posts | "Stripe referral program", "indie hacker referrals", "SaaS referral links" |

### Search Console
| Engine | Property | Status |
|--------|----------|--------|
| Google | `https://reflinkgen.com` | ❌ Not submitted |
| Bing | `https://reflinkgen.com` | ❌ Not submitted |

---

## 10. Domain & DNS

| Setting | Value | Provider |
|---------|-------|---------|
| **Domain** | reflinkgen.com | — |
| **Hosting** | Railway (hikari CDN) | Railway.app |
| **SSL** | Auto (TLSv1.3, HSTS enabled) | Railway |
| **DNS** | Railway-managed (CNAME to railway.app) | Railway |

---

## 11. Launch Checklist

### Done
- [x] Landing page (hero, features, how it works, comparison, testimonials, CTA)
- [x] Pricing page (2 tiers, feature comparison)
- [x] Admin dashboard (setup, stats, link generation, table)
- [x] Embed widget (embed.js — 2-line drop-in)
- [x] Stripe integration (coupons, promo codes, webhooks)
- [x] Referral link generation API
- [x] Click tracking + redirect service
- [x] Conversion webhook (checkout.session.completed)
- [x] G2/Capterra review collection
- [x] Weekly digest emails (node-cron)
- [x] Re-engagement emails (30+ day inactive)
- [x] Privacy policy
- [x] Terms of service
- [x] About page
- [x] Docker image
- [x] robots.txt
- [x] Sitemap.xml
- [x] Canonical URLs on all pages
- [x] JSON-LD structured data (WebApplication + FAQPage)
- [x] Open Graph / Twitter Card meta tags
- [x] Plausible analytics
- [x] Favicon (SVG)
- [x] Security headers (CSP, HSTS, XFO, referrer-policy)
- [x] CORS scoped to production origin

### Pending
- [ ] Google Search Console verification
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Product Hunt launch
- [ ] Blog / content marketing
- [ ] Welcome email series for new signups

---

## 12. Revenue Model

```
Landing page / GitHub / Word of mouth (acquisition)
    │
    ▼
Signs up for free Starter tier (conversion: 5-15%)
    │  $0/mo — up to $500/mo referral revenue
    │  Upsell trigger: hits $500/mo cap naturally
    ▼
Upgrades to Pro ($29/mo or $299/yr)
    │  Target conversion: 10-20% of active Starter users
    │  No hard cap → natural growth path
    ▼
Monthly recurring revenue (MRR)
    └── 10 Pro × $29 = $290/mo (breakeven at ~$290/mo infra)
    └── 50 Pro × $29 = $1,450/mo (profit)
    └── 100 Pro × $29 = $2,900/mo (growth)
    └── 500 Pro × $29 = $14,500/mo (scale)
    └── 1,000 Pro × $29 = $29,000/mo
    └── 8,620 Pro × $29 = $250,000/mo (250k MMR target)
```

**Key metric:** Referral revenue tracked tells us when users naturally hit the cap — that's the conversion trigger. No artificial upsell popups needed.

### Path to $250k MRR

A single $29/mo tier requires ~8,620 paying customers to hit $250k MRR. The path requires expanding the pricing ladder:

| Tier | Price | Target | Users for $250k MRR |
|------|-------|--------|-------------------|
| **Pro** (current) | $29/mo | Indie hackers, early SaaS | 8,620 |
| **Pro Annual** (current) | $24.92/mo | Cost-conscious founders | 10,032 |
| **Growth** (planned) | $99/mo | Growing SaaS (10k+ users) | 2,525 |
| **Scale** (planned) | $299/mo | Agencies, multi-product | 836 |
| **Enterprise** (planned) | Custom | Large orgs, SLAs | ~20-50 |

**Realistic mix for $250k MRR:**
```
60% Pro ($29)        = 5,172 users × $29   = $150k MRR
25% Growth ($99)     = 631 users × $99     = $62.5k MRR
10% Scale ($299)     = 84 users × $299     = $25k MRR
 5% Enterprise       = ~10 clients × $1.5k = $15k MRR
```

### How the product makes money

1. **Self-serve subscriptions (Pro)** — Stripe handles billing. $29/mo or $299/yr.
   Free tier (Starter) acts as lead gen. Users hit $500/mo referral cap → upgrade to Pro.
2. **No revenue share** — Flat pricing builds trust with indie hackers who hate
   percentage-based pricing.
3. **Annual commitment** — $299/yr ($24.92/mo) improves retention + upfront cash.
4. **Self-hosted is NOT revenue** — Docker/MIT option is free. It drives adoption
   and word-of-mouth. Revenue comes from the hosted version's convenience value.
5. **Future upsell paths:** Usage-based add-ons (extra review requests beyond
   plan), white-label branding ($99/mo), dedicated support ($299/mo).

---

## 13. Lessons Learned

### What Worked
1. **Plain HTML + no framework** — Instant loads, easy maintenance, no build step
2. **Stripe-native approach** — Users already trust Stripe; coupons & promo codes are familiar; no separate payment system
3. **Free tier with usage cap** — $500/mo is generous enough to be useful but creates natural upgrade path
4. **Docker + self-host** — MIT license eliminates vendor lock-in objection for technical founders
5. **SQLite** — Zero infrastructure for MVP; single file backup; easy self-host
6. **Vanilla JS embed** — No build tooling required; drop script tag and go

### What to Avoid
1. **Missing SEO infra at launch** — robots.txt, sitemap, OG tags should ship day 1, not after
2. **No favicon** — Subtle but unprofessional in browser tabs
3. **Missing canonical URLs** — Risk of duplicate content with multiple paths
4. **No structured data** — Zero rich result potential without JSON-LD
5. **GitHub repo visibility** — If the repo is private, remove GitHub links from public site to avoid 404s

---

*Template: BLUEPRINT-TEMPLATE.md — Created July 1, 2026*
