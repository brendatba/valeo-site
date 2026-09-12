# Valeo Body — storefront

Live: https://brendatba.github.io/valeo-site/ · Brief: `VALEO_BUILD_BRIEF.md` · State: `STATUS.md`

## For Shauna: how to change prices or fragrances

Everything the shop sells lives in **one file**: [`data/catalog.json`](data/catalog.json). You never need to touch anything else.

- **Change a price:** find the size under `"sizes"` and edit the number. Prices are in **cents** (so `1500` is $15.00). `butter` is the body-butter price, `scrub` is the price for all three scrubs.
- **Add a fragrance:** copy any block inside `"fragrances"`, paste it at the end of the list (after a comma), and change the `id` (lowercase-with-dashes, must be unique), the `name`, the `mood` (`sweet`, `fruity`, `warm`, `calm`, or `seasonal`), the `tint` (a light background color), and the `note` (a few words about how it smells). For `swatch`, reuse any existing swatch file or ask Brenda for a new one. To mark it seasonal, add `"tag": "Fall"`.
- **Remove a fragrance:** delete its block (and the comma before it). It disappears from the shop, the home page, and checkout.
- **Change the slab price or the flight discount:** under `"bundles"` → `"slab"`, edit `price` (cents) or `discount` (`0.15` = 15% off).
- **Change the sample-mini pricing:** under `"bundles"` → `"samples"`, edit `each`, `setSize`, and `setPrice`.
- **Add your Venmo handle:** under `"business"`, put it in `"venmo"` (with or without the @). Until then, the order page tells customers you'll text them the handle.
- **Phone, email, Instagram:** also under `"business"`.

Save the file on GitHub (edit → commit to `main`) and the site rebuilds itself in about a minute. If a price looks wrong after a change, the build stops and nothing goes live, so a typo can't publish a bad price.

## For Brenda / developers

```bash
npm install
npm run dev              # local dev server
npm run build            # typecheck + production build → dist/
npm run check:prices     # asserts every brief §5 price against the engine
npm test                 # Playwright: mobile 390×844 + desktop 1280×800
node scripts/check-editability.mjs   # R7: proves a 19th fragrance shows up everywhere
npm run lighthouse       # mobile Lighthouse → screens/lighthouse/
npm run screens <name>   # screenshots every screen → screens/<name>/
```

- **Order delivery:** set `VITE_ORDER_ENDPOINT` (Formspree/Netlify-style JSON endpoint) as a repo secret. Without it, orders still render on screen with SMS and email hand-off links. See `.env.example`.
- **Base path:** `BASE_PATH` env at build time (`/valeo-site/` for GitHub Pages; `/` once `valeobody.com` is attached). Set in `.github/workflows/deploy.yml`.
- **Photos:** `public/photos.json` maps each photo slot to a file in `public/products/`. Per-scent flat-lays are the `hero` field on a fragrance in the catalog.
- **Swatches:** `node scripts/make-swatches.mjs` regenerates `public/swatches/` from the drawing definitions in that script.
