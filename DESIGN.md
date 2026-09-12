---
name: Valeo Body
description: Dairy-cream storefront where one jar stays put and eighteen scent worlds move past it
colors:
  cream: "#F6F1E7"
  cream-deep: "#EEE6D6"
  paper: "#FDFBF6"
  botanical-green: "#2F4A2A"
  botanical-green-light: "#3E5E38"
  green-ink: "#1F3320"
  sage: "#9DB394"
  sage-soft: "#E1E8DB"
  gold: "#C9A24A"
  ink: "#1F2A1D"
  ink-soft: "#5A6657"
  ink-mute: "#8A938A"
  danger: "#A63D2F"
  peak-warm: "#F4E7D4"
  venmo-wash: "#E9F0FA"
typography:
  display:
    fontFamily: "Cormorant Garamond, Times New Roman, Georgia, serif"
    fontSize: "clamp(2.6rem, 8vw, 5rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Cormorant Garamond, Times New Roman, Georgia, serif"
    fontSize: "clamp(1.9rem, 4.6vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.02
  title:
    fontFamily: "Cormorant Garamond, Times New Roman, Georgia, serif"
    fontSize: "clamp(1.3rem, 3vw, 1.7rem)"
    fontWeight: 600
    lineHeight: 1.1
  product-name:
    fontFamily: "Cormorant Garamond, Times New Roman, Georgia, serif"
    fontSize: "1.02rem"
    fontWeight: 600
    lineHeight: 1.12
  tagline:
    fontFamily: "Cormorant Garamond, Times New Roman, Georgia, serif"
    fontSize: "clamp(1.5rem, 4.2vw, 2.1rem)"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "Nunito Sans Variable, Nunito Sans, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  lede:
    fontFamily: "Nunito Sans Variable, Nunito Sans, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.05rem, 2.2vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Nunito Sans Variable, Nunito Sans, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: ".95rem"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  field: "10px"
  media: "6px"
  slot: "8px"
  sheet: "22px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "10px"
  md: "18px"
  lg: "28px"
  xl: "48px"
  gutter: "clamp(18px, 5vw, 48px)"
components:
  button-primary:
    backgroundColor: "{colors.botanical-green}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.botanical-green-light}"
    textColor: "#FFFFFF"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.green-ink}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "50px"
  text-button:
    backgroundColor: "transparent"
    textColor: "{colors.green-ink}"
    typography: "{typography.label}"
  input:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 14px"
    height: "50px"
  form-surface:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.sheet}"
    padding: "24px"
  slot:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.green-ink}"
    rounded: "{rounded.slot}"
    padding: "8px 32px 8px 12px"
---

# Design System: Valeo Body

## Overview

**Creative North Star: "The Jar on the Counter"**

One jar, photographed once, sits on dairy-cream and never moves. Everything else on the site is what surrounds that jar: the pistachios, the vanilla pods, the lavender, the toasted marshmallow. The customer is a woman on her phone deciding which world she wants around her jar, so the interface stays out of the way. It is bright, airy, ingredient-forward and celebratory, never dark, moody, or "luxury" muted.

The system is typographic before it is graphic. Product words (scent names, jar names, totals) are set in Cormorant Garamond at generous size; everything operational is Nunito Sans. Selection is a text state, weight plus a green underline, applied the same way to a scent tile, a mode tab, a filter word, and a size option. There is exactly one filled control on any screen. Nothing is boxed: no hairline rules, no chip pills, no badges, no cards. Photographs float directly on the ground.

**Key Characteristics:**
- Dairy cream ground; botanical green is the only structural color; gold appears at most three times per viewport as separator dots or slot numerals
- Selected = `font-weight: 700` + 2px green underline offset 4px; never a fill, ring, or check
- One filled button per screen (the sticky add-to-cart, or Place order)
- Zero hairline dividers: separation by whitespace, a tonal step (cream → paper → cream-deep), or a real soft shadow
- Photography and video on the page ground, unframed; the four scent loops play only when scrolled into view

## Colors

A cream ground with one deep green voice and a rare gold accent; the scent worlds themselves supply the color.

### Primary
- **Botanical Green** (#2F4A2A): the filled button, the selection underline, the focus ring, links. **Green Ink** (#1F3320) is the reading color for every product word and heading.
- **Botanical Green Light** (#3E5E38): button hover, the tagline, mood labels inside a note.

### Tertiary
- **Gold** (#C9A24A): the three separator dots in the pillar line, the numeral that marks which slot a scent fills. Nowhere else.

### Neutral
- **Cream** (#F6F1E7): page ground. **Paper** (#FDFBF6): one step up, for the checkout form surface, flight/sample slots, and the cart sheet. **Cream Deep** (#EEE6D6): one step down, for the footer band and the cart drawer's foot.
- **Ink** (#1F2A1D) body text; **Ink Soft** (#5A6657) secondary text, unselected controls; **Ink Mute** (#8A938A) separators.
- **Peak Warm** (#F4E7D4): the single warm band behind the Pumpkin Marshmallow stop, the only ground shift on the site.
- **Danger** (#A63D2F): validation only.
- Each fragrance carries a `tint` in the catalog; it may wash the world-panel background at ≤8% (`color-mix`) and nothing else.

### Named Rules
**The One Filled Control Rule.** Per screen, exactly one element has an opaque filled background acting as a control. Every other state is weight and underline.
**The Three Gold Marks Rule.** Gold is visible at most three times in any viewport.
**The No Hairline Rule.** `--line` was retired. Nothing separates with a 1px stroke.

## Typography

**Display Font:** Cormorant Garamond 600 (500 italic for the tagline), self-hosted via @fontsource, fallback Georgia
**Body Font:** Nunito Sans Variable, fallback Segoe UI / Helvetica

**Character:** the serif carries every word that names a product or a scent, so the catalog reads like a label; the humanist sans does the operating.

### Hierarchy
- **Display** (600, clamp(2.6rem, 8vw, 5rem), 1.02): the wordmark H1 on home, the world-stop scent names on the passage.
- **Headline** (600, clamp(1.9rem, 4.6vw, 3rem), 1.02): section H2s, "Pick your scent", world-panel scent name (`.world-name.big` reaches clamp(2.3rem, 7vw, 3.4rem) when there is no photo to carry the moment).
- **Title** (600, clamp(1.3rem, 3vw, 1.7rem), 1.1): product names in "Three ways", ingredient headings, cart line names (1.15rem), flight totals (1.5rem).
- **Product name in the grid** (600, 1.02rem mobile / 1.15rem desktop, 1.12): every scent tile.
- **Tagline** (500 italic, clamp(1.5rem, 4.2vw, 2.1rem)): shown once.
- **Body** (400, 16px, 1.5); **Lede** (400, clamp(1.05rem, 2.2vw, 1.25rem), 1.55, max 44ch).
- **Label** (700, .95rem): control group labels, pillar words, nav.

### Named Rules
**The Serif Names Things Rule.** If a word is a scent, a product, a total, or the brand, it is Cormorant. If it is an instruction or a price sub-label, it is Nunito Sans.

## Layout

Single content column of `min(100% − 2·gutter, 1200px)` with `gutter = clamp(18px, 5vw, 48px)`. Home is a vertical passage: hero (two columns ≥720px), then `.worlds`, where a `position: sticky` jar is pinned at 50svh while each `.world-stop` (min-height 100svh, content centered) scrolls past; on ≥900px each stop is `minmax(0,1fr) 320px` with the name column at right. Shop is a two-column grid ≥900px (`minmax(0,1fr) 360px`, column-gap 48px) with the world panel and variant controls sticky in the right column; below 900px it is one column ordered head → modes → world → grid → variants. The fragrance grid is 4 columns on phones, 6 at ≥640px, 5 at ≥900px, 6 at ≥1200px. Section spacing is `clamp(56px, 9vh, 110px)` above each section, with more space above a heading than below it.

## Elevation & Depth

Flat by default. Depth comes from three tonal steps of cream and, in exactly three places, a real offset-and-blur shadow.

### Shadow Vocabulary
- **Sheet** (`0 10px 40px rgb(31 42 29 / .16)`): the cart drawer.
- **Bar** (`0 -8px 24px rgb(47 74 42 / .10)`): the sticky add-to-cart bar lifting off the page.
- **Jar drop** (`drop-shadow(0 22px 30px rgb(47 74 42 / .14))`, `0 26px 34px / .18` on the pinned jar): the cutout jar sitting on the counter.

### Named Rules
**The Photos Float Rule.** A product photograph never sits in a box, on a card, or behind a border. If it needs one, the photo is not good enough yet.

## Shapes

Rectangular and quiet. Media crops use 6px corners, inputs and slots 8–10px, the two legitimate sheets (cart drawer, checkout form) 22px. Only true buttons are pills. Selection is drawn with an underline, not a shape. Photographs on the ways section are soft-masked (radial) into the ground rather than cropped hard.

## Components

### Buttons
- **Shape:** pill (999px), height 50px, padding 0 26px, weight 700.
- **Primary:** Botanical Green on white text; hover to Botanical Green Light; disabled at 45% opacity, never a different color.
- **Ghost:** transparent with a 1.5px inset green stroke, used only beside a primary.
- **Text button:** green-ink 700 with a 1.5px underline offset 4px, for every secondary action.
- **Focus:** global `outline: 3px solid var(--green); outline-offset: 3px`.

### Selection controls (tiles, mode tabs, filter words, size and product options)
- **Style:** plain text on the ground, Ink Soft at rest, no container.
- **Hover:** green underline at 45% opacity.
- **Selected:** weight 700, Green Ink, 2px green underline. Size options carry a tabular-numeral price beneath at .8rem.
- **Disabled:** 35% opacity with a 1px line-through.

### Flight / sample slots
- Paper fill, 8px corners, 62px tall; gold numeral top-right; empty slots at 55% paper with "tap a scent"; active slot gets the underline vocabulary on its name. Totals stack without rules; the total line jumps to Cormorant 1.5rem.

### Inputs / Fields
- **Style:** no stroke; Cream fill on the Paper form surface, 10px corners, 50px tall.
- **Focus:** 3px green outline offset 2px. **Error:** 2px danger outline + message.
- **Radio row:** two cream tiles; the checked one goes Green Ink 800 with the selection underline.

### Navigation
- Sticky cream bar at 88% with 12px blur, no rule. Wordmark in Cormorant 700 tracked .14em with the lotus mark. "Shop" and "Cart n" as text; the count is a small green disc that turns sage-soft at zero.

### World panel / world stop (signature)
- Media (16:9 on phones, 4:3 in the shop's side column, 3:2 on the home passage) with 6px corners on the ground; scent name in Cormorant beneath, never over the image; note in Ink Soft with the mood in Green Light 700. Video loops are `muted playsinline loop preload="none"`, `src` attached on intersection, skipped for reduced motion and data-saver. The pinned jar (`.worlds-jar`) is the one authored motion.

## Do's and Don'ts

### Do:
- **Do** set every scent or product name in Cormorant Garamond 600 and let size carry hierarchy.
- **Do** indicate selection with weight + a 2px green underline, offset 4px, identically everywhere.
- **Do** separate with whitespace or a tonal step (Cream → Paper → Cream Deep).
- **Do** float photographs on the ground; use `mask-image` fades when a photo has its own ground.
- **Do** load video only on intersection with `preload="none"` and a still poster.

### Don't:
- **Don't** draw a 1px rule anywhere.
- **Don't** fill more than one control per screen.
- **Don't** put a scent in a tinted chip, a card, or behind an icon; the catalog's `tint` may only wash the world panel at ≤8%.
- **Don't** add kickers/eyebrows, badges, numbered-step counters, or emoji-class icons.
- **Don't** darken the ground; the only ground shift is the warm band at the Pumpkin Marshmallow peak.
