# Carbon Prime - website

Premium carbon-fibre e-commerce site for BMW (UK, DTC). Plain static
HTML/CSS/JS - no framework, no build step. See `CLAUDE.md` for how it's
built and what's still to do.

## Run it locally
Open the folder in VS Code and use the **Live Server** extension
(right-click `index.html` → "Open with Live Server"). Or just open
`index.html` in a browser.

## Pages
`index` (home) · `shop` · `product` · `cart` · `checkout` (guest) ·
`account` · `info` (policies) · `contact`. Shared design is in
`assets/styles.css`; all behaviour + the product list + the shared
nav/footer are in `assets/main.js`.

## Deploy it (make it live)

### Option A - GitHub Pages (static only, fastest)
1. Push this folder to a GitHub repo.
2. Repo → Settings → Pages → Source: `main` branch, root.
3. Live at `https://<you>.github.io/<repo>/` in a minute or two.
Note: GitHub Pages cannot run server code, so the full cart checkout
can't take payment here - you'd use Stripe **Payment Links** (per-product
buy buttons) instead.

### Option B - Netlify / Vercel / Cloudflare Pages (recommended)
Free, deploys automatically from this GitHub repo (push → live), AND can
run the small serverless function that Stripe Checkout needs.
1. Create a free account, "Add new site → Import from GitHub", pick this repo.
2. No build command needed (it's static); publish directory = repo root.
3. Add a serverless function later for Stripe (see below).

## Adding Stripe (taking payment)
- The checkout payment slot is `#paymentSection` / `#payBtn` in
  `checkout.html` + `initCheckout()` in `main.js`.
- Quick/no-backend: Stripe **Payment Links** - make a link per product in
  the Stripe dashboard, point the buy button at it.
- Proper cart checkout: a serverless function (Netlify/Vercel) creates a
  Stripe Checkout Session. Your **secret key** goes in the host's
  environment variables - NEVER in this repo (that's why `.env` is gitignored).

## Status
Front-end is complete (navigation, shop, product, working cart, guest
checkout, policies, contact). Not yet wired: card payments (Stripe),
contact/newsletter form submission (a form service), and user accounts.
