import { catalog, mood } from '../lib/catalog.ts';
import { money, flightTotal } from '../lib/pricing.ts';
import { asset, escapeHtml, page } from '../lib/util.ts';
import { watchWorldVideos, worldMedia } from '../lib/video.ts';
import photos from '../../public/photos.json' with { type: 'json' };

export function renderHome(root: HTMLElement): void {
  const b = catalog.business;
  const butter = catalog.products.find((p) => p.kind === 'butter')!;
  const scrubs = catalog.products.filter((p) => p.kind === 'scrub');
  const minJar = Math.min(...catalog.sizes.map((s) => Math.min(s.prices.butter, s.prices.scrub)));
  const flightMin = Math.min(...catalog.bundles.flights.map((f) => flightTotal(f.id, f.slots.map((s) => ({ product: s.kind === 'scrub' ? scrubs[0].id : butter.id, size: s.size }))).total));
  // The passage: only scents with a still (video optional). Order = catalog order; the last one is the peak.
  const worlds = catalog.fragrances.filter((f) => f.hero && f.heroVideo);
  const peak = worlds[worlds.length - 1];
  const jar = asset(photos['body-butter']);

  root.innerHTML = `
    <section class="hero" aria-labelledby="hero-title">
      <div class="wrap">
        <div class="hero-copy">
          <h1 id="hero-title">${escapeHtml(b.wordmark)}</h1>
          <p class="tagline">${escapeHtml(b.tagline)}<span class="from">${escapeHtml(b.taglineNote)}</span></p>
          <p class="pillars" aria-label="What we stand for">${b.pillars.map((p) => `<span class="pillar">${escapeHtml(p)}</span>`).join('')}</p>
          <p class="lede">Whipped ${butter.name.toLowerCase()} and ${scrubs.map((s) => s.name.toLowerCase().replace(' scrub', '')).join(', ')} scrubs, made in small batches in Washington. ${catalog.fragrances.length} scents, and every one of them in every jar.</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="${page('shop/')}" id="cta-shop">Shop scents</a>
            <a class="text-btn" href="${page('shop/?mode=flight&option=A')}">Build a flight</a>
          </div>
        </div>
        <div class="hero-jar"><img src="${jar}" alt="An open jar of Valeo whipped body butter, wooden lid resting against it" width="900" height="856" fetchpriority="high"></div>
      </div>
    </section>

    <section class="worlds wrap" aria-label="Scent worlds">
      <div class="worlds-jar" aria-hidden="true"><img src="${jar}" alt="" width="900" height="856" loading="lazy"></div>
      ${worlds.map((f) => `
      <div class="world-stop${f.id === peak?.id ? ' peak' : ''}">
        <div class="stop-media">${worldMedia({ still: asset(f.hero!), video: asset(f.heroVideo!), alt: `${f.name}: ${f.note}` })}</div>
        <div class="stop-text"><div class="stop-name">${escapeHtml(f.name)}</div><p class="stop-note">${escapeHtml(f.note)} <span class="mood">· ${escapeHtml(mood(f.mood)?.label ?? '')}</span></p></div>
      </div>`).join('')}
      <div class="worlds-close">
        <h2>The jar stays the same. The world around it is yours to pick.</h2>
        <a class="text-btn" href="${page('shop/')}">See all ${catalog.fragrances.length} scents</a>
      </div>
    </section>

    <section class="section" aria-labelledby="ways-title" id="ways">
      <div class="wrap">
        <div class="section-head"><h2 id="ways-title">Three ways to order</h2><p class="lede">Same scents, same jars. Pick the shape that fits the moment.</p></div>
        <div class="ways">
          <a class="way" href="${page('shop/')}"><div class="way-img"><img class="cutout" src="${jar}" alt="A single jar of Valeo body butter" loading="lazy" width="900" height="856"></div><h3>Single jar</h3><p class="muted">Any scent, any product, five sizes. The one you come back for.</p><span class="from">from ${money(minJar)}</span></a>
          <a class="way" href="${page('shop/?mode=flight&option=A')}"><div class="way-img"><img src="${asset(photos['flight-slab'])}" alt="Three Valeo jars on a live-edge wood slab" loading="lazy" width="1000" height="667"></div><h3>Slab flight</h3><p class="muted">Three or four jars on a ${catalog.bundles.slab.name.toLowerCase()}, ${Math.round(catalog.bundles.slab.discount * 100)}% off the jars. The gift.</p><span class="from">from ${money(flightMin)}</span></a>
          <a class="way" href="${page('shop/?mode=sample')}"><div class="way-img"><img src="${asset(photos['sample-minis'])}" alt="A row of small Valeo sample jars" loading="lazy" width="1000" height="667"></div><h3>Sample minis</h3><p class="muted">Pick any ${catalog.bundles.samples.setSize}. Find your scent before you commit to a jar.</p><span class="from">${money(catalog.bundles.samples.each)} each · ${catalog.bundles.samples.setSize} for ${money(catalog.bundles.samples.setPrice)}</span></a>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="scents-title">
      <div class="wrap">
        <div class="section-head"><h2 id="scents-title">${catalog.fragrances.length} scents, one screen</h2><p class="lede">No pages to click through. Every scent is on the shop screen at once. Tap one.</p></div>
        <p class="scent-line" id="scents-preview">${catalog.fragrances.map((f) => `<span>${escapeHtml(f.name)}</span>`).join('')}</p>
        <p style="margin-top:22px"><a class="text-btn" href="${page('shop/')}">Pick your scent</a></p>
      </div>
    </section>

    <section class="section" aria-labelledby="ing-title">
      <div class="wrap">
        <div class="section-head"><h2 id="ing-title">What's in it</h2><p class="lede">Short lists. Plant butters, plant oils, essential oils. That's the whole jar.</p></div>
        <div class="ingredients">
          <div class="ing"><h3>${escapeHtml(butter.name)}</h3><p class="muted">${escapeHtml(butter.blurb)}</p><p class="list">${butter.ingredients.map(escapeHtml).join(', ')}.</p></div>
          <div class="ing"><h3>${scrubs.map((s) => s.name).join(', ')}</h3><p class="muted">Sugar for everyday, salt for rough spots, coffee for a wake-up.</p><p class="list">${[...new Set(scrubs.flatMap((s) => s.ingredients))].map(escapeHtml).join(', ')}.</p></div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="how-title">
      <div class="wrap">
        <div class="section-head"><h2 id="how-title">How ordering works</h2></div>
        <ol class="steps">
          <li><b>Pick and add.</b> Choose your scents, products, and sizes. Build a flight or a sample set if you like.</li>
          <li><b>Place the order.</b> Name, phone, pickup or local delivery. You get an order number on the spot.</li>
          <li><b>Venmo Shauna.</b> Send the total with your order number in the memo. She texts you to confirm the handoff.</li>
        </ol>
      </div>
    </section>`;
  watchWorldVideos(root);
}
