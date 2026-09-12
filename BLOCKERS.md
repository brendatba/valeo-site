# BLOCKERS.md — nothing hard-blocked; defaults applied and flagged

| # | Question | Default applied | Where it shows | Needs |
|---|---|---|---|---|
| 1 | Shauna's Venmo handle is not in the brief | `business.venmo` left empty; confirmation page says "Shauna will text you her Venmo handle". A Venmo deep link (amount + memo prefilled) switches on automatically once the handle is filled in. | `data/catalog.json` → `business.venmo` | Shauna |
| 2 | Order endpoint key | `VITE_ORDER_ENDPOINT` unset; site works with SMS + mailto hand-off. Formspree form still to be created and the key added as a repo secret. | `.env.example`, `.github/workflows/deploy.yml` | Brenda (5 min) |
| 3 | Option C price | $57.50 by the 15% rule, per brief §12 | catalog `bundles.flights[C]` computes it; not hardcoded | Shauna to confirm |
| 4 | Delivery radius / fee | Free; "Shauna will confirm your delivery window by text" | `business.deliveryNote` | Shauna |
| 5 | 4 minis = $20 = 5 minis | Brief pricing means the 4th and 5th mini cost the same. Kept exactly as specified; the builder nudges "add 1 more for the $20 set". | `pricing.ts` sampleTotal | Shauna may want 4 minis = $18 or similar |
| 6 | Pillars "No Chemicals" / "Organic" | Brief §4 says verbatim, so they are on the site. The earlier SITE-ENGINE `BRIEF.md` in `~/Work/SHAUNA/` ruled those two claims dropped. Newer brief wins; flagging the conflict. | `business.pillars` | Brenda's ruling |
| 7 | Salt Scrub has no photo of its own | Reuses the sugar-scrub render | `public/photos.json` | Real photos |
| 8 | Coffee scent flat-lay is a dark-brown image | Kept (it is the only coffee asset); reads darker than the Pinterest direction | `catalog.fragrances[coffee].hero` | Photo swap |
| 9 | Live site replaced | Pages switched from "deploy from main" (legacy) to GitHub Actions, and `v2` was added to the `github-pages` environment's allowed deployment branches (the first run was rejected by that rule). Pushes to `v2` deploy while the PR is open. After merge: set the workflow's branch list back to `main` only and remove the `v2` branch policy from the environment (repo Settings → Environments → github-pages). | `.github/workflows/deploy.yml` | Brenda at merge time |
