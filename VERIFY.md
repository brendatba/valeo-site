# VERIFY.md — rubric run 2026-09-11 (v4)

Commands: `npm run build` · `node scripts/check-prices.mjs` · `npx playwright test` · `node scripts/check-editability.mjs` · `node scripts/lighthouse.mjs` · `node scripts/screens.mjs final`

| # | Check | Score | Evidence |
|---|---|---|---|
| R1 | One-screen pick | **2** | Playwright `tests/shop.spec.ts` "R1": 19 tiles (18 + Other) at 390×844, grid bottom 990px and product/size controls at 1515px (< 2 viewports), `scrollWidth == innerWidth`. `screens/final/shop-single-mobile.png` |
| R2 | Price exactness | **2** | `node scripts/check-prices.mjs` → ALL PRICES PASS (20 jar prices, A $53.25 / B $49 / C $57.50 with retail–discount–slab rows, minis 1–5, 6th rejected, "Other" priced normally). Also asserted in the UI by `tests/shop.spec.ts` R5 tests |
| R3 | Variant UX | **2** | `tests/shop.spec.ts` "R3": tile select → green ring + check, segmented product/size with price-in-option, price-in-button updates, arrow-key roving + Enter, visible focus outline. `screens/final/shop-single-desktop.png` |
| R4 | Brand fidelity | **2** | `tests/home.spec.ts`: wordmark h1, tagline exactly once (italic serif), 4 pillars verbatim, contact block. Cream/green/gold tokens in `src/styles/tokens.css`, per-scent tints on tiles + scent header, light theme only, no scarcity theater. `screens/final/home-*.png` |
| R5 | Bundles | **2** | `tests/shop.spec.ts` R5 ×3: A/B/C slot counts enforced (Option C locks butter/scrub per slot), progress "n of N", retail → 15% → slab → total rows; sample counter, $20 lock at 5, 6th refused. `screens/final/shop-flight-*.png`, `shop-sample-*.png` |
| R6 | Order never lost | **2** | `tests/checkout.spec.ts`: validation, order number `VB-YYMMDD-XXX`, Venmo memo = order number, SMS link `sms:2533594643?&body=…` and mailto both carry the full order text, confirmation survives reload via `?order=`; endpoint POST is optional (`VITE_ORDER_ENDPOINT`). `screens/final/confirmation-*.png` |
| R7 | Editability | **2** | `node scripts/check-editability.mjs` → appends a 19th fragrance to `data/catalog.json`, rebuilds, `tests/r7.spec.ts` finds it in the grid (20 tiles, "19 scents"), sticky bar, cart, home scent strip, and checkout summary; catalog restored byte-for-byte |
| R8 | Performance / a11y | **2** | Lighthouse mobile (median of 3): home perf 95 / a11y 100 · shop 98 / 100 · checkout 100 / 100, with 18 worlds + 23 loops wired (all deferred until near). Every `<img>` has alt (asserted in `tests/home.spec.ts`). Reports: `screens/lighthouse/*.html` |
| R9 | Resumability | **2** | `STATUS.md` lists done/next/open questions with the exact commands; `PLAN.md` holds the state model and schema; `BLOCKERS.md` the defaults |
| R10 | Deployed | **2** | GitHub Pages via Actions from `v2` → https://brendatba.github.io/valeo-site/ ; screenshots in `screens/final/` (14 files, 390 + 1280) |

Playwright: 21/21 passed (mobile + desktop projects). TypeScript: 0 errors. `impeccable` detector: 0 findings. Zaha's mechanical gate: `var(--line)` 0 hits · eyebrow/badge/counter/swatch-in-grid 0 hits · one filled control per screen · pumpkin swatch contains `#FFF8EA`. Screens: `screens/r6/` (reviewer evidence pack, viewport captures along a real shopper path); earlier rounds in `screens/r1`–`r5`, v3 in `screens/v3/`, v2 in `screens/final/`.
