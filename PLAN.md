# PLAN.md — Valeo Body storefront v2

Brief: `VALEO_BUILD_BRIEF.md`. Branch: `v2` of `brendatba/valeo-site` (local clone lives at `~/Work/SHAUNA/site-v1/` — folder name predates this build; rename is Brenda's call).

## Stack (decided)
- **Vite 7 + vanilla TypeScript**, multi-page (`index.html`, `shop/index.html`, `checkout/index.html`). No framework: picker state is one small store, ~200 lines. Smallest possible bundle.
- **Plain CSS** with custom properties in `src/styles/`. Fonts self-hosted via `@fontsource` (Cormorant Garamond for headings + italic tagline, Nunito Sans for UI) so Lighthouse doesn't pay for a third-party font round trip.
- **Node 25** runs `scripts/check-prices.mjs` directly against the TS price engine (native type stripping), so the test and the site share one pricing function.
- **Playwright** (chromium, 390×844 + 1280×800) for behavior tests and screenshots. **Lighthouse** CLI for perf/a11y.
- **Deploy:** GitHub Actions → GitHub Pages. `base` is `process.env.BASE_PATH ?? '/valeo-site/'`; set `BASE_PATH=/` when valeobody.com is attached.

## File tree
```
index.html                 home
shop/index.html            picker (modes via ?mode=single|flight|sample&option=A|B|C)
checkout/index.html        checkout + confirmation
data/catalog.json          THE catalog (products, sizes, prices, fragrances, bundles, business info)
public/swatches/*.svg      18 flat swatch illustrations + other.svg
public/products/*          jar renders + 5 scent flat-lays (from v1)
public/photos.json         slot → file map so real photos drop in later
src/styles/tokens.css      palette, type, spacing
src/styles/base.css        reset, typography, layout primitives, focus
src/styles/components.css  tiles, chips, segmented controls, sticky bar, drawer, forms
src/lib/catalog.ts         types + typed accessor over catalog.json
src/lib/pricing.ts         PURE price engine (cents). jarPrice, flightTotal, sampleTotal, cartTotal
src/lib/cart.ts            cart store (localStorage `valeo.cart.v1`), subscribe/add/update/remove
src/lib/orders.ts          order number, summary text, Venmo memo, mailto/sms builders, endpoint POST
src/ui/header.ts           top bar + cart button (all pages)
src/ui/cart-drawer.ts      drawer, line items, pairs-well-with
src/ui/picker.ts           fragrance grid, filters, product/size controls, mode logic, sticky bar
src/pages/home.ts / shop.ts / checkout.ts   page entry points
scripts/check-prices.mjs   asserts every §5 price
scripts/screens.mjs        screenshots every page at 390 + 1280 into screens/<milestone>/
tests/*.spec.ts            playwright
.github/workflows/deploy.yml
PLAN.md STATUS.md VERIFY.md BLOCKERS.md README.md
```

## Catalog schema (data/catalog.json)
```
business: { name, tagline, pillars[], phone, email, instagram, domain, venmo }
products: [{ id, name, kind: "butter"|"scrub", image, ingredients[] }]
sizes:    [{ id: "2oz", label: "2 oz", prices: { butter: 1000, scrub: 1000 } }]   // cents
fragrances: [{ id, name, mood: moodId, tint: "#hex", swatch: "swatches/x.svg", note }]
moods:    [{ id, label, color }]
bundles: {
  slab: { price: 1500, discount: 0.15 },
  flights: [{ id:"A", name, slots:[{ size:"4oz" }, ...] }]   // slot may pin kind: "butter"|"scrub"
  samples: { each: 500, setSize: 5, setPrice: 2000 }
}
```
Prices are integer cents. Everything renders from this file; adding a fragrance = one array entry.

## Picker state model
```
mode: "single" | "flight" | "sample"
option: "A" | "B" | "C"            (flight only)
filter: moodId | "all"
single:  { fragrance, otherText, product, size }
flight:  { activeSlot, slots: [{ fragrance, otherText, product } | null] }   // size fixed per slot by option
sample:  { minis: [{ fragrance, otherText, product }] }                      // max 5
```
Grid tap → writes to the active target (single / flight.slots[activeSlot] / next sample). Sticky bar renders from `pricing.ts` on every state change. URL query reflects mode + option (replaceState).

## Cart line shape
```
{ id, kind: "jar",    fragrance, fragranceName, product, size, qty, unitCents }
{ id, kind: "flight", option, jars: [{ fragrance, fragranceName, product, size }], breakdown }
{ id, kind: "sample", minis: [{ fragrance, fragranceName, product }], totalCents }
```

## Milestones → see VALEO_BUILD_BRIEF.md §9. Status lives in STATUS.md.
