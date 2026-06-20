# Carbon Prime - project context

Premium carbon-fibre **e-commerce site for BMW owners** (UK, direct-to-consumer).
Brand feel: dark, premium, restrained, "spec-sheet" technical. Tone of voice:
confident, technical when needed, speaks to enthusiasts as a peer - never salesy.
UK spelling throughout.

## Tech stack
Plain **static HTML + CSS + vanilla JS**. No framework, no build step, no server.
Runs by opening `index.html` (Live Server recommended). Hosts on any static host.

## File structure
```
carbon-prime-site/
  index.html      home (hero, Carbon Test, range, coating, experience, founders)
  shop.html       product grid in availability sections (available / sold out / coming soon)
  product.html    single product (reads ?id=cp-00X)
  cart.html       basket
  checkout.html   guest checkout (name+email) / sign-in -> delivery -> payment slot
  info.html       policy pages - renders POLICIES[?p] (shipping/returns/warranty/fitment/terms/privacy)
  contact.html    contact details + message form
  account.html    sign in / create account (UI only)
  assets/
    styles.css    ALL styling (design system + page styles)
    main.js        ALL behaviour (nav/footer, products, cart, page logic)
  CLAUDE.md
```

## Key conventions - READ BEFORE EDITING
- **Nav + footer are shared.** They live as `NAV` and `FOOTER` template strings in
  `assets/main.js` and are injected into every page's `#site-header` / `#site-footer`.
  Edit them **once** in main.js - never per-page.
- **Design tokens** are CSS variables in `assets/styles.css` under `:root`
  (colours, `--logo`, `--emboss`, etc.). Re-skin the whole site from there.
- **Products** are generated from `PARTS` (part types + prices) × `RANGES`
  (each chassis/series + its `status`: available | soldout | coming) at the top
  of `main.js`. Add a range = one line in RANGES; add a part = one line in PARTS.
  Coating options are the `COATINGS` array.
- Launch ranges: **4 Series F32 = available**, **3 Series F30 = sold out**,
  **5 Series F10 = coming soon** (shown as sections on shop.html).
- **Cart** persists via `localStorage` key `cp_cart` (in-memory fallback).
- Each page sets `<body data-page="home|shop|product|cart|account">`, which tells
  `main.js` which init function to run.
- **Logo** is embedded as a base64 PNG in the `--logo` CSS variable (transparent,
  embossed). There are tidy PNGs (`logo-mark.png`, `logo-full.png`) in the original
  build folder if needed.

## Brand system
- Colours: near-black base, brushed-chrome silver accents, ONE red action colour
  (`--red`, used only for buttons / "our pick" / active states / focus rings).
- Fonts: Archivo Expanded (display, uppercase), Inter (body), JetBrains Mono
  (labels, prices, chassis codes - the spec-sheet texture).
- Texture: fake carbon-fibre twill via `.weave` (CSS only, no image).

## Contact details (live)
- Email: carbon.prime@outlook.com
- Instagram: carbonprime_uk · TikTok: carbonprime_uk
- Phone: PLACEHOLDER (`+44 (0)000 000 0000`) - replace when available
- YouTube / Discord: PLACEHOLDER links

## Status
**Done:** full front-end - navigation, shop with filter, product page with fitment
selector + coating options (price updates live) + quantity, working cart that
persists across pages, login/register screens, and a guest checkout flow
(name+email or sign-in -> delivery -> payment slot).

**Not built yet (next steps):**
1. **Payments** - checkout button currently shows a "next step" message. Plug in
   Stripe Checkout. The slot is ready: `#paymentSection` / `#payBtn` on
   checkout.html. Stripe UK ≈ 1.5% + 20p, no monthly.
2. **User accounts / auth** - login is UI only, nothing is stored. Don't hand-roll;
   use Shopify accounts, or an auth provider (Supabase / Firebase / Clerk). Consider
   guest checkout first.
3. **Content pages** - Returns, Shipping, Warranty, Terms, Privacy, About, Contact
   (footer links are stubs `#`).
4. **Policy copy** in info.html is starter text in the `POLICIES` object in main.js -
   edit freely; get Terms & Privacy reviewed.
5. **Real product photography** to replace the `.weave` placeholder tiles.
5. Phone number + YouTube/Discord handles.
