# STATUS.md — Valeo Body storefront v2

**State: DONE (all 8 milestones) — pending Brenda's merge of the `v2 → main` PR.**
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
1. **Option C = $57.50** by the 15% rule. Confirm with Shauna.
2. **Delivery**: free, "Shauna will confirm by text". Confirm radius/fee.
3. **Venmo handle** missing → add to `data/catalog.json` `business.venmo`.
4. **Order endpoint**: create a Formspree form, add `VITE_ORDER_ENDPOINT` as a GitHub Actions secret. Until then orders hand off by SMS/email only.
5. **Pillar claims** "No Chemicals" / "Organic": in the brief verbatim, but the earlier SITE-ENGINE brief dropped them. Brenda's ruling.
6. **Photos**: all renders are placeholders; swap via `public/photos.json` and each fragrance's `hero` field.

## After merge
- Edit `.github/workflows/deploy.yml` branches to `[main]` only.
- When `valeobody.com` is attached: set `BASE_PATH: /` in the workflow and add the CNAME in Pages settings.
