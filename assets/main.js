/* ============================================================
   CARBON PRIME - shared site engine (runs on every page)
   - injects the nav + footer so there's ONE copy to edit
   - holds the product list
   - runs a real cart that remembers items across pages
   The login + checkout are front-end only for now; the Stripe
   payment layer plugs in later (see the checkout note on cart).
   ============================================================ */

/* ---------- 1. PRODUCT CATALOGUE ----------
   PARTS = the part types (name, price, copy). RANGES = each chassis/series
   and its availability. PRODUCTS is built automatically from the two:
   to launch a new range, add ONE line to RANGES; to add a part, add to PARTS.
   status: "available" | "soldout" | "coming". */
const PARTS = [
  { key:"splitter", name:"Front Splitter", cat:"Aero", ghost:"Splitter", price:145,
    cardImg:"images/f32-splitter1.jpg.webp",
    allImgs:["images/f32-splitter1.jpg.webp","images/f32-splitter2.jpg.webp","images/f32-splitter3.jpg.webp","images/f32-splitter4.jpg.webp","images/f32-splitter5.jpg.webp"],
    blurb:"A clean front lip that sharpens the nose without shouting. Inspected for fit before it ships.",
    specs:{ material:"Real 2x2 twill carbon, gloss clear coat.", fitment:"Direct fit to the front bumper. Fixings and guide included.", coating:"Ceramic coated as standard.", shipping:"UK dispatch in 3-5 working days. 30-day returns." } },
  { key:"spoiler", name:"Boot Spoiler", cat:"Exterior", ghost:"Spoiler", price:135,
    cardImg:"images/f32-spoiler-hero.jpg.webp",
    allImgs:["images/f32-spolier1.jpg.webp","images/f32-spoiler3.jpg.webp","images/f32-spoiler5.jpg.webp","images/f32-spoiler6.jpg.webp"],
    blurb:"A subtle lip spoiler that lifts the rear lines. Pre-fit checked and clean-edged.",
    specs:{ material:"Real carbon, gloss clear coat.", fitment:"Fits the boot lid. 3M adhesive backed.", coating:"Ceramic coated as standard.", shipping:"UK dispatch in 2-3 working days. 30-day returns." } },
  { key:"diffuser", name:"Rear Diffuser", cat:"Aero", ghost:"Diffuser", price:135,
    cardImg:"images/f32-diffuser2.jpg.webp",
    allImgs:["images/f32-diffuser2.jpg.webp","images/f32-diffuser6.jpg.webp","images/f32-diffuser7.jpg.webp","images/f32-diffuser8.jpg.webp","images/f32-diffuser11.jpg.webp"],
    blurb:"Full carbon rear diffuser to finish the back end. Photographed before packing.",
    specs:{ material:"Real carbon, deep gloss clear coat.", fitment:"Fits the rear bumper. Hardware included.", coating:"Ceramic coated as standard.", shipping:"UK dispatch in 3-5 working days. 30-day returns." } },
  { key:"skirts", name:"Side Skirt Extensions", cat:"Aero", ghost:"Skirts", price:115,
    cardImg:"images/f32-side-skirt2.jpg.webp",
    allImgs:["images/f32-side-skirt2.jpg.webp","images/f32-side-skirt3.jpg.webp","images/f32-side-skirt6.jpg.webp","images/f32-side-skirt7.jpg.webp","images/f32-side-skirt8.jpg.webp"],
    blurb:"Side skirt extensions that tie the front and rear together and tighten the stance.",
    specs:{ material:"Real carbon, gloss clear coat.", fitment:"Fits along the sills. Fixings and guide included.", coating:"Ceramic coated as standard.", shipping:"UK dispatch in 3-5 working days. 30-day returns." } },
  { key:"mirror", name:"Wing Mirror Caps", cat:"Exterior", ghost:"Mirrors", price:115,
    cardImg:"images/f32-wing-mirror2.jpg.webp",
    allImgs:["images/f32-wing-mirror2.jpg.webp","images/f32-wing-mirror1.jpg.webp","images/f32-wing-mirror10.jpg.webp","images/f32-wing-mirror5.jpg.webp","images/f32-wing-mirror8.jpg.webp"],
    blurb:"Replacement carbon caps that snap over the originals. The easiest way to start a build.",
    specs:{ material:"Real carbon, UV-stable clear coat.", fitment:"Direct replacement caps. No trimming.", coating:"Ceramic coated as standard.", shipping:"UK dispatch in 2-3 working days. 30-day returns." } }
];

const RANGES = [
  { chassis:"F32", series:"4 Series", status:"available" },
  { chassis:"F30", series:"3 Series", status:"soldout" },
  { chassis:"F10", series:"5 Series", status:"coming", 
    teaserImgs:{splitter:"images/F10_Front_splitter.webp", spoiler:"images/F10_boot_spoiler.webp", diffuser:"images/F10_rear_diffuser.webp", skirts:"images/F10_side_skirts.webp", mirror:"images/F10_mirror_caps.webp"} }
];

const PRODUCTS = [];
RANGES.forEach(r => PARTS.forEach(pt => {
  const p = {
    id: r.chassis.toLowerCase() + "-" + pt.key,
    name: pt.name, cat: pt.cat, ghost: pt.ghost, price: pt.price,
    series: r.series, chassis: r.chassis, status: r.status,
    fits: [r.chassis], blurb: pt.blurb, specs: pt.specs,
    cardImg: pt.cardImg, allImgs: pt.allImgs
  };
  if(r.status==="coming" && r.teaserImgs) p.cardImg = r.teaserImgs[pt.key];
  PRODUCTS.push(p);
}));

/* coating choices shared by every product (price delta in £) */
const COATINGS = [
  { id:"standard", label:"Standard - included", note:"Ceramic coated before dispatch", delta:0 },
  { id:"upgrade",  label:"Coating upgrade",     note:"Heavier, longer-life layer",    delta:35 },
  { id:"diy",      label:"DIY 5ml kit",         note:"Apply it yourself, with our guide", delta:-10 },
];

/* ---------- INFO / POLICY CONTENT ----------
   Plain-English starter copy - EDIT FREELY. Terms & Privacy are
   templates (review:true); have them reviewed before you rely on them. */
const POLICIES = {
  shipping: { title:"Shipping & Delivery", lead:"Where we ship, how long it takes, and what it costs.",
    sections:[
      ["Dispatch times","Most parts are dispatched from the UK within 2\u20135 working days. Larger aero pieces - splitters, diffusers - can take a little longer, as each is inspected and packed by hand."],
      ["Tracking","We ship by tracked courier across the UK. You'll get a tracking link by email as soon as your order is on its way."],
      ["Costs","Shipping is calculated at checkout based on size and destination. (Set your own rates and any free-shipping threshold here.)"]
    ] },
  returns: { title:"Returns & Exchanges", lead:"Changed your mind, or something's not right? Here's how returns work.",
    sections:[
      ["30-day returns","You can return most items within 30 days of delivery for a refund or exchange, as long as they're unused, uninstalled, and in their original packaging."],
      ["How to start one","Email carbon.prime@outlook.com with your order number and reason, and we'll send return instructions."],
      ["Refunds","Once your return arrives and passes inspection, we'll refund your original payment method within 5\u201310 working days."],
      ["Damaged or faulty","If a part arrives damaged or defective, contact us within 48 hours with photos and we'll put it right at no cost to you."]
    ] },
  warranty: { title:"Warranty & Quality Guarantee", lead:"Every part is inspected and ceramic-protected before it leaves us. Here's what we stand behind.",
    sections:[
      ["What's covered","We guarantee our parts against manufacturing defects in the carbon and clear coat for 12 months from delivery."],
      ["What's not","Normal wear, UV fade over time, damage from incorrect fitment, accidents, or harsh chemicals isn't covered."],
      ["Making a claim","Email your order number and a few photos and we'll assess it quickly."]
    ] },
  fitment: { title:"Fitment & Guarantee", lead:"Carbon should fit straight out of the box. Here's how we keep it that way.",
    sections:[
      ["Check before you buy","Each product lists the chassis codes it fits - for example G80, G82, G87. Check yours matches before ordering; it's on your V5C or the sticker in the door shut."],
      ["Inspected to fit","Every part's fit points are checked before dispatch, so you're not trimming or forcing anything on."],
      ["Help fitting","Our install guides walk through each part. Stuck? Email us and we'll talk you through it."]
    ] },
  terms: { title:"Terms of Service", lead:"The basics of buying from Carbon Prime. Please read before ordering.", review:true,
    sections:[
      ["Orders & pricing","Placing an order is an offer to buy, which we accept when we dispatch. Prices are in GBP. We honour the price shown at the time you ordered."],
      ["Products","We describe parts as accurately as we can. As these are real carbon-fibre products, weave and finish can vary slightly between batches."],
      ["Liability","We're responsible for supplying parts as described. We're not liable for incorrect fitment or modifications carried out by you or a third party."],
      ["Governing law","These terms are governed by the laws of England and Wales."]
    ] },
  privacy: { title:"Privacy Policy", lead:"What we collect, why, and your rights - in plain English.", review:true,
    sections:[
      ["What we collect","Your name, email, delivery address, and order details. Card payments are handled securely by our payment provider - we never see or store your full card details."],
      ["Why we collect it","To process and deliver your order, send order updates, and - only if you opt in - occasional product news. We don't sell your data."],
      ["Cookies","We use essential cookies to run the site and your basket, and may use analytics cookies to understand how the site is used."],
      ["Your rights","Under UK GDPR you can ask to see, correct, or delete your data at any time. Email carbon.prime@outlook.com."]
    ] }
};

const money = n => "£" + Math.round(n).toLocaleString("en-GB");
const productById = id => PRODUCTS.find(p => p.id === id);

/* ---------- 2. CART (persists across pages) ----------
   Stored in the browser via localStorage; falls back to memory
   if that's unavailable (e.g. some private/preview contexts). */
let _mem = [];
function getCart(){
  try { return JSON.parse(localStorage.getItem("cp_cart")) || []; }
  catch(e){ return _mem; }
}
function saveCart(c){
  _mem = c;
  try { localStorage.setItem("cp_cart", JSON.stringify(c)); } catch(e){}
  updateCartCount();
}
function cartCount(){ return getCart().reduce((n,i)=>n+i.qty,0); }
function cartTotal(){ return getCart().reduce((s,i)=>s+i.price*i.qty,0); }
function addToCart(item){
  const cart = getCart();
  const key = item.id + "|" + item.fit + "|" + item.coating;
  const found = cart.find(i => i.key === key);
  if (found) found.qty += item.qty; else cart.push({ ...item, key });
  saveCart(cart);
}
function setQty(key, qty){
  const cart = getCart();
  const it = cart.find(i => i.key === key);
  if (it){ it.qty = Math.max(1, qty); saveCart(cart); }
}
function removeItem(key){ saveCart(getCart().filter(i => i.key !== key)); }
function updateCartCount(){
  document.querySelectorAll(".cart-count").forEach(el=>{
    const n = cartCount(); el.textContent = n; el.dataset.empty = n ? "0" : "1";
  });
}

/* ---------- 3. SHARED NAV + FOOTER (one source of truth) ---------- */
const NAV = active => `
<header class="nav" id="nav">
  <a class="brand" href="index.html" aria-label="Carbon Prime home">
    <span class="brand-mark" role="img" aria-label="Carbon Prime"></span>
    <span class="wm">Carbon Prime</span>
  </a>
  <nav class="links" aria-label="Primary">
    <a href="shop.html" data-nav="shop">Shop</a>
    <a href="index.html#test" data-nav="test">The Carbon Test</a>
    <a href="index.html#coating" data-nav="coating">Coating</a>
  </nav>
  <div class="nav-right">
    <a class="icon-link cart-link" href="cart.html" aria-label="Cart">
      <svg viewBox="0 0 24 24"><path d="M3 4h2l2.2 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H7"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg>
      <span class="cart-count" data-empty="1">0</span>
    </a>
    <button class="menu-btn" id="menuBtn" aria-label="Menu">Menu</button>
  </div>
</header>`;

const FOOTER = `
<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <span class="foot-mark" role="img" aria-label="Carbon Prime"></span>
        <p class="ftag">Premium carbon fibre for BMW. Inspected, coated, and dispatched from the UK.</p>
        <div class="foot-contact">
          <span class="lbl">Questions?</span>
          <a href="mailto:carbon.prime@outlook.com">carbon.prime@outlook.com</a>
          <a href="tel:+440000000000">+44 (0)000 000 0000</a>
          
        </div>
        <div class="socials">
          <a href="https://www.instagram.com/carbonprime_uk/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16z"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18.3" cy="5.7" r="1.1"/></svg></a>
          <a href="https://www.tiktok.com/@carbonprime_uk" target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 5.82a4.78 4.78 0 0 1-3.4-3.39h-2.9v11.9a2.43 2.43 0 1 1-2.43-2.43c.21 0 .41.03.6.08V9.04a5.42 5.42 0 0 0-.6-.04 5.34 5.34 0 1 0 5.34 5.34V8.3a7.5 7.5 0 0 0 4.39 1.42V6.83a4.78 4.78 0 0 1-1-.01z"/></svg></a>
        </div>
      </div>
      <div class="foot-col"><h5>Shop</h5>
        <a href="shop.html">Exterior</a><a href="shop.html">Aero</a><a href="shop.html">Interior</a><a href="index.html#coating">Ceramic Coating</a></div>
      <div class="foot-col"><h5>Orders &amp; Account</h5>
      <a href="cart.html">Basket</a><a href="info.html?p=returns">Returns &amp; exchanges</a><a href="contact.html">Contact us</a></div>
      <div class="foot-col"><h5>Help &amp; Policies</h5>
        <a href="info.html?p=fitment">Fitment &amp; guarantee</a><a href="info.html?p=shipping">Shipping</a><a href="info.html?p=returns">Returns policy</a><a href="info.html?p=warranty">Warranty</a><a href="info.html?p=terms">Terms</a><a href="info.html?p=privacy">Privacy</a></div>
    </div>
    <div class="foot-bot">
      <div class="lft"><span>&copy; 2026 Carbon Prime - working name</span><span>United Kingdom &middot; DTC</span></div>
      <div class="pay"><i>VISA</i><i>MASTERCARD</i><i>AMEX</i><i>PAYPAL</i><i>KLARNA</i></div>
    </div>
  </div>
</footer>`;

/* inject nav + footer, wire shared behaviour */
function mountChrome(active){
  const h = document.getElementById("site-header");
  const f = document.getElementById("site-footer");
  if (h) h.innerHTML = NAV(active);
  if (f) f.innerHTML = FOOTER;

  // highlight active nav link
  document.querySelectorAll(`[data-nav="${active}"]`).forEach(a=>a.classList.add("active"));

  // nav background on scroll
  const nav = document.getElementById("nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 30);
  onScroll(); window.addEventListener("scroll", onScroll, { passive:true });

  // simple mobile menu (inject the few rules it needs)
  const st = document.createElement("style");
  st.textContent = `@media(max-width:900px){.nav-right .acc-label{display:none}
    header.nav.menu-open .links{display:flex;position:absolute;top:100%;left:0;right:0;flex-direction:column;background:var(--black);border-bottom:1px solid var(--line);padding:6px 32px 18px;gap:0}
    header.nav.menu-open .links a{padding:15px 0;border-bottom:1px solid var(--line)}}`;
  document.head.appendChild(st);
  const mb = document.getElementById("menuBtn");
  if (mb) mb.addEventListener("click", ()=> nav.classList.toggle("menu-open"));

  updateCartCount();
}

/* reveal-on-scroll (shared) */
function initReveal(){
  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold:0.1, rootMargin:"0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
}

/* toast confirmation */
function toast(msg){
  let t = document.querySelector(".toast");
  if(!t){ t = document.createElement("div"); t.className="toast"; document.body.appendChild(t); }
  t.innerHTML = `<span class="dot"></span><span>${msg}</span><a href="cart.html">View basket</a>`;
  requestAnimationFrame(()=>t.classList.add("show"));
  clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove("show"), 3200);
}

/* ---------- 4. PAGE BUILDERS ---------- */

// SHOP: render product cards, with category filter
function cardHTML(p){
  const bgImg = p.cardImg ? `style="background-image:url('${p.cardImg}');background-size:cover;background-position:center"` : '';
  const img = `<div class="card-img weave" ${bgImg}>${cardBadge(p)}<span class="ghost" ${p.cardImg ? 'style="display:none"' : ''}>${p.ghost}</span></div>`;
  const body = `<div class="card-body">
      <span class="card-pn">${p.cat} · ${p.chassis}</span>
      <h3>${p.name}</h3>
      <span class="card-fit">${p.series}</span>
      <div class="card-foot">${cardFoot(p)}</div>
    </div>`;
  if(p.status==="available") return `<a class="card reveal" href="product.html?id=${p.id}">${img}${body}</a>`;
  return `<div class="card reveal ${p.status}">${img}${body}</div>`;
}
function cardBadge(p){
  if(p.status==="soldout") return `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:10;border-radius:12px"><span style="font-family:'Archivo Expanded';font-weight:700;font-size:18px;text-transform:uppercase;color:var(--red);text-align:center;letter-spacing:.02em">Sold Out</span></div>`;
  if(p.status==="coming")  return `<span class="status-badge soon">Coming soon</span>`;
  return `<span class="coat-tag">Ceramic coated</span>`;
}
function cardFoot(p){
  if(p.status==="soldout") return `<span class="card-link muted" style="font-size:12px;color:var(--faint)">This range sold out</span>`;
  if(p.status==="coming")  return `<span class="card-link chrome">Coming soon</span><button class="card-notify" type="button" data-notify="1">Notify me</button>`;
  return `<span class="card-price">${money(p.price)}</span><span class="card-link">View →</span>`;
}
function initShop(){
  const root = document.getElementById("shopSections");
  const by = st => PRODUCTS.filter(p=>p.status===st);
  root.innerHTML =
    shopSection("4 Series - F32", "Available now", "ok",   by("available")) +
    shopSection("3 Series - F30", "Sold out",      "sold", by("soldout")) +
    shopSection("5 Series - F10", "Coming soon",   "soon", by("coming"));
  root.querySelectorAll("[data-notify]").forEach(b=>b.addEventListener("click", e=>{
    e.preventDefault(); toast("We'll let you know when it drops - join the Founders list");
  }));
  initReveal();
}
function shopSection(title, sub, cls, items){
  if(!items.length) return "";
  return `<section class="shop-sec reveal"><div class="shop-sec-head"><h2>${title}</h2><span class="shop-sec-sub ${cls}">${sub}</span></div><div class="grid">${items.map(cardHTML).join("")}</div></section>`;
}

// PRODUCT: read ?id, render detail + options + add to cart
function initProduct(){
  const id = new URLSearchParams(location.search).get("id") || PRODUCTS[0].id;
  const p = productById(id) || PRODUCTS[0];
  document.title = `${p.name} - Carbon Prime`;
  const cn = document.getElementById("crumbName"); if (cn) cn.textContent = p.name;

  if(p.status && p.status!=="available"){
    document.getElementById("pdp").innerHTML = `
      <div class="pdp-gallery reveal"><div class="pdp-main weave"><span class="ghost">${p.ghost}</span></div></div>
      <div class="pdp-info reveal">
        <span class="card-pn">${p.cat} · ${p.chassis}</span>
        <h1>${p.name}</h1>
        <p class="pdp-desc">${p.blurb}</p>
        <div class="status-note ${p.status}">${p.status==="soldout" ? "Sold out for the "+p.series+" - back soon." : "Coming soon to the "+p.series+"."}</div>
        <a class="btn btn-primary btn-block" href="shop.html" style="margin-top:20px">Back to shop</a>
      </div>`;
    document.getElementById("specs").innerHTML = "";
    initReveal();
    return;
  }
  let coating = "standard", qty = 1;

  const priceNow = () => p.price + COATINGS.find(c=>c.id===coating).delta;
  
  // Build gallery with all images
  const thumbs = (p.allImgs || []).map((img,i)=>`<div class="pdp-thumb weave" style="background-image:url('${img}');background-size:cover;background-position:center" data-img="${i}"></div>`).join("");
  const mainImg = (p.allImgs && p.allImgs[0]) ? `style="background-image: url('${p.allImgs[0]}'); background-size: cover; background-position: center;"` : '';
  
  const root = document.getElementById("pdp");
  root.innerHTML = `
    <div class="pdp-gallery reveal">
      <div class="pdp-main weave" id="pdpMainImg" ${mainImg}><span class="ghost" ${p.allImgs ? 'style="display:none"' : ''}>${p.ghost}</span></div>
      <div class="pdp-thumbs">${thumbs}</div>
    </div>
    <div class="pdp-info reveal">
      <span class="card-pn">${p.cat} · ${p.chassis}</span>
      <h1>${p.name}</h1>
      <div class="pdp-price"><span class="chrome" id="pdpPrice">${money(priceNow())}</span></div>
      <p class="pdp-desc">${p.blurb}</p>

      <div class="opt-group">
        <span class="opt-label">Fitment</span>
        <select class="opt-select" id="fitSel">${p.fits.map(f=>`<option>${f}</option>`).join("")}</select>
      </div>

      <div class="opt-group">
        <span class="opt-label">Ceramic coating</span>
        <div class="opt-radios" id="coatRadios">
          ${COATINGS.map((c,i)=>`
            <label class="opt-radio ${i===0?'sel':''}">
              <input type="radio" name="coat" value="${c.id}" ${i===0?'checked':''}>
              <span class="t">${c.label}<small>${c.note}</small></span>
              <span class="pr">${c.delta===0?'Included':(c.delta>0?'+'+money(c.delta):'−'+money(-c.delta))}</span>
            </label>`).join("")}
        </div>
      </div>

      <div class="buy-row">
        <div class="qty">
          <button type="button" id="qMinus">−</button>
          <input type="number" id="qVal" value="1" min="1">
          <button type="button" id="qPlus">+</button>
        </div>
        <button class="btn btn-primary btn-block" id="addBtn" style="flex:1">Add to basket</button>
      </div>

      <div class="trust">
        <div><span class="mk">+</span> Inspected by hand before dispatch</div>
        <div><span class="mk">+</span> Ceramic coated as standard</div>
        <div><span class="mk">+</span> UK dispatch · 30-day returns</div>
      </div>
    </div>`;

  // specs accordion
  document.getElementById("specs").innerHTML = `
    <div class="acc">
      ${[["Material",p.specs.material],["Fitment",p.specs.fitment],["Coating",p.specs.coating],["Shipping & returns",p.specs.shipping]]
        .map(([h,b],i)=>`<div class="acc-item">
          <button class="acc-head">${h}<span class="pm">${i===0?'−':'+'}</span></button>
          <div class="acc-body" ${i===0?'style="max-height:200px"':''}><p>${b}</p></div>
        </div>`).join("")}
    </div>`;

  const priceEl = document.getElementById("pdpPrice");
  const refresh = () => priceEl.textContent = money(priceNow());

  document.querySelectorAll('input[name="coat"]').forEach(r=>{
    r.addEventListener("change", ()=>{
      coating = r.value;
      document.querySelectorAll(".opt-radio").forEach(l=>l.classList.toggle("sel", l.contains(r)));
      refresh();
    });
  });
  const qVal = document.getElementById("qVal");
  document.getElementById("qMinus").onclick = ()=>{ qVal.value = Math.max(1, (+qVal.value)-1); qty=+qVal.value; };
  document.getElementById("qPlus").onclick  = ()=>{ qVal.value = (+qVal.value)+1; qty=+qVal.value; };
  qVal.oninput = ()=> qty = Math.max(1, +qVal.value||1);

  document.getElementById("addBtn").onclick = ()=>{
    addToCart({ id:p.id, name:p.name, pn:p.cat+" · "+p.chassis, ghost:p.ghost,
      price:priceNow(), fit:document.getElementById("fitSel").value,
      coating:COATINGS.find(c=>c.id===coating).label, qty });
    toast(`${p.name} added`);
  };

  // gallery image switching on product detail
  if(p.allImgs){
    document.querySelectorAll(".pdp-thumb").forEach(t=>t.addEventListener("click", ()=>{
      const i = +t.dataset.img;
      document.getElementById("pdpMainImg").style.backgroundImage = `url('${p.allImgs[i]}')`;
      document.querySelectorAll(".pdp-thumb").forEach(x=>x.style.opacity="0.6");
      t.style.opacity="1";
    }));
    document.querySelector(".pdp-thumb").style.opacity="1";
  }

  // accordion toggle
  document.querySelectorAll(".acc-head").forEach(h=>{
    h.addEventListener("click", ()=>{
      const body = h.nextElementSibling, open = body.style.maxHeight && body.style.maxHeight!=="0px";
      body.style.maxHeight = open ? "0px" : body.scrollHeight+"px";
      h.querySelector(".pm").textContent = open ? "+" : "−";
    });
  });
  initReveal();
}

// CART: render items + summary
function initCart(){
  const root = document.getElementById("cartRoot");
  const cart = getCart();
  if(!cart.length){
    root.innerHTML = `<div class="cart-empty">
      <h2 class="display" style="font-size:28px">Your basket is empty</h2>
      <p>Nothing in here yet - go find some carbon.</p>
      <a class="btn btn-primary" href="shop.html">Browse the range</a></div>`;
    return;
  }
  const items = cart.map(i=>`
    <div class="cart-item" data-key="${i.key}">
      <div class="cart-thumb weave"></div>
      <div>
        <h3>${i.name}</h3>
        <div class="meta">${i.pn}<br>Fitment: ${i.fit}<br>Coating: ${i.coating}</div>
        <div class="qty" style="margin-top:10px;width:fit-content">
          <button type="button" data-act="dec">−</button>
          <input type="number" value="${i.qty}" min="1" data-act="qty">
          <button type="button" data-act="inc">+</button>
        </div>
      </div>
      <div>
        <div class="price">${money(i.price*i.qty)}</div>
        <button class="rm" data-act="rm">Remove</button>
      </div>
    </div>`).join("");

  root.innerHTML = `
    <div class="cart-wrap">
      <div class="cart-list">${items}</div>
      <aside class="summary">
        <h3>Order summary</h3>
        <div class="sum-row"><span>Subtotal</span><span>${money(cartTotal())}</span></div>
        <div class="sum-row"><span>Shipping</span><span>Calculated at checkout</span></div>
        <div class="sum-row total"><span>Total</span><span>${money(cartTotal())}</span></div>
        <button class="btn btn-primary btn-block" id="checkoutBtn">Checkout</button>
        <p class="pay-note">Guest checkout available - no account needed.</p>
      </aside>
    </div>`;

  root.querySelectorAll(".cart-item").forEach(row=>{
    const key = row.dataset.key;
    row.querySelector('[data-act="inc"]').onclick = ()=>{ setQty(key, itemQty(key)+1); initCart(); };
    row.querySelector('[data-act="dec"]').onclick = ()=>{ setQty(key, itemQty(key)-1); initCart(); };
    row.querySelector('[data-act="qty"]').onchange = e=>{ setQty(key, +e.target.value||1); initCart(); };
    row.querySelector('[data-act="rm"]').onclick = ()=>{ removeItem(key); initCart(); };
  });
  document.getElementById("checkoutBtn").onclick = ()=> location.href = "checkout.html";
}
function itemQty(key){ const it=getCart().find(i=>i.key===key); return it?it.qty:1; }

// ACCOUNT: tab switching (front-end only)
function initAccount(){
  const tabs = document.querySelectorAll(".auth-tab");
  const forms = { signin:document.getElementById("signinForm"), register:document.getElementById("registerForm") };
  tabs.forEach(t=>t.addEventListener("click",()=>{
    tabs.forEach(x=>x.classList.remove("active")); t.classList.add("active");
    Object.entries(forms).forEach(([k,el])=> el.style.display = (k===t.dataset.tab) ? "block":"none");
  }));
  document.querySelectorAll(".auth form").forEach(f=>f.addEventListener("submit", e=>{
    e.preventDefault();
    toast("Accounts aren't live yet - this is the next build step");
  }));
}

// CHECKOUT: guest (name+email) or sign-in -> delivery -> payment slot
function initCheckout(){
  const cart = getCart();
  const form = document.getElementById("coForm");
  const empty = document.getElementById("coEmpty");
  if(!cart.length){
    if(form) form.style.display="none";
    empty.style.display="block";
    empty.innerHTML = `<div class="cart-empty"><h2 class="display" style="font-size:28px">Nothing to check out</h2><p>Your basket is empty.</p><a class="btn btn-primary" href="shop.html">Browse the range</a></div>`;
    return;
  }
  // order summary
  const rows = cart.map(i=>`<div class="sum-row"><span>${i.name} ×${i.qty}<br><small style="color:var(--faint);font-size:11px">${i.fit} · ${i.coating}</small></span><span style="white-space:nowrap">${money(i.price*i.qty)}</span></div>`).join("");
  document.getElementById("coSummary").innerHTML =
    `<h3>Order summary</h3>${rows}<div class="sum-row"><span>Shipping</span><span>Calculated next</span></div><div class="sum-row total"><span>Total</span><span>${money(cartTotal())}</span></div>`;
  const pt = document.getElementById("payTotal"); if(pt) pt.textContent = money(cartTotal());

  // guest / sign-in toggle
  document.querySelectorAll("#coTabs .auth-tab").forEach(t=>t.addEventListener("click",()=>{
    document.querySelectorAll("#coTabs .auth-tab").forEach(x=>x.classList.remove("active"));
    t.classList.add("active");
    const guest = t.dataset.co==="guest";
    document.getElementById("guestPane").style.display = guest?"block":"none";
    document.getElementById("accountPane").style.display = guest?"none":"block";
  }));
  const sc = document.getElementById("coSignin");
  if(sc) sc.onclick = ()=> toast("Accounts aren't live yet - use guest checkout for now");

  // continue to payment (validates guest name+email)
  document.getElementById("toPayment").onclick = ()=>{
    const guestActive = document.querySelector("#coTabs .auth-tab.active").dataset.co==="guest";
    if(guestActive){
      const n=document.getElementById("gName").value.trim();
      const e=document.getElementById("gEmail").value.trim();
      if(!n || !e){ toast("Add your name and email to continue"); return; }
    }
    const sec = document.getElementById("paymentSection");
    sec.classList.add("show");
    sec.scrollIntoView({behavior:"smooth", block:"center"});
  };
  // pay button (placeholder - Stripe plugs in here)
  document.getElementById("payBtn").onclick = ()=> toast("Payment connects via Stripe - that's the next step");
}

// INFO / POLICY page: render the policy named in ?p=
function initInfo(){
  const key = new URLSearchParams(location.search).get("p");
  const data = POLICIES[key];
  const title = document.getElementById("infoTitle");
  const crumb = document.getElementById("infoCrumb");
  const body  = document.getElementById("infoBody");
  if(!data){
    title.textContent = "Information";
    body.innerHTML = `<p class="lead">Choose a page:</p>` +
      Object.keys(POLICIES).map(k=>`<p><a href="info.html?p=${k}">${POLICIES[k].title}</a></p>`).join("");
    return;
  }
  document.title = `${data.title} - Carbon Prime`;
  title.textContent = data.title;
  if(crumb) crumb.textContent = data.title;
  body.innerHTML =
    `<p class="lead">${data.lead}</p>` +
    data.sections.map(([h,b])=>`<section><h3>${h}</h3><p>${b}</p></section>`).join("") +
    (data.review ? `<div class="review-note">This is a starting template, not legal advice - have it reviewed and tailored to your business before you rely on it.</div>` : "");
}

// CONTACT page form
function initContact(){
  const f = document.getElementById("contactForm");
  if(f) f.addEventListener("submit", e=>{
    e.preventDefault();
    toast("Messages aren't live yet - connect a form service (e.g. Formspree)");
  });
}

// HOME: tagline switcher + water droplets
function initHome(){
  const headline = document.getElementById("headline");
  if (headline){
    const taglines = [
      '<span class="chrome">Carbon.</span> <span class="b">Refined.</span>',
      '<span class="b">Engineered for the</span> <span class="chrome">driven.</span>',
      '<span class="b">Premium carbon for the</span> <span class="chrome">obsessed.</span>'
    ];
    document.querySelectorAll("#switch button").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        document.querySelectorAll("#switch button").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        const i = +btn.dataset.i; headline.style.opacity = 0;
        setTimeout(()=>{ headline.innerHTML = taglines[i]; headline.style.transition="opacity .4s ease"; headline.style.opacity = 1; }, 160);
      });
    });
  }
  const hg = document.getElementById("homeGrid");
  if(hg){
    hg.innerHTML = PRODUCTS.filter(p=>p.status==="available").map(cardHTML).join("") +
      `<div class="card" style="display:flex;align-items:center;justify-content:center;background:var(--panel);border-style:dashed"><div style="text-align:center;padding:32px"><span class="card-pn" style="margin-bottom:10px">More dropping</span><h3 style="font-family:'Archivo Expanded';text-transform:uppercase;font-size:16px;font-weight:600">3 &amp; 5 Series soon</h3><p style="color:var(--dim);font-size:13px;margin-top:8px">First 20 orders get a numbered Founders Pack.</p></div></div>`;
  }
  const bead = document.getElementById("bead");
  if (bead && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    for(let i=0;i<40;i++){
      const d=document.createElement("span"); d.className="drop";
      const s=2+Math.random()*13;
      d.style.width=s+"px"; d.style.height=s+"px";
      d.style.left=Math.random()*95+"%"; d.style.top=Math.random()*92+"%";
      d.style.opacity=0.3+Math.random()*0.5; bead.appendChild(d);
    }
  }
  initReveal();
}

/* ---------- 5. BOOT (run the right things for this page) ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  const page = document.body.dataset.page || "home";
  mountChrome(page);
  if (page==="home")    initHome();
  if (page==="shop")    initShop();
  if (page==="product") initProduct();
  if (page==="cart")     initCart();
  if (page==="checkout") initCheckout();
  if (page==="account")  initAccount();
  if (page==="info")     initInfo();
  if (page==="contact")  initContact();
  if (["shop","product","cart","account","checkout","info","contact"].includes(page)) initReveal();
});
