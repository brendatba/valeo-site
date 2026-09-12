# STATUS.md — Valeo Body storefront v2

**State: v4 (2026-09-11, late) — rebuilt after Brenda's second review; in the reviewer loop (zaha design gate + shopper-QA agent) before redeploy; pending Brenda's merge of the `v2 → main` PR (#1).**

v4 = the Fleece/Comfrt swatch picker from Brenda's brief (mode → product jar tiles → size → 18 photo scent tiles with ring + check → sticky bar with thumbnail), 18 real ingredient worlds (13 generated with Gemini 3.1 Flash Image using the originals as style reference, coffee regenerated on cream), 23 Kling loops via Kie (landscape for every scent, portrait for the five passage worlds), and the home passage rebuilt as a true pinned stage with scroll-scrubbed video (`src/lib/passage.ts`). Review loop: `scripts/walkthrough.mjs` → `screens/r<N>/` → zaha + shopper-QA agents → fixes → recapture. Rounds 1–2 findings and fixes are in the git log; round 3 verdicts pending.
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
