Referral Link Generator
Stripe-powered referral system. Customers get unique links → friends get a discount → referrer earns credit.

Quick start
cp .env.example .env   # fill in Stripe keys + BASE_URL
npm install
npm run dev            # http://localhost:3006

## Ship checklist

- [ ] **Stripe keys** — set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` in `.env`
- [ ] **BASE_URL** — set to your production domain (e.g. `https://reflinkgen.com`)
- [ ] **Stripe webhook** — point Stripe dashboard → Webhooks → `https://YOUR_DOMAIN/api/webhooks/stripe` (listen for `checkout.session.completed`)
- [ ] **Stripe coupon** — app auto-creates a referral coupon on first use; verify it appears in Stripe dashboard → Coupons
- [ ] **Deploy** — push Docker image (see below) or deploy to Railway/Render/Fly.io

## Deploy (Docker)

```bash
docker build -t referral-links .
docker run -d -p 3006:3006 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  referral-links
API
Method	Path	Description
POST	/api/links	Generate a referral link
GET	/api/links?productId=X	List links for a product
GET	/api/links/:id	Get link details
POST	/api/redeem	Redeem a referral code (returns Stripe promo)
POST	/api/links/:id/convert	Manually mark conversion
GET	/api/stats/:productId	Aggregate stats
GET	/api/health	Health check
GET	/ref/:code	Incoming referral (redirects + counts click)
POST	/api/webhooks/stripe	Stripe webhook endpoint
Embed widget
Code
· html
<script src="<https://reflinkgen.com/embed.js>"></script>
<script>
  ReferralWidget.init({
    host: '<https://reflinkgen.com>',
    productId: 'my-saas-app',
    referrerEmail: currentUser.email,
    container: '#referral-widget',
  });
</script>
