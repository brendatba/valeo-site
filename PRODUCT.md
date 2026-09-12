# Product

<!-- impeccable:product-schema 1 -->

<!-- Written 2026-09-11 from VALEO_BUILD_BRIEF.md (Brenda), the 9/02 SITE-ENGINE intake (BRIEF.md, bar.md), and Brenda's design review of v2. Facts marked [inferred] were not confirmed by an interview because Brenda instructed the build to continue without one. -->

## Platform

web

## Users

Women buying handmade body butter and scrubs for themselves and as gifts, on their phones, usually after meeting Shauna or seeing @valeobody on Instagram. The job: pick a scent (any of 18), a product, and a size without hunting through pages, or build a slab flight (the gift) or a five-mini sample set (the decision), then hand the order to Shauna and pay her on Venmo. Repeat purchase is the single jar.

## Product Purpose

Valeo Body is Shauna's small, local, woman-owned Washington brand of whipped body butter and sugar/salt/coffee scrubs, est. 2025. The site exists so a customer can order without a text-message back-and-forth: choose, place the order, get an order number, Venmo the total with that number in the memo. Success = a completed order Shauna can reconcile by memo line.

## Positioning

"I am able. I am strong." (from the Latin *valeo*). One jar, eighteen scents, every scent in every product. The ordering mechanism a neighbor could not copy: all 18 fragrances are picked from one screen, and flights/sample sets are built from that same screen. Small batch, plant butters and essential oils, made in Washington, sold by a person you can text.

## Operating Context

Pickup or local delivery only. Payment is Venmo, off-site; the site never takes money. Shauna edits `data/catalog.json` on GitHub to change prices or fragrances. Orders reach her by SMS/email hand-off (and an optional serverless endpoint). Real product photography does not exist yet; a shot list has been issued.

## Capabilities and Constraints

- Products: Body Butter, Sugar Scrub, Salt Scrub, Coffee Scrub. Sizes 2/4/6/8/16 oz. 18 fragrances + "Other" (free text), each with a mood tag (Sweet & Bakery, Fruity & Fresh, Warm & Cozy, Calm & Floral, Seasonal).
- Bundles: Live Edge Slab flights (A: 3×4 oz, B: 4×2 oz, C: 8 oz butter + 8 oz scrub; 15% off jars + $15 slab). Sample minis $5 each, 5 for $20.
- Locked interaction model (Brenda, 2026-09-11): mode tabs (Single jar / Slab flight / Sample minis) → one-screen fragrance grid → product + size → sticky add-to-cart. All 18 tiles visible with product/size reachable within two viewport heights at 390 px.
- Static site, Vite + vanilla TypeScript, plain CSS custom properties, GitHub Pages. Lighthouse mobile ≥ 90 perf / ≥ 95 a11y is a shipping gate.
- Undecided: Venmo handle (and business vs personal profile); Option C price ($57.50 is derived); delivery radius/fee; whether the pillar claims "No Chemicals" / "Organic" stay (brief says verbatim; 9/02 copy law dropped them; escalated to Brenda).

## Brand Commitments

- Wordmark VALEO BODY; also "Valeo Body Care". Lotus / white-flower mark. Tagline shown exactly once, italic serif.
- Pillar strip text as supplied by Shauna (see undecided claim above).
- Palette: cream ground, deep botanical green, sage, warm gold. Light theme only, never dark or "luxury-muted".
- Type: Cormorant Garamond (display) + Nunito Sans (text). Script/italic only for the tagline.
- Voice: warm, plain, confident, short sentences, no luxury adjectives.
- Imagery direction from Shauna's Pinterest board: bright, airy, ingredient-forward; jar surrounded by its literal ingredients on cream or a soft scent tint; jar + live-edge wood slab motif; info-graphic ingredient callouts.
- The bar (bar.md, Brenda 2026-09-02): photography on plain single-colour ground; ≤2 type sizes per product tile; ≥25% whitespace around product images; zero hairline dividers; one accent ≤3 uses per viewport; scents as named things with a note, never a chip wall; one filled button per screen.

## Evidence on Hand

- Five scent-world flat-lay stills (`public/products/world-*.jpg`) and four usable 5-second loops (`public/video/w-{chamomile,pistachio,pumpkin,vanilla}.mp4`); the coffee master is shot on a dark ground and is excluded until reshot/regenerated.
- AI jar renders (`public/products/*.webp|jpg`) with hallucinated label text — never crop tight enough to read the label.
- No real photography, no testimonials, no press. Do not fabricate any.
- Catalog and pricing transcribed from Shauna's 2025 order sheet and flyer.

## Product Principles

1. The scent is picked, not found: every choice is on one screen.
2. One jar looks worth its price; the ordering process stays out of the way.
3. Nothing dark, nothing moody, nothing "luxury": bright, ingredient-forward, celebratory.
4. The catalog is the catalog: data changes never need code.
5. An order is never lost: on-screen summary, memo line, and a hand-off path that always works.
