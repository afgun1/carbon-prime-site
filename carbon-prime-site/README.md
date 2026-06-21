# Carbon Prime - Website

Premium carbon-fibre e-commerce site for BMW (UK, direct-to-consumer).
Plain static HTML/CSS/JS - no framework, no build step - with a handful of
Netlify serverless functions for Stripe payments and email capture.

**Live site:** https://carbonprime.netlify.app
**Contact:** carbon.prime@outlook.com · Instagram/TikTok: @carbonprime_uk

---

## 1. Quick start (run locally)

Open the folder in VS Code and use the **Live Server** extension
(right-click `index.html` → "Open with Live Server"), or just open
`index.html` in a browser.

Note: the Stripe payment step and email capture call serverless functions
that only run on Netlify. Locally the site works, but the final "pay" step
won't complete unless you run `netlify dev` (Netlify CLI) with the
environment variables set (see section 6).

---

## 2. Deploy / update workflow

The site auto-deploys from GitHub to Netlify. To push an update:

1. Replace your local files with the latest version.
2. In **GitHub Desktop**: review the changed files, write a commit message,
   click **Commit to main**, then **Push origin**.
3. Netlify detects the push and rebuilds automatically (~30 seconds).
4. Hard-refresh the live site (Ctrl/Cmd + Shift + R).

Do **not** redeploy manually in the Netlify dashboard - pushing to GitHub is
free and triggers the deploy on its own.

---

## 3. Pages

| File            | Purpose                                          | Indexed by Google |
|-----------------|--------------------------------------------------|-------------------|
| `index.html`    | Home / hero / brand                              | Yes               |
| `shop.html`     | Product grid by chassis (F32 / F30 / F10)        | Yes               |
| `product.html`  | Single product, reads `?id=CHASSIS-KEY`          | Yes               |
| `cart.html`     | Basket (localStorage)                            | No (noindex)      |
| `checkout.html` | Guest checkout + Stripe payment                  | No (noindex)      |
| `info.html`     | Policies, reads `?p=POLICY`                       | Yes               |
| `contact.html`  | Contact details + message form                   | Yes               |
| `account.html`  | Sign in / register (UI only, **unlinked**)       | No (noindex)      |

Account pages exist but are not linked anywhere (no account system yet -
guest checkout only). Kept for a future Phase 2.

---

## 4. Architecture

Everything shared lives in two files:

- **`assets/styles.css`** - all styling and design tokens (colours, fonts).
- **`assets/main.js`** - all behaviour, the product data, and the shared
  nav/footer (injected into every page from `NAV` / `FOOTER` template
  strings).

### Product data
Products are generated from two arrays in `main.js`:
- `PARTS` - the five products (splitter, spoiler, diffuser, skirts, mirror)
  with name, price, category, images.
- `RANGES` - the chassis (F32 available, F30 sold out, F10 coming soon).

`PRODUCTS` is the cross-product of these, built on load. A product `id` is
`chassis.toLowerCase() + "-" + key`, e.g. `f32-splitter`.

### Cart
Stored in `localStorage` under key `cp_cart`. Each item carries its name,
price, fitment, coating choice, quantity, and `cardImg` (for the thumbnail).

### Coating options (`COATINGS` in main.js)
- **Standard** - included, £0 (always selected).
- **Coating upgrade service** - +£30, marked `available:false` (Coming soon).
- **DIY ceramic kit** - +£10, marked `available:false` (Coming soon).
To launch a coating option, set its `available` to `true`.

---

## 5. Key features & where they live

| Feature                  | Location                                                        |
|--------------------------|-----------------------------------------------------------------|
| Promo popup (10% off)    | `index.html` markup + `initPromoPopup()` in `main.js`           |
| Coupon code (`CARBON10`) | `initCheckout()` in `main.js` - see `validCoupons`              |
| Shipping (free UK / £15) | `initCheckout()` - calculated from the country field            |
| Checkout validation      | `initCheckout()` - name, email, address, UK/intl postcode       |
| Stripe payment (embedded)| `create-payment-intent.js` + Stripe Elements in `initCheckout()`|
| Order success message    | `checkout.html` (`#coSuccess`) + success check in `initCheckout`|
| Toast notifications       | `toast(msg, showBasket)` in `main.js`                          |
| SEO meta / schema        | Per-page `<head>` + `setProductSEO()` in `main.js`             |

---

## 6. Serverless functions (Netlify)

Located in `netlify/functions/`:

| File                       | Purpose                                                     |
|----------------------------|-------------------------------------------------------------|
| `create-payment-intent.js` | **Active.** Creates a Stripe PaymentIntent for embedded pay |
| `get-stripe-key.js`        | Serves the publishable key to the frontend                  |
| `add-promo-email.js`       | Logs promo signup emails (connect Mailchimp here later)     |
| `create-checkout.js`       | **Legacy** - old redirect-to-Stripe flow, no longer used    |

These call the Stripe REST API directly (no npm dependency).

### Required environment variables (set in Netlify dashboard)
- `STRIPE_SECRET_KEY` - secret key (`sk_test_…` for testing, `sk_live_…` for
  real payments). **Tick "Secret value".**
- `STRIPE_PUBLIC_KEY` - publishable key (`pk_test_…` / `pk_live_…`).
- `URL` - provided automatically by Netlify (used for success/cancel redirects).
- `EMAILOCTOPUS_API_KEY` - EmailOctopus API key (**tick "Secret value"**).
- `EMAILOCTOPUS_LIST_ID` - the ID of the "Members" list signups go into.

---

## 7. Payments - test vs live

Currently in **test mode**. To test a payment use Stripe's test card:
`4242 4242 4242 4242`, any future expiry, any CVC.

**To go live:** swap the two Netlify environment variables from the `_test_`
keys to your `_live_` keys, then redeploy. Use a real card to confirm.

---

## 8. SEO

- Every page has a unique title, meta description, canonical URL, and
  Open Graph / Twitter card tags.
- `index.html` carries Organization schema; product pages get Product schema
  (price + availability) injected by `setProductSEO()`.
- `robots.txt` and `sitemap.xml` are in the project root.
- After deploy: verify the site in **Google Search Console** and submit
  `https://carbonprime.netlify.app/sitemap.xml`.

**Custom domain:** all SEO tags currently use `carbonprime.netlify.app`.
When a real domain is purchased, update the canonical/OG URLs across all
pages, plus `robots.txt` and `sitemap.xml`, to the new domain.

---

## 9. Conventions

- No em dashes or en dashes in copy (use hyphens).
- Product image filenames use a double extension, e.g.
  `f32-splitter1.jpg.webp` (preserved deliberately - match exactly in code).
- Always run a JS syntax check (`node --check assets/main.js`) before
  committing.

---

## 10. Known pending items

- Branded order-confirmation email (Stripe sends a receipt; see note below).
- Policy copy (Terms / Privacy) flagged as templates - review before launch.
- Accounts/login backend (Phase 2 - guest checkout for now).
- F30 uses F32 images as placeholders until real photos exist.
- Custom domain not yet purchased.

---

## 11. Changelog

- **2026-06-21** - Removed placeholder phone number, YouTube and Discord
  icons from footer (Instagram + TikTok remain). Full project audit: all JS
  valid, HTML SEO tags consistent, CSS balanced, no stale account refs.
- **2026-06-21** - Wired popup signups to EmailOctopus (v2 API, Bearer auth,
  PUT upsert endpoint) via `add-promo-email.js`; requires
  `EMAILOCTOPUS_API_KEY` and `EMAILOCTOPUS_LIST_ID` env vars in Netlify.
  Stripe branded receipts enabled in dashboard (customer order confirmation).
- **2026-06-20** - SEO pass (per-page meta, OG, product schema, robots.txt,
  sitemap.xml); removed catch-all redirect; hid account links from nav and
  footer; added full documentation to this README.
- **2026-06-20** - Country-aware shipping (free UK / £15 international) and
  postcode validation; checkout field validation; "View basket" toast fix.
- **2026-06-20** - Promo popup (10% off) and `CARBON10` coupon at checkout;
  hid sign-in tab on checkout; coating options reworked (+£30 service /
  +£10 DIY, both Coming soon).
- **2026-06-20** - Stripe embedded payment (Elements) replacing redirect
  flow; order success page; cart thumbnails.
- Earlier - Initial multi-page static build, product galleries, GitHub +
  Netlify deploy.
