import { catalog, mood } from '../lib/catalog.ts';
import { money, flightTotal } from '../lib/pricing.ts';
import { asset, escapeHtml, page } from '../lib/util.ts';
import photos from '../../public/photos.json' with { type: 'json' };

export function renderHome(root: HTMLElement): void {
  const b = catalog.business;
  const butter = catalog.products.find((p) => p.kind === 'butter')!;
  const scrubs = catalog.products.filter((p) => p.kind === 'scrub');
  const minJar = Math.min(...catalog.sizes.map((s) => Math.min(s.prices.butter, s.prices.scrub)));
  const flightA = catalog.bundles.flights[0];
  const flightPrice = flightTotal(flightA.id, flightA.slots.map((s) => ({ product: s.kind === 'scrub' ? scrubs[0].id : butter.id, size: s.size }))).total;
  const worlds = catalog.fragrances.filter((f) => f.hero);

  root.innerHTML = `
    <section class="hero" aria-labelledby="hero-title">
      <div class="wrap">
        <div class="hero-copy">
          <span class="eyebrow">Handmade body butter &amp; scrubs · est. ${b.est}</span>
          <h1 id="hero-title">${escapeHtml(b.wordmark)}</h1>
          <p class="tagline">${escapeHtml(b.tagline)} <span class="small muted" style="font-style:normal;font-family:var(--font-text)">(${escapeHtml(b.taglineNote)})</span></p>
          <div class="pillars" aria-label="What we stand for">${b.pillars.map((p) => `<span class="pillar">${escapeHtml(p)}</span>`).join('')}</div>
          <p class="lead">${catalog.fragrances.length} fragrances. Whipped ${butter.name.toLowerCase()} and ${scrubs.map((s) => s.name.toLowerCase().replace(' scrub', '')).join(', ')} scrubs. Pick any scent in any jar, all on one screen.</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="${page('shop/')}" id="cta-shop">Shop scents</a>
            <a class="btn btn-ghost" href="${page('shop/?mode=flight&option=A')}">Build a flight</a>
          </div>
        </div>
        <div class="hero-img"><img src="${asset(photos.hero)}" alt="An open jar of Valeo whipped body butter with its wooden lid resting beside it" width="1000" height="667" fetchpriority="high"></div>
      </div>
    </section>

    <section class="section" aria-labelledby="ways-title" id="ways">
      <div class="wrap">
        <div class="section-head"><h2 id="ways-title">Three ways to order</h2><p class="muted">Every option uses the same ${catalog.fragrances.length} scents.</p></div>
        <div class="ways">
          <a class="way" href="${page('shop/')}"><img src="${asset(photos['body-butter'])}" alt="A single jar of Valeo body butter" loading="lazy" width="900" height="856"><div class="way-body"><h3>Single jar</h3><p class="muted small">Any scent, any product, five sizes.</p><span class="from">from ${money(minJar)}</span></div></a>
          <a class="way" href="${page('shop/?mode=flight&option=A')}"><img src="${asset(photos['flight-slab'])}" alt="Three Valeo jars lined up on a live-edge wood slab" loading="lazy" width="1000" height="667"><div class="way-body"><h3>Slab flight</h3><p class="muted small">Three or four jars on a ${catalog.bundles.slab.name.toLowerCase()}, ${Math.round(catalog.bundles.slab.discount * 100)}% off the jars. The gift.</p><span class="from">from ${money(Math.min(flightPrice, flightTotal('B', catalog.bundles.flights[1].slots.map((s) => ({ product: butter.id, size: s.size }))).total))}</span></div></a>
          <a class="way" href="${page('shop/?mode=sample')}"><img src="${asset(photos['sample-minis'])}" alt="A row of small Valeo sample jars" loading="lazy" width="1000" height="667"><div class="way-body"><h3>Sample minis</h3><p class="muted small">Pick any ${catalog.bundles.samples.setSize}. Find your scent before you commit.</p><span class="from">${money(catalog.bundles.samples.each)} each · ${catalog.bundles.samples.setSize} for ${money(catalog.bundles.samples.setPrice)}</span></div></a>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="scents-title" style="background:var(--paper)">
      <div class="wrap">
        <div class="section-head"><h2 id="scents-title">${catalog.fragrances.length} scents, one screen</h2><p class="muted">Tap any of them in the shop. No scrolling through pages to find yours.</p></div>
        <div class="scents-preview" id="scents-preview">${catalog.fragrances.map((f) => `<span style="--tint:${f.tint}"><img src="${asset(f.swatch)}" alt="" width="20" height="20" loading="lazy">${escapeHtml(f.name)}</span>`).join('')}</div>
        ${worlds.length ? `<div class="chips scents-worlds" style="margin-top:18px;gap:12px" aria-label="Scent worlds">${worlds.map((f) => `<figure style="margin:0;flex:0 0 min(78vw,300px);display:grid;gap:6px"><img src="${asset(f.hero!)}" alt="${escapeHtml(f.name)} ingredients: ${escapeHtml(f.note)}" loading="lazy" width="1400" height="933" style="aspect-ratio:3/2;object-fit:cover;height:auto;border-radius:var(--r-lg)"><figcaption class="small" style="color:var(--green-ink);font-weight:700">${escapeHtml(f.name)} <span class="muted" style="font-weight:500">· ${escapeHtml(mood(f.mood)?.label ?? '')}</span></figcaption></figure>`).join('')}</div>` : ''}
        <p style="margin-top:16px"><a class="btn btn-primary" href="${page('shop/')}">Pick your scent</a></p>
      </div>
    </section>

    <section class="section" aria-labelledby="ing-title">
      <div class="wrap">
        <div class="section-head"><h2 id="ing-title">What's in it</h2><p class="muted">Short lists. Plant butters, plant oils, essential oils. That's it.</p></div>
        <div class="ingredients">
          <div class="ing-card"><h3>${escapeHtml(butter.name)}</h3><p class="muted small">${escapeHtml(butter.blurb)}</p><ul class="ing-list">${butter.ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>
          <div class="ing-card"><h3>${scrubs.map((s) => s.name).join(' · ')}</h3><p class="muted small">Sugar for everyday, salt for rough spots, coffee for a wake-up.</p><ul class="ing-list">${[...new Set(scrubs.flatMap((s) => s.ingredients))].map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="how-title" style="background:var(--paper)">
      <div class="wrap">
        <div class="section-head"><h2 id="how-title">How ordering works</h2></div>
        <ol class="steps" style="padding:0;margin:0;list-style:none">
          <li class="step"><h3>Pick and add</h3><p class="muted small">Choose your scents, products, and sizes. Build a flight or a sample set if you like.</p></li>
          <li class="step"><h3>Place the order</h3><p class="muted small">Name, phone, pickup or local delivery. You get an order number on the spot.</p></li>
          <li class="step"><h3>Venmo Shauna</h3><p class="muted small">Send the total with your order number in the memo. Shauna texts you to confirm the handoff.</p></li>
        </ol>
      </div>
    </section>`;
}
