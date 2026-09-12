# Media ruling — Valeo storefront v2, scent-world videos + swatch

Written by Thelma (Media & Post Director). Covers media only — file choice, encode, load behaviour, cost. Zaha rules on where these land on the page and what the picker looks like; this doc assumes her slot, not designs one.

$0 spent tonight. Nothing generated, nothing paid.

---

## 0. What I checked before ruling anything

- Probed every master with `ffprobe`: all five `art/video/world-*.mp4` are h264, 1920x1080, 24fps, 5.04s, no audio stream.
- Pulled the "light" set already committed on `main` (`git show main:assets/light/w-*.mp4`) and probed those too: 960x540, 24fps, 688 Kbps–1.2 Mbps, 434KB–757KB each, **2.71MB total for all five** — matches what you were told, confirmed not assumed.
- Pulled the heavy `assets/w-*.mp4` and `assets/w-*-m.mp4` sets and probed them. **Correction to the brief: the `-m` files are not portrait.** They're 1280x720 landscape, actually *heavier per-pixel* (7.4 Mbps) than the desktop set. They're a stale export from before the light pass, not a mobile crop. Don't ship them as-is; don't treat "mobile-portrait variant" as something we already have — we don't.
- Extracted frames from the pumpkin master and the shipped still (`public/products/world-pumpkin.jpg`) and looked at them directly. Both clearly show toasted marshmallow cubes alongside the pumpkin wedges — the **video and photo are correct**. The bug is isolated to the flat SVG swatch. Checked the other 17 swatches against their names for the same failure mode — pumpkin-marshmallow is the only one missing a promised ingredient; every other multi-note swatch (marshmallow-vanilla-kisses, honey-vanilla, coconut-lime, etc.) draws both notes it names. This is a one-line bug, not a systemic one.
- Extracted a mid-clip frame from the coffee master and looked at it: genuinely dark near-black-brown backdrop, not a grading illusion. Ran two real ffmpeg grades against it (`eq` brightness/contrast/saturation lift, and a three-channel `curves` shadow lift) and looked at both results side by side with the original. Neither reads as bright/cream — the backdrop itself is a dark seamless, not an underexposed cream one, so no amount of reasonable curve work turns it into the other four scents' aesthetic without crushing the beans flat. Brenda's read is correct, and it isn't a $0 fix.
- Re-encoded all five masters into the actual target format (960x540, CRF 28, no audio, faststart) and diffed a frame against the currently-committed light file: visually indistinguishable at delivery size. Total for a fresh encode of all five: **792KB**, a third of what's currently sitting in git. The committed light set is a bitrate-targeted encode, not a quality-targeted one — it's carrying weight it doesn't need to.
- Confirmed in code (`grep` across `src/`, `shop/`, `index.html`) that **v2 currently wires in zero video and zero hero stills** — no `.mp4`, no `<video>`, no `hero` reads. `catalog.json` has the `hero` field on 5 fragrances and nothing reads it. This is a full regression from v1, not a partial one — Brenda's memory of "we had these" is correct, they exist on disk and in git, they're just not connected to anything right now.
- Read `tests/home.spec.ts` — the only load-bearing check for new media: `document.images` must all carry `alt`. A `<video poster>` isn't an `<img>`, so it doesn't trip this, but if the build uses an `<img>` swap pattern instead, it needs `alt=""` (decorative — the scent name already carries the meaning).
- Read `scripts/lighthouse.mjs`: gate runs **mobile-emulated, simulated-throttle** Lighthouse (390×844, DPR 2) on home/shop/checkout, needs perf ≥90 + a11y ≥95. Home is currently 92 perf with **zero video weight and a 3.2s LCP already**. There is no room to let video anywhere near the critical path.

---

## 1. The five videos, brought back

**Ship four tonight: chamomile, pistachio, pumpkin, vanilla. Coffee sits out — see 1c.**

### 1a. Encode
Don't re-use the git-committed `assets/light/*.mp4` blobs — they're heavier than they need to be for identical visual output. Re-encode from the untouched masters instead:

```bash
for f in chamomile pistachio pumpkin vanilla; do
  ffmpeg -i art/video/world-$f.mp4 \
    -vf "scale=960:540" -c:v libx264 -preset slow -crf 28 \
    -pix_fmt yuv420p -movflags +faststart -an \
    site-v1/public/video/w-$f.mp4
done
```
- `-crf 28` (quality-targeted, not bitrate-targeted) is what gets the size down — verified: 121–184KB per clip, **703KB for the four**, visually matched frame-for-frame against the current light set at normal viewing size.
- `-an` because the masters carry no audio stream to begin with — nothing to strip, just don't let the muxer invent a silent track.
- No WebM/AV1 sibling. At <200KB per clip and never more than one loading at a time (see below), a second container buys negligible bytes for real build/maintenance cost. This is exactly the "don't pay for arithmetic you don't need" call — skip it.

### 1b. Poster, HTML contract, loading behaviour
- **Poster** = the already-shipped `public/products/world-{id}.jpg` stills. Already exist, already sized, already the thing Lighthouse would want as the LCP candidate anyway. No new asset.
- **Markup**, one per scent, wherever Zaha's layout puts the world slot:
  ```html
  <video class="scent-world" poster="{asset('products/world-pumpkin.jpg')}"
         muted playsinline loop preload="none" aria-hidden="true"></video>
  ```
  `aria-hidden` because the scent name + note text next to it already carries the meaning; the video is decorative motion, not content.
- **Load trigger**: play-on-intersection, not autoplay-on-load and not play-on-hover (hover doesn't exist on the phones this site is built for). One `IntersectionObserver` per page, `rootMargin: '200px'`, `threshold: 0.25`:
  ```js
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.src) v.src = v.dataset.src;   // lazy-attach, preload=none until now
        v.play().catch(() => {});             // catch: iOS can reject a rapid re-play
      } else {
        v.pause();
      }
    }
  }, { rootMargin: '200px', threshold: 0.25 });
  document.querySelectorAll('.scent-world').forEach((v) => io.observe(v));
  ```
- **`prefers-reduced-motion` and metered connections** get the identical fallback — never attach a `src`, poster stays static:
  ```js
  const skipMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    || navigator.connection?.saveData
    || ['slow-2g', '2g', '3g'].includes(navigator.connection?.effectiveType);
  if (!skipMotion) document.querySelectorAll('.scent-world').forEach((v) => io.observe(v));
  ```
- **Weight budget**: `preload="none"` on every tag means the browser fetches **zero video bytes** until JS attaches `src` on scroll-near. Worst case — a user scrolls past all four in one fast pass — is 703KB total for the whole session, and it happens after first paint, off the LCP/TBT path entirely. Budget: **≤900KB total for the scroll-triggered set, $0 of it on the critical path.** That's the number that keeps the mobile-throttled perf ≥90 gate (currently 92 with a 3.2s LCP and no video at all) intact — the gate is protected by *when* it loads, not by how small the files are, though smaller helps the low end (slow-3G users who don't qualify for the skip).

### 1c. Mobile-portrait variants
**Don't ship a portrait crop — one 960x540 landscape file with `object-fit: cover` inside whatever box Zaha sizes is enough.** The only "portrait" asset we appeared to have (`assets/w-*-m.mp4`) turned out not to be portrait at all (see §0) — there is no real portrait master to crop from without a reshoot, and cropping 1920x1080 flat-lay footage to 9:16 would cut ingredients off the frame on a shot that's centrally symmetric by design. If Zaha's mobile layout genuinely needs taller-than-wide video later, that's a reshoot/regen request, not tonight's fix.

### 1d. Coffee — ruling
**Sits out of tonight's ship.** Tested, not assumed (§0): the coffee master is shot on a dark near-black backdrop, not an underexposed cream one. Two real grades (`eq` lift, three-channel `curves` shadow lift) both left it dark or crushed the beans flat trying to force it light. This is a different lighting setup from the other four, not a color-correction problem. Leave `world-coffee.jpg` (the existing still) as Coffee's tile image, unchanged, and don't add a coffee video tonight. Queue a coffee reshoot-or-regenerate as the first line item in the paid path below — it's the one launch scent without a usable motion asset.

---

## 2. The missing marshmallow — fixed at $0

**The video and the photo are already correct** — both show toasted marshmallow cubes next to the pumpkin wedges (checked by pulling frames and looking, not assumed). **The bug is only in `public/swatches/pumpkin-marshmallow.svg`**: it draws a pumpkin silhouette (three orange ellipses + a stem) and nothing else. Zero marshmallow shape. Checked all 18 swatches against their names for the same failure mode — this is the only one that drops a promised ingredient; every other two-note swatch in the set (marshmallow-vanilla-kisses, honey-vanilla, coconut-lime, raspberry-lemonade...) draws both. Isolated bug, not a pattern.

**Fix the source, not the output file** — `public/swatches/*.svg` is generated by `scripts/make-swatches.mjs`; hand-editing the SVG directly will get silently overwritten the next time someone runs the generator. Replace the `pumpkin-marshmallow` entry in that script:

```js
'pumpkin-marshmallow': `
  <g fill="#EE8A3A"><ellipse cx="20" cy="42" rx="12" ry="9"/><ellipse cx="14" cy="42" rx="5" ry="9" fill="#E07A2C"/><ellipse cx="26" cy="42" rx="5" ry="9" fill="#E07A2C"/><ellipse cx="20" cy="42" rx="4" ry="9"/></g>
  <rect x="18.5" y="30" width="3" height="6" rx="1.5" fill="#6F8A63"/>${leaf(23, 31, -10, 0.4)}
  <g fill="#FFF8EA" stroke="${INK}" stroke-opacity=".2"><rect x="36" y="18" width="13" height="14" rx="4"/><rect x="41" y="32" width="12" height="13" rx="4"/></g>
  <g fill="#8A4B22" opacity=".5"><rect x="38" y="20" width="3" height="2" rx="1"/><rect x="44" y="26" width="3" height="2" rx="1"/><rect x="45" y="35" width="3" height="2" rx="1"/></g>`,
```
Smaller pumpkin (pumpkin still leads, it's first in the name), two marshmallow rounded-rects copied from the exact style already used in `marshmallow-vanilla-kisses` (`rx="4"`, `#FFF8EA`, faint ink stroke), plus a few dark fleck rectangles for the toasted char the real photo shows. Then:
```bash
node scripts/make-swatches.mjs
```
regenerates `public/swatches/pumpkin-marshmallow.svg` from that entry. Verify by opening the file and confirming it contains `fill="#FFF8EA"` (the marshmallow color) — it currently doesn't, at all.

---

## 3. The 13 scents with no photography — honest $0 answer

**Recommended: leave them as swatch + name + note, exactly as `catalog.json` and `bar.md` already architect it — this is not a gap, it's the by-design tier below the 5 launch worlds. Spend the $0 hour instead auditing all 18 swatches once for the same "does the art show what the name promises" bug found in pumpkin-marshmallow (found none tonight, but that was a spot-check against 18 names, not a pixel-level design review).**

Ranked options, quality-per-hour:
1. **Swatch + name + note (what's already built) — recommended.** Every one of the 18 fragrances already has a procedurally-generated flat SVG (`make-swatches.mjs`) plus a hand-written 2–4 word note in `catalog.json`. `bar.md` rule 6 already calls for exactly this: "scents shown as named worlds with a three-word note, never a chip wall." The 5-launch-scent photography tier and the 13-scent swatch tier is the existing architecture, not an oversight — `catalog.json`'s `hero` key is only set on 5 entries on purpose. Cost tonight: $0, already shipped, just needs the marshmallow-style audit above.
2. **CSS/SVG craft, made richer** (gradients, more shapes, subtle motion on hover/scroll) — a real upgrade path if Zaha wants the 13 to feel less flat than the 5 photographed ones, still $0, but hours not minutes, and it's a design-system decision (how much visual weight a non-hero scent should carry) that's her call, not mine to build unprompted.
3. **ffmpeg/ImageMagick composition from existing frames — not recommended, disqualified for most of the 13.** You cannot make a truthful Raspberry Lemonade or Watermelon world by recropping pumpkin or coffee frames — the ingredients aren't in the footage. The only place this could arguably work is vanilla-adjacent scents (Vanilla Amber, Vanilla Bean Lavender, Honey Vanilla) reusing the vanilla world's frame — but that's the same credibility problem as the AI jar labels in miniature: it would show ingredients on screen that weren't actually shot for that product. Don't do this with a straight face.
4. **Nothing, design carries it** — this is functionally option 1 with different framing. It's the right answer, not a cop-out: the swatch tier already exists, is already wired into the picker, and matches the bar's own rule against a chip wall.

---

## 4. The paid path — queued, not run

**Tool: fal, image gen (Nano Banana Pro or Nano Banana 2) for stills, Kling 2.5 Turbo Pro image-to-video for the 5s loops. Nothing else survives elimination for this job:**
- **Kie.ai** — disqualified tonight on a hard fact, not preference: returning 402 (account/billing issue), not a live option regardless of budget approved.
- **Higgsfield** — not a candidate at all; retired 2026-08-24, correcting it here since it's the kind of name that persists in memory after the account doesn't exist anymore.
- **Gemini `gemini-omni-1.1-flash`** — technically capable (text→video, image→video) but its edit/extend contract is built around modifying an *existing* upload; these are fresh generations with no input video to extend, and fal's video models (Kling, Luma Ray, Veo, Wan, all hosted in one place) are the ones already proven to match this exact flat-lay/macro/ingredients-on-seamless look — style continuity with the 5 real assets is a real argument for staying in one house.
- **Luma** — not a separate account, reached through fal; if a Luma Ray render is the best style match for a given scent, it's still a fal call, not a second tool.

**Prompt shape (Pumpkin Marshmallow, one worked example):**
1. Still (Nano Banana Pro, image gen): *"Overhead flat-lay food photography, toasted marshmallow cubes with dark char marks alternating with fresh pumpkin wedges, scattered cinnamon dust, arranged in a loose circular frame around empty negative space, on a warm matte cream-tan seamless background, soft diffused studio light, no shadows harsh, no text, no logo, no jar, 16:9."* — matched to the real master's actual composition (frames pulled in §0), not invented from scratch.
2. Loop (Kling 2.5 Turbo Pro, image-to-video, seeded from the still above as first frame): *"Static camera, marshmallow cubes and pumpkin wedges settle gently into frame with a soft bounce, cinnamon dust drifts down, 5 seconds, no camera movement, no people, no text."*

**Pricing, verified today (not from memory):**
- Nano Banana Pro (fal): **$0.15/image**, commercial rights included.
- Nano Banana 2 (fal): **$0.06/image** — cheaper alternate if Pro's headroom isn't needed.
- Kling 2.5 Turbo Pro image-to-video (fal): **$0.35 for 5 seconds** (no audio needed here — silent ambient loops, same as the masters), $0.07/additional second.
- [Kling v2.5 Turbo Pro on fal](https://fal.ai/models/fal-ai/kling-video/v2.5-turbo/pro/image-to-video) · [fal Nano Banana Pro](https://fal.ai/models/fal-ai/nano-banana-pro) · [AI Image Model Pricing comparison](https://pricepertoken.com/image)

**Cost at face value** (no retries): still+loop pair = $0.50/scent (Pro) or $0.41/scent (Banana 2). Real-world generations rarely land in one pass for brand-matched framing/props/color — budget 2–4x for iteration, which is where the tiers below come from.

| Tier | What it covers |
|---|---|
| **$20** | Stills only, all 18 scents, generous iteration room (~$1/scent landed after retries) — closes the swatch-vs-photo gap for the whole catalog at picker-tile scale, no motion. |
| **$50** | Stills for all 18 (~$20) **+** 5s loops for the 13 missing scents with iteration (~$14) **+** the coffee reshoot-or-regen with its own iteration budget (~$3) — this is the tier that actually finishes the full-18 "world" experience end to end and fixes coffee. |
| **$100** | Everything in $50, **plus** redoing all 5 existing launch videos through the same pipeline for one consistent look across all 18 (right now the 5 real masters and any generated 13 would be two different visual sources), plus a real buffer for a second art-direction pass if Zaha's system calls for a style change once she sees the first batch. |

**One blocker independent of Brenda's yes:** fal's `TOP_UP` is locked per your note — even an approved spend needs that unlocked before any of these calls will actually succeed. Flagging so whoever executes this doesn't discover it mid-job.

**The exact call I would make, once approved** (not run):
```
fal.subscribe("fal-ai/kling-video/v2.5-turbo/pro/image-to-video", {
  input: {
    image_url: "<nano-banana-pro output for pumpkin-marshmallow still>",
    prompt: "Static camera, marshmallow cubes and pumpkin wedges settle gently into frame with a soft bounce, cinnamon dust drifts down, 5 seconds, no camera movement, no people, no text.",
    duration: "5"
  }
})
```

---

## 5. Ordered build steps (media only)

1. **Fix the swatch source.** Edit `scripts/make-swatches.mjs`'s `pumpkin-marshmallow` entry to the block in §2. Run `node scripts/make-swatches.mjs`. Verify: `grep 'FFF8EA' public/swatches/pumpkin-marshmallow.svg` returns a match (it doesn't today).
2. **Re-encode the four shipping videos.** Run the `ffmpeg` loop in §1a into `site-v1/public/video/`. Verify each: `ffprobe -show_entries stream=width,height` reports 960x540, and `ffprobe` shows no audio stream. Verify total: `du -ch public/video/*.mp4` should land near 700KB, not 2.7MB+.
3. **Leave coffee alone.** Do not create `public/video/w-coffee.mp4` tonight. Confirm `public/products/world-coffee.jpg` is unchanged and still the coffee tile's only asset.
4. **Wire the data.** Add a `heroVideo` field next to the existing `hero` field in `data/catalog.json` for chamomile, pistachio, pumpkin, vanilla only (e.g. `"heroVideo": "video/w-pumpkin.mp4"`). Do not add one for coffee.
5. **Wire the markup and behaviour**, inside whichever container Zaha specifies: the `<video>` tag from §1b, the `IntersectionObserver` block from §1b, the `prefers-reduced-motion`/`saveData` guard from §1b. If the implementation pattern swaps an `<img>` in and out instead of using `<video poster>` directly, give that `<img>` `alt=""`.
6. **Run the gates.** `npm run lighthouse` — confirm home/shop/checkout still ≥90 perf, ≥95 a11y (baseline today: 92/100 home, 99/100 shop, with zero video weight — should hold, since nothing loads until scroll-near). `npm test` — confirm still 21/21, in particular `home.spec.ts`'s `noAlt` check.
7. **Commit** `public/video/*.mp4` (the four), `scripts/make-swatches.mjs` + regenerated `public/swatches/pumpkin-marshmallow.svg`, and the `catalog.json` field additions. Flag the stale `assets/light/*`, `assets/w-*.mp4`, `assets/w-*-m.mp4` blobs already sitting in git (§0) for cleanup in a follow-up commit — they're a different, heavier, mislabeled asset generation and having two video trees in the repo is exactly the kind of rot that routes the next person wrong.

---

## Evidence log entry (for `MEDIA-ENGINE.md`)

`2026-09-11 · Valeo storefront v2 scent-world video restore + swatch fix · ffmpeg re-encode (CRF28, 960x540, no audio) + make-swatches.mjs source fix · $0, local, ~15min compute · pending build/ship · found the git-committed "light" set was bitrate-targeted not quality-targeted (2.7MB for 5 clips vs 792KB re-encoding fresh from source at matched visual quality) — worth checking actual CRF re-encode against any "already optimized" committed asset before trusting its size as a floor. Also found a labeled "mobile-portrait" asset set that was actually landscape and heavier than desktop — never assume a filename suffix describes the actual file, ffprobe it.`
