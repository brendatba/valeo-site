# REVIEW.md — impeccable finish review, Valeo v3 (2026-09-11)

Substitution disclosed: this harness has no `impeccable-finish-reviewer` agent, so the review ran in-thread from `reference/degraded/finish-reviewer.md`, stepping out of the build context. No approved comp exists (no image generation available), so fidelity is judged against the direction contract in `index.html` and the world's real materials. Inputs read: `screens/v3/*` (desktop + mobile, passage viewport shots), `index.html` contract, `PRODUCT.md`, `DESIGN-RULING.md` gate, craft-floor Refuse list, detector output (0 findings).

disposition: fix

## persistence
pass — `PRODUCT.md` present; `DESIGN.md` + `.impeccable/design.json` written after this review from the built CSS; contract survives the production build (`grep` hit in `dist/index.html`); `FINGERPRINTS.md` logged. No comps → no approval record owed.

## fidelity
| element | verdict |
|---|---|
| THESIS: jar stays, world changes | match — pinned cutout sits inside each ingredient ring on desktop and mobile (`passage-2-desktop.png`, `passage-4-mobile.png`) |
| OWN-WORLD: cream ground, green voice, gold ≤3, no rules/chips/badges | match — `var(--line)` 0 hits, eyebrow/badge/counter/swatch-in-grid 0 hits |
| TYPE: Cormorant Garamond display | acceptable adaptation — on impeccable's default-face list, but pinned by the brief (§4 "Cormorant / Playfair class") |
| MATERIAL: photography | contradicted on the focal element — the hero jar is an AI render whose invented label text ("Calming Botanical / Pineapple Coconut Vanilla") is legible at hero scale on desktop. Real material exists only for 4 of 18 worlds; coffee's world is dark-ground and sits out |
| FIRST VIEWPORT desktop | match |
| FIRST VIEWPORT mobile | acceptable adaptation — jar hidden to keep hero ≤70vh (brief 6.1, test R4); the jar arrives with the first world |
| One filled control per screen | match — sticky Add/Place order only |
| 18 names on one screen | match — 19 text tiles, 4/6/5/6 columns, R1 green |
| Videos back | match — 4 loops attach on intersection, pause off-screen; coffee excluded by ruling |
| Pumpkin Marshmallow shows marshmallow | match in photo + video; swatch fixed at source (asset only, no page renders swatches) |

## ceiling
Unused native devices of the committed world: the ground shift toward the peak is a static warm band, not scroll-driven; the 9/02 "lid-off swipe" moment is not built; the four world stops rely on native scroll, no scrubbed choreography; 13 scents have no world imagery and are carried by type (honest, but a ceiling).

## material_fixes
1. produce: the hero jar and the pinned passage jar as a real photograph (Shauna's shoot, shot list issued) — until then invented label text is visible at ≥300px render width. No CSS answer that keeps the product visible.
2. produce: scent-world stills (and loops) for the 13 scents without one, plus a coffee world on a cream ground — thelma's $50 fal tier; blocked on fal TOP_UP.
3. Mobile mood filter: wrapped to two lines with an orphaned interpunct at the line start → resolved this round (single scrolling row on phones).
4. Passage check script scrolled to `offsetTop` relative to `.worlds`, not the page, making the first viewport captures misleading → resolved (page-absolute scroll); recaptures show the jar centered in the ring.

## keep
The text-only grid with weight + underline selection, and the pinned-jar passage on cream: do not re-introduce tints, icons, rings, or frames while producing the assets above.

## verdict (after the fix batch)
- 1 unresolved — asset, not code (Shauna's shoot)
- 2 unresolved — asset, paid, awaiting Brenda + fal top-up
- 3 resolved (`screens/v3/shop-single-mobile.png`)
- 4 resolved (`screens/v3/passage-*.png`)
- regressions introduced by the batch: none observed

remaining: 1 and 2 (both photography). disposition: fix — the code ships; the open findings are assets only.
