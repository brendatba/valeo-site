# Valeo Body — v2 Design Ruling (Zaha, 2026-09-11)

Brenda sent v2 back: *"this is not the standard I would hold you to... using impeccable, this kind of looks like AI slop."* She named what to keep: the mode → grid → variants → sticky-bar interaction model. Everything below rules on the visual execution only. I ran this against `bar.md` (the 7 measurements Brenda locked 2026-09-02) and `impeccable`'s craft floor. Read both before you touch code; this document doesn't restate them, it applies them.

**Interaction model stays exactly as built.** Nothing here touches `catalog.json`, pricing, cart, Venmo, or the Playwright test *behavior* — only the shell around it. Where a test's DOM contract needs to survive unchanged, I say so explicitly.

---

## 1. Verdict on the read — confirmed, plus what I found

All five of your reads are confirmed. In order:

1. **Chip wall — confirmed, and it's the whole problem.** 19 tiles, each individually pastel-tinted from `catalog.json`'s `tint` field, each carrying a flat literal-icon SVG (a cartoon pistachio, a cartoon coffee bean). Bar measurement 6 bans exactly this. `impeccable`'s craft floor separately bans it under **Refuse → Surface habits**: *"Unicode glyphs or emoji standing in for an icon system."* These swatches are that.
2. **Hairlines — confirmed, worse than you flagged.** `--line` (#E2DACB) appears in the header border-bottom, footer border-top, every `seg-opt`/chip/tile inset ring, the totals divider, the cart drawer (head, foot, every line item), and every checkout field. It is the single most-repeated token in the build.
3. **Button discipline — confirmed, and it's not just the two `btn-primary` instances you counted.** On the shop screen, every selected product/size/mood pill fills solid green when active (`aria-pressed="true"` → `background: var(--green)`). Visually those read as filled buttons too. The real count of "filled-looking controls" per shop screen is 4–6, not 1.
4. **Template composition — confirmed.** Hero → 3-card "ways" grid → chip strip → 2 ingredient cards with pill-chip tag lists → 3 numbered-circle steps. That's a stacked home page, not a shop.
5. **13 of 18 imageless tiles — confirmed as the root cause of the icon crutch.** Fixed below.

**What you missed, that a straight `impeccable` craft-floor pass also catches:**

6. **Two unconditional-ban eyebrows.** The hero has `<span class="eyebrow">Handmade body butter & scrubs · est. 2025</span>` sitting above the H1, and the footer has an `.eyebrow` reading "GET IN TOUCH." Craft floor is explicit: *"A kicker or eyebrow above a heading. This one is a ban, not a default: no brief earns it back."* Both die — no exceptions, not a redesign call.
7. **A corner "Fall" badge** on the Pumpkin Marshmallow tile. Badge chrome, same family as the check-overlay — dies with the rest.
8. **18 individually-tinted backgrounds are also, independently, an accent-discipline failure**, not just a chip-wall failure. Measurement 5 caps one accent color at three uses per viewport; the grid alone burns through as many as 18 competing colors at once. This is worth calling out on its own because fixing the chip-wall problem (killing the icons) would not automatically fix this — the tint fills have to die too, specifically.

---

## 2. The picker grid system

**"One screen" — the real definition, taken from your own Playwright spec (`R1`), not invented by me:** the grid of all 19 items must be fully visible within the current viewport height, and the product + size controls reachable within **two** viewport heights total, with no horizontal scroll, on both a 390px phone and a 1440px desktop. That's the actual contract already locked in `tests/`. Don't tighten it to a literal single fold — you'd break a passing test to satisfy a stricter reading than Brenda asked for.

**The tile, rebuilt as text, not chips:**

- Every one of the 19 tiles — imaged or not — is typographically identical at rest. **No photography inside the grid, ever.** This is the fix for "two visual classes fighting": remove the second class entirely rather than reconcile it.
- Tile content at rest: the scent **name** only (Cormorant Garamond, one size, ~0.85–0.95rem depending on breakpoint), left- or center-set, sitting directly on the shared page ground — no tint fill, no card background, no border, no shadow. Tiles are separated from each other by whitespace (generous grid gap, 12–16px) and by nothing else. That's two type sizes max at rest (name; a numeral prefix counts as the same size family, see below) — satisfies measurement 2.
- **Mood does not render on the tile at all.** It already has a home — the mood filter row (below) and the world panel when a scent is selected. Repeating it as a colored dot on every tile is decoration with no job once the filter row exists.
- **`tint` survives only as data, in one place**: a ≤8% opacity wash behind the world panel (not the grid) when that scent is selected — see Chrome, below. It never fills a tile, chip, or badge again.
- **The 13 imageless scents and the 5 imaged scents render the *same* tile.** The imagery moves entirely to the world panel outside the grid. This is the actual answer to "how do 13 imageless tiles read beautifully" — they're not competing with 5 photographic ones inside the same 90px cell, because nothing in the grid is photographic.
- **Selected / unselected:** unselected = regular weight, `--ink-soft`. Selected = bold weight, `--green-ink`, plus a 2px underline in `--green` offset ~3px below the name — a text state, not a badge, not a ring, not a fill. This replaces the green ring + white check-circle entirely.
- **Hover:** underline appears at 50% opacity on hover, full opacity on selection. No lift, no shadow, no scale.
- **Focus-visible:** unchanged — the existing global `outline: 3px solid var(--green); outline-offset: 3px` already does the job and already themes the browser default correctly. Don't touch it.
- **Disabled:** not applicable to fragrance tiles (all 19 are always choosable). No disabled state to design here.
- **Flight slot number / sample counter:** replaces the corner pill entirely. Render as a small tabular-numeral prefix in `--gold`, inline, same baseline as the name, directly to its left — e.g. "**1** Pistachio Salted Caramel" — like a numbered list marker, not a sticker. This is one of your gold budget uses per viewport; keep the total gold count in view (see token diff).
- **Grid geometry:** mobile ≤639px: 4 columns. Tablet 640–899px: 6 columns. Desktop ≥900px: 8–9 columns. Tiles are far shorter now (no icon, no absolute-positioned chrome), so higher column counts than the current build are legitimate and help satisfy the one-and-a-bit-viewport contract. Minimum tap target stays ≥44px tall regardless of column count.
- **The "Other" tile** stays last, same treatment, "+ Other" as the name-equivalent.

---

## 3. The chrome

**Mode tabs (Single jar / Slab flight / Sample minis):** drop the `--cream-2` pill container and the `--shadow-sm`-lifted active pill entirely. Render as three plain words in a row, generous gaps (~32–40px), inactive = regular weight `--ink-soft`, active = bold `--green-ink` + the same 2px green underline used on tiles. Same selection vocabulary everywhere — that consistency is the point.

**Mood filter row:** same transformation. Kill the 6 shadowed, dot-carrying pill chips. Render as a plain inline text list — "All · Sweet & Bakery · Fruity & Fresh · Warm & Cozy · Calm & Floral · Seasonal" — separated by a plain interpunct, active = bold + underline, inactive = regular. No dots, no backgrounds, no per-mood color at all in the filter row itself (the 5 mood colors in `catalog.json` can stay as data; they no longer need to render anywhere in this build — that's fine, a color existing in data with no on-screen use isn't a violation).

**Product/size/quantity variant pills (`seg-opt`):** currently solid-fill green when selected — that's a second filled-button system fighting the sticky bar. Kill the fill. Selected = bold weight + underline, same as everything above. Unselected = regular weight, flat background (page ground or one step lighter, e.g. `--paper` on `--cream`), no inset stroke. Disabled (unavailable product/size combos) keep the existing strikethrough + reduced opacity — that's a legitimate disabled state, leave it.

**The result: exactly one filled-background control exists on any given screen — the sticky Add/Update button.** Everything else that indicates "selected" does it with weight and underline. That is the concrete, checkable form of measurement 7, applied consistently instead of just at the two `btn-primary` spots you noticed.

**Sticky add-to-cart bar:** stays. Remove `border-top: 1px solid var(--line)`; replace with a soft upward shadow (blur + offset, e.g. `0 -6px 20px rgb(47 74 42 / .10)`) on the existing blurred backdrop. That's a real shadow, not a hairline — allowed.

**Header:** remove `border-bottom: 1px solid var(--line)`. The sticky blur + the cream-vs-paper tone shift is enough separation; if you want more, add a scroll-triggered soft shadow (optional, not required to ship).

**Footer:** remove `border-top: 1px solid var(--line)`. Separation comes from the existing background color shift to `--cream-2` plus generous top padding — that already does the job without a rule. Kill the `.eyebrow` "GET IN TOUCH" label — just start the contact block with the phone number directly, or use a plain (non-eyebrow-styled) small heading if a label is truly needed.

**Cart drawer:** kill all four hairlines (`.drawer-head` bottom, `.drawer-foot` top, `.line` bottom, `.totals` top). Head/foot separate from the body via a background-color step (`--paper` body against a `--cream-2` foot band) instead of a rule. Line items separate via vertical gap alone (16–20px), not a border. Kill the per-line flat swatch icon (`f.swatch`) in `lineView()` — text-only line items until real jar photography exists; the flight/sample line images (`slab.image`, `samples.image`) are real photography already and stay.

---

## 4. Page composition

**Home**

- Hero: jar photo floats directly on the cream ground — no rounded card container, no `--cream-2` background box, no shadow. Generous margin on all sides (≥25%, per measurement 3). Kill the `.eyebrow` line above the H1. Keep tagline once, keep pillar strip but simplify: 4 pillar words separated by a single small gold dot *between* words (not one dot per word) — 4 words = 3 separator dots = exactly at the gold budget of measurement 5. One filled button ("Shop scents"); "Build a flight" stays outline/ghost.
- **"Three ways to order" — kill the card grid, keep the three `.way` links (test contract: `.way` count of 3 with the same three hrefs stays exactly as is).** Strip the white paper background, the shadow, the rounded-corner overflow wrapper. Each becomes: photo floating on cream (no frame) → name + one line + price directly beneath in plain text, no divider between the three. Three unboxed product presentations sharing the page ground, not three cards.
- **"18 scents, one screen" chip-wall section — the section's *purpose* (crawlable scent names) stays for SEO; its *visual form* dies.** No test asserts tint, icon, or pill styling on `#scents-preview span` — it only asserts a count and text content. So: keep the `<span>` per fragrance in the DOM (test stays green), delete the `--tint` background, delete the swatch `<img>`, and typeset it as a single flowing line of plain body text ("Pistachio Salted Caramel, Cashmere Vanilla, Raspberry Lemonade — and 15 more scents.") rather than 19 discrete pill shapes. This is the one place I'm telling you to change behavior without touching a test, because the test never required the chip-wall look — that was purely a styling choice layered on top of a legitimate DOM contract.
- **The 4-image "scent worlds" strip gets promoted, not kept as a buried mid-page grid.** It becomes the home page's actual peak moment (see signature move, below) — pull it out of this section entirely.
- **"What's in it" — kill both white shadow cards and the pill-chip ingredient tags.** Two plain text blocks side by side (or stacked on mobile) on the shared ground: product name as a small heading, one-line blurb, then the ingredient list as plain comma-separated prose, not chips.
- **"How ordering works" — kill the numbered-circle 3-card grid entirely.** This is explicitly on the refuse list (numbered-step builders / 01-02-03 counters). Replace with three short lines run as plain text, each opening on a bolded action ("**Pick and add.** Choose your scents..."), no digits, no circles, no cards, no shadow.

- **Where the signature move lives:** the locked one-screen picker on the shop page is deliberately *not* a scroll-choreographed surface — that's what "one screen, tap to build" means, and it's correct that it stays fast and static. The scrollcraft peak survives on **home**, which isn't bound by the one-screen constraint. Promote the 4–5 real "world" photographs (pistachio, vanilla, chamomile, coffee, pumpkin — the fifth, pumpkin marshmallow, is your engineered peak) into a full-bleed pinned scroll passage between the hero and the ingredients section: the jar stays roughly in place, the world imagery scrubs past behind/beside it as you scroll, warming toward the pumpkin frame as the peak. If this is a heavier build than tonight allows, ship the static ordered strip first (larger, full-bleed, one per full viewport height, no card chrome) and treat the scroll-scrub behavior as the next pass — but the strip's *composition* should already be built to receive that behavior, not buried at chip-wall scale mid-page.

**Shop / picker**

- Head + mode tabs + mood filter as specified above.
- **New: a world panel**, sitting above the grid on mobile, sticky beside it on desktop (reuses the existing `.picker-side`/scent-head slot, enlarged). If the selected scent has a `hero` image: photo on top (no border, no frame), name in large serif directly beneath, note in one line beneath that — text never sits on top of the photo (keeps contrast honest). If the selected scent has no `hero` image (13 of 18): **no placeholder image, no stock substitute, no gray box** — the name renders very large (3–4rem serif) with the note beneath in a longer, quieter line. Typography carries the moment when photography doesn't exist yet — that's an honest answer to "what we have to shoot with," not a workaround.
- Grid as specified.
- Flight/sample slot rail: kill the `--line` inset stroke on `.slot`; unfilled/empty state loses the dashed border too, becomes a flat lower-opacity fill with "tap to add" text only — consistent with zero-hairlines applied literally.
- Totals: no divider above the total line. Separate it with a scale and weight jump (bigger number, bolder weight) and extra space above, not a rule.
- Sticky bar as specified in Chrome.

**Checkout / confirmation**

- Checkout is the one place I'm keeping a soft card surface for the form — this is Operate mode (a task to complete, not a page to be persuaded by), and `impeccable`'s mode framing puts scanability and consistency ahead of the card-ban here. What still has to go: the field hairline borders (replace with a flat fill-color difference between field and page, focus ring already handles the "engaged" state), the radio-row inset stroke (replace with fill difference the same way), the summary-card's total divider (kill it, same scale/weight treatment as the shop totals), and the Venmo confirmation box's colored inset border (soften to a background tint only, no stroke).
- One filled button here too — "Place order" / eventual Venmo CTA. "Edit" stays a text link, already correct.

---

## 5. Token diff

Against `src/styles/tokens.css`:

- **`--line` — delete.** Every current consumer (header, footer, seg-opt, chip, tile, totals, drawer ×4, checkout fields, radio-row) is rebuilt above to use whitespace, a background-color step (`--cream` / `--paper` / `--cream-2`), or a real shadow instead.
- **`--r-md` (14px) and `--r-lg` (22px) — narrow their scope drastically.** Once "cards" (`.way`, `.ing-card`, `.step`, the tinted tile background) are gone, almost nothing needs a box radius. Keep `--r-lg` narrowly for the cart drawer's sheet edges (a real modal, not a decorative card) and the checkout form surface (the one legitimate Operate-mode card). Everything else that used to be a card no longer has a radius to apply because it no longer has a box.
- **`--r-pill` — keep, but its use shrinks to true pills only**: the sticky Add/Update button, "Place order," any remaining ghost/outline button. Mode tabs, mood filter, and variant selectors no longer render as pill shapes at all (they're text now), so they stop consuming this token.
- **`--shadow-sm` / `--shadow-md` — keep both, but stop using them on anything that used to be a "card."** Legitimate remaining uses: the cart drawer sheet, the sticky bar's new upward shadow, the checkout form surface. Never on a product photo (measurement 1: a photo needing a box means the photo isn't good enough).
- **The 18 `tint` hex values in `catalog.json` — no longer read into any grid/tile/chip CSS.** Add exactly one new consumer: a ≤8% opacity wash on the world panel background when that scent is selected. Everywhere else that read `--tint` (tile, chip, slot) stops doing so.
- **New token to add: one underline/weight "selected" spec**, so it's applied identically everywhere instead of hand-tuned per component — something like `--sel-weight: 700; --sel-underline: 2px solid var(--green); --sel-underline-offset: 3px;`. This is the token that replaces the green-fill / check-badge / ring family across tiles, tabs, filters, and variant pills.
- **Gold (`--gold`) budget stays at ≤3 visible marks per viewport** — pillar separators (3), the flight/sample numeral prefix where applicable, and nowhere else new. Don't let it creep back in as a fourth accent use anywhere in this rebuild.

---

## 6. The gate — run this yourself before it ships

1. `grep -r "var(--line)" src/` returns zero hits (outside a comment noting the token is retired).
2. Per screen (home, shop×3 modes, checkout, confirmation): count elements with an opaque/filled `background-color` acting as a control state. Must equal **1** — the sticky/place-order button. Everything else uses the underline/weight spec.
3. `grep` the tile/chip/slot CSS for `background: var(--tint` — zero hits outside the world panel's ≤8%-opacity rule.
4. `grep` `home.ts`/`picker.ts` for `f.swatch` or `.swatch` rendered inside `#grid .tile` — zero hits. (Cart-drawer bundle-image `<img>` tags are unaffected and expected.)
5. `grep` for `.badge`, `.check` (checkmark overlay), and the `Fall` tag markup — all removed from CSS and templates.
6. `grep` for `class="eyebrow"` — zero hits anywhere (hero and footer both cleared).
7. Count distinct computed `font-size` values among a tile's direct children at rest — ≤2 (name + numeral prefix, same family).
8. Screenshot check: measure whitespace around the hero jar photo and each "ways" photo on all four sides — ≥25% of the tile's box, per measurement 3.
9. Screenshot check, one viewport at a time (home hero, shop single-jar, checkout): count visible instances of gold — ≤3 each.
10. Visual gut-check on the same screenshots: cream/paper reads as the dominant ground, green is the only other structural color at scale, gold is genuinely rare. (Not mechanically greppable — this is the human confirmation of #9.)
11. `grep` `.way`, `.ing-card`, `.step` CSS rules for the combination of `background: var(--paper)` + `box-shadow` + `border-radius` — zero hits on all three (the card-scaffold signature is gone).
12. `grep` for `counter-increment` / `counter(step)` / any `::before { content: counter` — zero hits (numbered-step counters gone).
13. `grep` `.ing-list li` CSS for `border-radius: var(--r-pill)` — zero hits (ingredient pills gone).
14. Confirm every `<img>` in the shipped build resolves to a real file under `public/` — none are CSS gradients standing in for a photo.
15. Re-inspect every product/world photo at its actual on-site crop for legible fake label text (the "Calming Botanical Body Butter / Pineapple Coconut Vanilla" defect) — none visible at any breakpoint.
16. Run `npx playwright test` — all existing specs pass unchanged, including `R1` (19 tiles, ≤2-viewport reach), `R4` (home contract, including `#scents-preview span` count), `R5`, `R6`, `R7`. DOM selectors and counts are untouched by this ruling; only the CSS/markup styling inside them changes.
17. Re-run Lighthouse — stays ≥92. Removing card shadows/shadows and flat SVGs should help; if photography weight regresses it, fix image sizing/format before shipping, don't drop the standard.
18. Tab through the shop page with a keyboard — the 3px green focus ring is visible on every tile, tab, filter, and variant control, including the new text-only selected states.
19. Confirm the `prefers-reduced-motion` block in `base.css` is untouched and still short-circuits all transitions.
20. Log this build in `FINGERPRINTS.md`; confirm it differs from every previously shipped page on at least 4 of the 6 fingerprint dimensions (it will, trivially, on craft alone — log it anyway so the registry stays honest).
21. One blind-critic pass (Brief / Craft / System, labels stripped) on the home hero and the shop single-jar screen only — reserve credits, don't run it on every screen.

---

## 7. What I am not taking on, and why

- **No new image generation tonight** — fal/Kie credits are exhausted. Everything above is designed to look intentional with the 5 photos we already have plus zero photos for the other 13 (typography carries that gap honestly, per the world panel rule).
- **The video treatment for the 5 returning scent-world clips is Thelma's ruling, not mine.** What I'm committing to structurally: the world panel (and the home page's promoted "world" passage) are built to the same aspect/placement whether they hold a static photo or a video — so Thelma's ruling drops in without a rebuild. **A video can never sit inside a grid tile** — tiles are text-only, permanently, regardless of what footage exists; video only ever lives in the world panel or the home-page scroll passage, outside the grid.
- **Per-scent ingredient/ordering data, Venmo handle, business-vs-personal profile, Flight Option C pricing** — still blocked on Shauna per `bar.md`; not a design decision.
- **The "No Chemicals" / "Organic" pillar copy** — `BRIEF.md`'s copy law says drop these claims, but the locked Playwright test (`R4`) still asserts that exact pillar text. That's a compliance/copy conflict sitting in the build already, not something I introduced or am resolving here — flag it to Brenda before shipping; don't let a design pass silently paper over a claims problem.
- **Cart logic, pricing math, Venmo deep-link generation, checkout validation, `catalog.json`'s data shape** — untouched. This ruling is shell-only, as instructed.
- **Whether Stripe replaces Venmo** — still open per the brief, out of scope tonight.
