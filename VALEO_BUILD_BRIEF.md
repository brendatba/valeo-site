# VALEO BODY — Storefront Build Brief for Claude Code

Start Claude Code with: "Read VALEO_BUILD_BRIEF.md. Execute the Build Loop until every item in the Definition of Done passes. Do not stop to ask questions that the Decisions or Defaults sections already answer."

## 1. Goal (one sentence)
Build a fast, mobile-first, custom storefront for Valeo Body — a handmade body-butter and scrub brand — where a customer can pick any of 18 fragrances, a product, and a size from a single screen without scrolling to discover options, build flights and sample sets, and place a pickup/delivery order paid by Venmo.

The site must feel like a Shopify-quality store (variant swatches, persistent cart, clean checkout), not an editorial scroll experience.

## 2. Why this brief exists
A v1 exists at https://brendatba.github.io/valeo-site/ (repo: brendatba/valeo-site). It is a dark, scroll-jacked "five worlds" page with 5 scents, 2 sizes, one reused jar photo, and a hidden bundle flow. Do not extend it. Replace it. Reuse only its scent flat-lay images as assets if they are in the repo.

Shauna (the owner) saw v1 and asked for exactly one thing: "all fragrances on one page of selection, rather than scrolling — pick and choose." That sentence is the north star.

Design references (Shopify stores that handle many variants well): thefleececompany.com product page (labeled swatches + size picker + price-in-button + "pairs well with") and comfrt.com/collections/hoodies (swatches on cards with "+N", filter chips, NEW badges). Borrow the variant UX. Do NOT borrow fake scarcity, countdowns, "sold out" theater, or template review widgets.

## 3. Non-goals
- No Shopify account, Stripe, or card checkout. Payment is Venmo, off-site.
- No user accounts, no shipping calculator, no inventory system.
- No CMS. Catalog lives in one JSON file that Shauna/Brenda can edit.
- No QR codes, business cards, labels, or domain purchase.
- No blog, no newsletter, no reviews module.

## 4. Brand (non-negotiable)
- Name: VALEO BODY (wordmark), also "Valeo Body Care". Est. 2025. Lotus / white-flower mark.
- Tagline: "I am able. I am strong." (from the Latin valeo). Show it once, near the top, in script or italic serif.
- Pillars, verbatim, as a badge strip: Unfiltered · No Chemicals · Organic · Pure Essential Oils & Butters
- Footer/about line: small, local, woman-owned business. Pickup/delivery. Venmo.
- Palette: cream background (#F6F1E7-ish), deep botanical green for headings/buttons (#2F4A2A-ish), soft sage accents, warm gold/tan for highlights (#C9A24A-ish). Light theme only.
- Type: elegant serif for headings (Cormorant / Playfair class), clean humanist sans for UI and body. Script only for the tagline.
- Contact block: 253-359-4643 · valeobodycare@gmail.com · @valeobody (Instagram) · valeobody.com.
- Imagery direction (Shauna's Pinterest board): bright, airy, ingredient-forward. Jar surrounded by literal ingredients on a cream or softly scent-tinted background. Jar + live-edge wood slab for flights. Info-graphic ingredient callouts. Light, saturated, celebratory — never dark, moody, or "luxury" muted. Scent tile swatches and per-scent header backgrounds tinted to the scent's ingredient color.
- Body butter ingredients: shea butter, cocoa butter, mango butter, jojoba oil, castor oil, vitamin E oil, arrowroot powder, beeswax, essential oils. Scrub ingredients: sugar (or salt / coffee), coconut oil, castor oil, vitamin E oil, essential oils.

## 5. Catalog (source of truth — data/catalog.json)
Products (4): Body Butter · Sugar Scrub · Salt Scrub · Coffee Scrub

| Size | Body Butter | Any Scrub |
|---|---|---|
| 2 oz | $10 | $10 |
| 4 oz | $15 | $15 |
| 6 oz | $20 | $20 |
| 8 oz | $25 | $25 |
| 16 oz | $45 | $35 |

Fragrances (18 + Other), every fragrance available for every product:

| Fragrance | Mood tag |
|---|---|
| Pistachio Salted Caramel | Sweet & Bakery |
| Cashmere Vanilla | Warm & Cozy |
| Raspberry Lemonade | Fruity & Fresh |
| Coconut Lime | Fruity & Fresh |
| Vanilla Amber | Warm & Cozy |
| Chamomile Lavender | Calm & Floral |
| Birthday Cake | Sweet & Bakery |
| Watermelon | Fruity & Fresh |
| Cinnamon Roll | Sweet & Bakery |
| Bubble Gum Cotton Candy | Sweet & Bakery |
| Coffee | Warm & Cozy |
| Vanilla Bean Lavender | Calm & Floral |
| Sandalwood Bergamot | Warm & Cozy |
| Ocean Mist & Sea Salt | Fruity & Fresh |
| Brazilian Orange Bourbon | Warm & Cozy |
| Honey Vanilla | Sweet & Bakery |
| Marshmallow Vanilla Kisses | Sweet & Bakery |
| Pumpkin Marshmallow | Seasonal (Fall) |
| Other (free text) | — |

Bundles (fixed pricing, must compute exactly):
- Live Edge Slab: $15 add-on. Flights are 15% off jar retail + slab.
- Option A — three 4 oz jars: retail $45 → $38.25 + $15 slab = $53.25
- Option B — four 2 oz jars: retail $40 → $34.00 + $15 slab = $49.00
- Option C — one 8 oz body butter + one 8 oz scrub on a slab: retail $50 → $42.50 + $15 slab = $57.50 (confirm with Shauna)
- Jars in a flight can be any mix of product + fragrance.
- Sample Minis: $5 each, or 5 for $20. Customer picks any 5 fragrances (product type per mini selectable, default Body Butter).

## 6. Required screens & behaviors
### 6.1 Home (/)
Compact hero: wordmark, tagline, pillar badge strip, one primary CTA "Shop scents". Hero ≤ 70vh on mobile; picker reachable in one scroll. Three tiles: Single Jar · Slab Flight · Sample Minis (deep-link into picker modes). "What's in it" ingredient section, "How ordering works" (pickup/delivery + Venmo, 3 steps), contact/footer.

### 6.2 The Picker (/shop)
One screen, three zones: fragrance grid (all 18 tiles, 3 cols mobile / 6 desktop, swatch + name + mood color, selected = green ring + check; mood filter chips; "Other" opens text field) · product + size segmented controls with instant price · sticky bottom bar "Add to cart — $15" with selection summary, never hidden behind keyboard.

Modes (URL-addressable, /shop?mode=flight&option=A): Single (default) · Flight (Option A/B/C, N slots, progress, running total retail → 15% savings → slab → final) · Sample set (pick 5, counter, $20 at 5, $5 each for 1–4).

### 6.3 Cart (drawer, localStorage)
Line items with edit/remove, bundles expandable, subtotal. "Pairs well with": body butter in cart → suggest same-fragrance sugar scrub (and vice versa), one-tap add.

### 6.4 Checkout (/checkout)
Fields: name, phone, email (optional), Pickup or Delivery (address field), notes. On submit: confirmation with summary + order number (VB-YYMMDD-XXX); Venmo instructions with total + copyable memo; send order to Shauna via serverless endpoint (env var key) + mailto fallback + SMS link (sms:2533594643?body=...). Never lose an order.

### 6.5 Global
Mobile-first, 360px wide, no horizontal scroll. Lighthouse ≥ 90 perf / ≥ 95 a11y mobile. Keyboard-operable with visible focus; alt text; AA contrast. Catalog edits touch only data/catalog.json.

## 7. Tech decisions
Static site; Vite + vanilla TS or Astro (smallest bundle). No React unless it materially simplifies. Plain CSS custom properties; no Tailwind CDN. Deploy: GitHub Pages from main via GitHub Actions; base path configurable. Swatch art: consistent flat illustrations in public/swatches/. Product photos: existing renders in public/products/ with photos.json map.

## 8. The Build Loop
PLAN → BUILD (one milestone) → VERIFY (build, check-prices.mjs, playwright, lighthouse, screenshots; VERIFY.md) → FIX (max 3 loops, then BLOCKERS.md) → NEXT (STATUS.md) → STOP only when §11 passes.

Rules: never ask a question §5/§7/§12 answers; don't reduce scope; state lives in files; commit per milestone; push to v2; PR to main only when §11 is green.

## 9. Milestones
1. Scaffold + catalog.json + price engine with check-prices.mjs green.
2. Picker, Single mode.
3. Cart drawer + "pairs well with".
4. Flight mode + Sample-set mode.
5. Checkout → confirmation → Venmo → order delivery.
6. Home page, ingredients, how-it-works, footer; brand polish.
7. Accessibility + performance pass.
8. GitHub Pages deploy via Actions; STATUS.md DONE with live URL.

## 10. Rubric (0–2, <2 = FAIL)
R1 One-screen pick · R2 Price exactness · R3 Variant UX · R4 Brand fidelity · R5 Bundles · R6 Order never lost · R7 Editability (19th fragrance test) · R8 Performance/a11y · R9 Resumability · R10 Deployed.

## 11. Definition of Done
All ten rubric rows at 2 in VERIFY.md, PR v2 → main open, live URL in STATUS.md, README.md "how to edit prices/fragrances" note for Shauna.

## 12. Open questions → defaults
| Question | Default |
|---|---|
| Option C price? | $57.50 (15% rule). Flag in STATUS.md. |
| Delivery radius / fee? | Free, "local delivery — Shauna will confirm". Flag. |
| Order delivery endpoint? | Formspree free tier, key via VITE_ORDER_ENDPOINT; mailto + SMS always on. |
| Real product photos? | Existing renders; photos.json map ready for swap. |
| Copy voice? | Warm, plain, confident; short sentences; no "luxury" adjectives. Tagline is the only script text. |
| "Other" fragrance pricing? | Same as any fragrance. |

Prepared for Brenda Robinson / Vyzible for Shauna's Valeo Body. Catalog and pricing transcribed from the Valeo Custom Order Sheet and product flyer (2025).
