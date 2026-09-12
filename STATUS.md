# STATUS.md — Valeo Body storefront v2

**State: v3 visual rebuild shipped 2026-09-11 evening after Brenda's design review; pending Brenda's merge of the `v2 → main` PR (#1).**

v3 = same interaction model and catalog as v2, new visual layer per `DESIGN-RULING.md` (zaha) + `MEDIA-RULING.md` (thelma), routed by Athena, built with the `impeccable` skill (PRODUCT.md, DESIGN.md, `.impeccable/design.json`, direction contract in `index.html`). Four scent-world videos are back (`public/video/`, 612KB total, play on scroll). Pumpkin Marshmallow swatch now draws marshmallows (asset only; swatches no longer render on any page). Finish review: `REVIEW.md`.
**Live URL:** https://brendatba.github.io/valeo-site/ (deploys from `v2` via GitHub Actions until merge)

## Resume from here
- Repo: `brendatba/valeo-site`, branch `v2`. Local clone: `~/Work/SHAUNA/site-v1/` (folder predates this build).
- `npm install` then `npm run build && node scripts/check-prices.mjs && npx playwright test` — all green as of 2026-09-11.
- Rubric evidence: `VERIFY.md`. Defaults applied: `BLOCKERS.md`. Architecture + state model: `PLAN.md`.

## Milestones
| # | Milestone | Status |
|---|---|---|
| 1 | Scaffold + catalog.json + price engine, check-prices green | ✅ |
| 2 | Picker, Single mode: 18-tile grid, mood filters, product/size, sticky bar | ✅ |
| 3 | Cart drawer (localStorage) + "pairs well with" | ✅ |
| 4 | Flight A/B/C + Sample-set mode with exact totals | ✅ |
| 5 | Checkout → confirmation → Venmo → endpoint + mailto + SMS | ✅ |
| 6 | Home, ingredients, how-it-works, footer, brand polish | ✅ |
| 7 | Accessibility + performance pass (Lighthouse ≥ 90 / ≥ 95) | ✅ |
| 8 | GitHub Pages deploy via Actions | ✅ |

## Open questions (defaults applied — see BLOCKERS.md)
0. **Paid media path** (thelma, priced live): $50 tier = stills for all 18 scents + 5s loops for the 13 without one + a coffee reshoot/regen on fal. Blocked on fal `TOP_UP` unlock, then Brenda's yes.
0b. **Real photography is still the gate**: the AI jar render's label text ("Calming Botanical / Pineapple Coconut Vanilla") is legible at hero scale on desktop. Only Shauna's shoot fixes it honestly.
1. **Option C = $57.50** by the 15% rule. Confirm with Shauna.
2. **Delivery**: free, "Shauna will confirm by text". Confirm radius/fee.
3. **Venmo handle** missing → add to `data/catalog.json` `business.venmo`.
4. **Order endpoint**: create a Formspree form, add `VITE_ORDER_ENDPOINT` as a GitHub Actions secret. Until then orders hand off by SMS/email only.
5. **Pillar claims** "No Chemicals" / "Organic": in the brief verbatim, but the earlier SITE-ENGINE brief dropped them. Brenda's ruling.
6. **Photos**: all renders are placeholders; swap via `public/photos.json` and each fragrance's `hero` field.

## After merge
- Edit `.github/workflows/deploy.yml` branches to `[main]` only, and remove `v2` from the `github-pages` environment's deployment branches.
- When `valeobody.com` is attached: set `BASE_PATH: /` in the workflow and add the CNAME in Pages settings.
