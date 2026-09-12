import { catalog, fragrance, fragranceName, mood, product, size, flight, OTHER_ID, fragrancesFor, type Fragrance, type ProductKind } from '../lib/catalog.ts';
import { cart } from '../lib/cart.ts';
import { flightTotal, isAvailable, jarPrice, money, sampleTotal, type CartLine, type NewCartLine } from '../lib/pricing.ts';
import { asset, el, escapeHtml, qs, toast } from '../lib/util.ts';
import { watchWorldVideos, worldMedia } from '../lib/video.ts';
import { openDrawer } from './cart-drawer.ts';

export type Mode = 'single' | 'flight' | 'sample';
interface Pick { fragrance: string; otherText: string; product: string }

interface State {
  mode: Mode;
  option: string;
  filter: string;
  single: { fragrance: string | null; otherText: string; product: string; size: string };
  flight: { activeSlot: number; slots: (Pick | null)[] };
  sample: { active: number | null; minis: Pick[]; product: string };
  editId: string | null;
}

const X = `<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>`;

const defaultProduct = catalog.products[0].id;
const defaultSize = catalog.sizes.find((s) => s.id === '4oz')?.id ?? catalog.sizes[0].id;

function numberWord(n: number): string { return ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty'][n] ?? String(n); }

function emptySlots(option: string): (Pick | null)[] { return flight(option).slots.map(() => null); }

export function mountPicker(root: HTMLElement): void {
  const params = qs();
  const modeParam = params.get('mode');
  const state: State = {
    mode: modeParam === 'flight' || modeParam === 'sample' ? modeParam : 'single',
    option: catalog.bundles.flights.some((f) => f.id === params.get('option')) ? params.get('option')! : catalog.bundles.flights[0].id,
    filter: 'all',
    single: { fragrance: null, otherText: '', product: defaultProduct, size: defaultSize },
    flight: { activeSlot: 0, slots: [] },
    sample: { active: null, minis: [], product: catalog.bundles.samples.defaultProduct },
    editId: null,
  };
  state.flight.slots = emptySlots(state.option);

  // Editing an existing cart line?
  const editId = params.get('edit');
  if (editId) {
    const line = cart.lines.find((l) => l.id === editId);
    if (line) loadLine(state, line);
  }

  // ----- DOM -----
  root.innerHTML = `
    <div class="picker-head">
      <h1 id="picker-title">Pick your scent</h1>
      <p class="muted" id="picker-sub"></p>
    </div>
    <div class="picker-modes modes" id="modes" role="tablist" aria-label="What are you building"></div>
    <section class="zone" aria-labelledby="frag-title">
      <div id="builder"></div>
      <div class="zone-title"><h2 id="frag-title">Fragrance</h2><span class="hint" id="frag-hint"></span></div>
      <div class="chips" id="chips" role="group" aria-label="Filter by mood"></div>
      <div class="grid" id="grid" role="group" aria-label="Fragrances"></div>
      <div class="other-field" id="other" hidden>
        <label for="other-text">${escapeHtml(catalog.other.prompt)}</label>
        <input id="other-text" type="text" maxlength="60" placeholder="e.g. Rose, Eucalyptus…" autocomplete="off">
      </div>
    </section>
    <aside class="picker-side" aria-label="Your selection">
      <div class="world" id="world" aria-live="polite"><div class="world-media" id="world-media" hidden></div><div class="world-name" id="world-name"></div><div class="world-note" id="world-note"></div></div>
      <div class="picker-variants" id="variants"></div>
    </aside>`;
  const bar = el('div', { class: 'bar', id: 'bar' });
  bar.innerHTML = `<div class="wrap"><div class="summary" aria-live="polite"><div class="line1" id="bar-l1"></div><div class="line2" id="bar-l2"></div></div><button class="btn btn-primary" type="button" id="bar-add"><span id="bar-label">Add to cart</span><span class="price" id="bar-price"></span></button></div>`;
  document.body.append(bar);
  document.body.classList.add('has-bar');

  const $ = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const modesEl = $('#modes'); const builderEl = $('#builder'); const chipsEl = $('#chips'); const gridEl = $('#grid');
  const otherEl = $('#other'); const otherInput = $<HTMLInputElement>('#other-text'); const worldMediaEl = $('#world-media'); const worldNameEl = $('#world-name'); const worldNoteEl = $('#world-note'); const variantsEl = $('#variants');
  let worldShown: string | null | undefined;
  const barL1 = bar.querySelector<HTMLElement>('#bar-l1')!; const barL2 = bar.querySelector<HTMLElement>('#bar-l2')!;
  const barAdd = bar.querySelector<HTMLButtonElement>('#bar-add')!; const barLabel = bar.querySelector<HTMLElement>('#bar-label')!; const barPrice = bar.querySelector<HTMLElement>('#bar-price')!;

  // ----- Mode tabs -----
  const modes: { id: Mode; label: string }[] = [{ id: 'single', label: 'Single jar' }, { id: 'flight', label: 'Slab flight' }, { id: 'sample', label: 'Sample minis' }];
  for (const m of modes) {
    const b = el('button', { type: 'button', class: 'mode-tab', role: 'tab', id: `tab-${m.id}`, 'data-mode': m.id }, m.label);
    b.addEventListener('click', () => { state.mode = m.id; state.editId = null; syncUrl(); update(); });
    modesEl.append(b);
  }

  // ----- Filter chips -----
  const chipDefs = [{ id: 'all', label: 'All', color: 'var(--sage)' }, ...catalog.moods.map((m) => ({ id: m.id, label: m.label, color: m.color }))];
  for (const c of chipDefs) {
    const b = el('button', { type: 'button', class: 'chip', 'data-filter': c.id, 'aria-pressed': 'false' }, c.label);
    b.addEventListener('click', () => { state.filter = c.id; update(); });
    chipsEl.append(b);
  }

  // ----- Grid (built once; updated in place so focus survives) -----
  const tiles = new Map<string, HTMLButtonElement>();
  const allFragrances: (Fragrance | typeof catalog.other)[] = [...catalog.fragrances, catalog.other];
  for (const f of allFragrances) {
    const isOther = f.id === OTHER_ID;
    const m = isOther ? undefined : mood((f as Fragrance).mood);
    const t = el('button', { type: 'button', class: `tile${isOther ? ' other' : ''}`, 'data-id': f.id, 'aria-pressed': 'false' });
    t.innerHTML = `<span class="slotnum" aria-hidden="true"></span><span class="name">${escapeHtml(isOther ? '+ Other' : f.name)}</span>`;
    t.setAttribute('aria-label', isOther ? 'Other fragrance (type your own)' : `${f.name}${m ? `, ${m.label}` : ''}`);
    t.addEventListener('click', () => pickFragrance(f.id));
    tiles.set(f.id, t);
    gridEl.append(t);
  }
  // Arrow-key roving inside the grid.
  gridEl.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const visible = [...gridEl.querySelectorAll<HTMLButtonElement>('.tile:not([hidden])')];
    const i = visible.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const cols = getComputedStyle(gridEl).gridTemplateColumns.split(' ').length;
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowDown' ? cols : -cols;
    const next = visible[Math.max(0, Math.min(visible.length - 1, i + delta))];
    if (next) { e.preventDefault(); next.focus(); }
  });

  otherInput.addEventListener('input', () => { currentPick()!.otherText = otherInput.value; update(false); });

  barAdd.addEventListener('click', addToCart);

  // ----- Actions -----
  function currentPick(): Pick | { fragrance: string | null; otherText: string; product: string } | null {
    if (state.mode === 'single') return state.single;
    if (state.mode === 'flight') return state.flight.slots[state.flight.activeSlot];
    return state.sample.active !== null ? state.sample.minis[state.sample.active] : null;
  }

  function pickFragrance(id: string): void {
    if (state.mode === 'single') {
      state.single.fragrance = id;
    } else if (state.mode === 'flight') {
      const f = flight(state.option);
      const i = state.flight.activeSlot;
      const slot = f.slots[i];
      const existing = state.flight.slots[i];
      const prod = existing?.product ?? productForSlot(slot.kind, state.single.product);
      state.flight.slots[i] = { fragrance: id, otherText: existing?.otherText ?? '', product: prod };
      // advance to the next empty slot, if any
      const nextEmpty = state.flight.slots.findIndex((s, j) => j > i && s === null);
      const firstEmpty = state.flight.slots.findIndex((s) => s === null);
      if (id !== OTHER_ID) state.flight.activeSlot = nextEmpty >= 0 ? nextEmpty : firstEmpty >= 0 ? firstEmpty : i;
    } else {
      const max = catalog.bundles.samples.setSize;
      const idx = state.sample.minis.findIndex((m) => m.fragrance === id);
      if (state.sample.active !== null && state.sample.minis[state.sample.active]) {
        // editing a specific mini
        state.sample.minis[state.sample.active].fragrance = id;
        if (id !== OTHER_ID) state.sample.active = null;
      } else if (idx >= 0 && id !== OTHER_ID) {
        state.sample.minis.splice(idx, 1);
      } else if (state.sample.minis.length < max) {
        state.sample.minis.push({ fragrance: id, otherText: '', product: state.sample.product });
        if (id === OTHER_ID) state.sample.active = state.sample.minis.length - 1;
      } else {
        toast(`A sample set holds ${max} minis`);
      }
    }
    update();
    if (id === OTHER_ID) otherInput.focus();
  }

  function productForSlot(kind: ProductKind | undefined, preferred: string): string {
    if (!kind) return preferred;
    if (product(preferred).kind === kind) return preferred;
    return catalog.products.find((p) => p.kind === kind)!.id;
  }

  function setProduct(id: string): void {
    if (state.mode === 'single') state.single.product = id;
    else if (state.mode === 'flight') { const s = state.flight.slots[state.flight.activeSlot]; if (s) s.product = id; else state.single.product = id; }
    else { if (state.sample.active !== null && state.sample.minis[state.sample.active]) state.sample.minis[state.sample.active].product = id; else state.sample.product = id; }
    update();
  }

  function addToCart(): void {
    const line = buildLine();
    if (!line) return;
    if (state.editId) cart.remove(state.editId);
    cart.add(line);
    toast(state.editId ? 'Cart updated' : 'Added to cart');
    state.editId = null;
    if (state.mode === 'flight') { state.flight.slots = emptySlots(state.option); state.flight.activeSlot = 0; }
    if (state.mode === 'sample') { state.sample.minis = []; state.sample.active = null; }
    syncUrl();
    update();
    openDrawer();
  }

  function buildLine(): NewCartLine | null {
    if (state.mode === 'single') {
      const s = state.single;
      if (!s.fragrance || !isAvailable(s)) return null;
      return { kind: 'jar', fragrance: s.fragrance, otherText: s.fragrance === OTHER_ID ? s.otherText : undefined, product: s.product, size: s.size, qty: 1 };
    }
    if (state.mode === 'flight') {
      const f = flight(state.option);
      if (state.flight.slots.some((s) => !s)) return null;
      return { kind: 'flight', option: state.option, jars: state.flight.slots.map((s, i) => ({ fragrance: s!.fragrance, otherText: s!.fragrance === OTHER_ID ? s!.otherText : undefined, product: s!.product, size: f.slots[i].size })) };
    }
    if (!state.sample.minis.length) return null;
    return { kind: 'sample', minis: state.sample.minis.map((m) => ({ fragrance: m.fragrance, otherText: m.fragrance === OTHER_ID ? m.otherText : undefined, product: m.product })) };
  }

  function syncUrl(): void {
    const p = new URLSearchParams();
    if (state.mode !== 'single') p.set('mode', state.mode);
    if (state.mode === 'flight') p.set('option', state.option);
    if (state.editId) p.set('edit', state.editId);
    const q = p.toString();
    history.replaceState(null, '', `${location.pathname}${q ? `?${q}` : ''}`);
  }

  // ----- Render -----
  function update(rebuildBuilder = true): void {
    // Tabs
    modesEl.querySelectorAll<HTMLElement>('.mode-tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.mode === state.mode)));
    $('#picker-sub').textContent = state.mode === 'single'
      ? `All ${catalog.fragrances.length} fragrances, any product, any size. Tap a scent, pick a jar.`
      : state.mode === 'flight' ? `${catalog.bundles.slab.name}: ${Math.round(catalog.bundles.slab.discount * 100)}% off the jars, plus the slab. Mix any scents and products.`
      : `${catalog.bundles.samples.name}: ${money(catalog.bundles.samples.each)} each, or ${catalog.bundles.samples.setSize} for ${money(catalog.bundles.samples.setPrice)}. Pick any ${catalog.bundles.samples.setSize}.`;
    document.title = `${state.mode === 'single' ? 'Shop scents' : state.mode === 'flight' ? 'Build a slab flight' : 'Build a sample set'} · ${catalog.business.name}`;

    // Chips
    chipsEl.querySelectorAll<HTMLElement>('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === state.filter)));

    // Grid
    const selected = selectedMap();
    let shown = 0;
    for (const [id, t] of tiles) {
      const f = fragrance(id);
      const visible = state.filter === 'all' || id === OTHER_ID || f?.mood === state.filter;
      t.hidden = !visible;
      if (visible) shown++;
      const sel = selected.get(id);
      t.setAttribute('aria-pressed', String(!!sel));
      t.dataset.slots = sel && sel.length && state.mode === 'flight' ? sel.map((n) => n + 1).join(',') : '';
      t.querySelector('.slotnum')!.textContent = t.dataset.slots ?? '';
    }
    $('#frag-hint').textContent = state.filter === 'all' ? `${catalog.fragrances.length} scents` : `${shown - 1} of ${catalog.fragrances.length}`;

    // Other field
    const pick = currentPick();
    const showOther = pick?.fragrance === OTHER_ID;
    otherEl.hidden = !showOther;
    if (showOther && otherInput.value !== pick!.otherText) otherInput.value = pick!.otherText;

    if (rebuildBuilder) renderBuilder();
    renderWorld(pick);
    renderVariants(pick);
    renderBar();
  }

  function selectedMap(): Map<string, number[]> {
    const m = new Map<string, number[]>();
    if (state.mode === 'single') { if (state.single.fragrance) m.set(state.single.fragrance, [0]); }
    else if (state.mode === 'flight') state.flight.slots.forEach((s, i) => { if (s) m.set(s.fragrance, [...(m.get(s.fragrance) ?? []), i]); });
    else state.sample.minis.forEach((s, i) => m.set(s.fragrance, [...(m.get(s.fragrance) ?? []), i]));
    return m;
  }

  function renderBuilder(): void {
    builderEl.replaceChildren();
    if (state.mode === 'single') return;
    const box = el('div', { class: 'builder' });
    if (state.mode === 'flight') {
      const f = flight(state.option);
      const b = flightTotal(state.option, state.flight.slots.map((s, i) => (s ? { product: s.product, size: f.slots[i].size } : null)));
      const top = el('div', { class: 'builder-top' });
      const opts = el('div', { class: 'seg-options', role: 'group', 'aria-label': 'Flight option' });
      for (const fl of catalog.bundles.flights) {
        const ref = flightTotal(fl.id, fl.slots.map((s) => ({ product: s.kind === 'scrub' ? catalog.products.find((p) => p.kind === 'scrub')!.id : defaultProduct, size: s.size })));
        const o = el('button', { type: 'button', class: 'seg-opt', 'aria-pressed': String(fl.id === state.option), 'data-option': fl.id });
        o.innerHTML = `<span class="lbl">Option ${fl.id}</span><span class="sub">${escapeHtml(fl.name)} · ${money(ref.total)}</span>`;
        o.addEventListener('click', () => { if (fl.id === state.option) return; state.option = fl.id; state.flight.slots = emptySlots(fl.id); state.flight.activeSlot = 0; state.editId = null; syncUrl(); update(); });
        opts.append(o);
      }
      top.append(opts, el('div', { class: 'progress', id: 'flight-progress', 'aria-live': 'polite' }, `${b.filled} of ${b.slots} chosen`));
      box.append(top);
      const slots = el('div', { class: 'slots', role: 'group', 'aria-label': 'Jars on the slab' });
      f.slots.forEach((slotDef, i) => {
        const s = state.flight.slots[i];
        const fr = s ? fragrance(s.fragrance) : undefined;
        const btn = el('button', { type: 'button', class: `slot${s ? '' : ' empty'}`, 'aria-pressed': String(i === state.flight.activeSlot), 'data-slot': String(i) });
        btn.innerHTML = s
          ? `<span class="slot-body"><span class="slot-name">${escapeHtml(fragranceName(s.fragrance, s.otherText))}</span><span class="slot-meta">${product(s.product).name} · ${size(slotDef.size).label}</span></span><span class="slot-num">${i + 1}</span>`
          : `<span class="slot-body"><span class="slot-name">Jar ${i + 1}</span><span class="slot-meta">${slotDef.kind === 'butter' ? 'Body butter' : slotDef.kind === 'scrub' ? 'Any scrub' : 'Any product'} · ${size(slotDef.size).label}${i === state.flight.activeSlot ? ' · tap a scent' : ''}</span></span><span class="slot-num">${i + 1}</span>`;
        btn.setAttribute('aria-label', `Jar ${i + 1}: ${s ? `${fragranceName(s.fragrance, s.otherText)}, ${product(s.product).name}, ${size(slotDef.size).label}` : `empty, ${size(slotDef.size).label}`}${i === state.flight.activeSlot ? ' (choosing now)' : ''}`);
        btn.addEventListener('click', () => { state.flight.activeSlot = i; update(); });
        const wrap = el('div', { style: 'position:relative' }, btn);
        if (s) {
          const x = el('button', { type: 'button', class: 'slot-x', 'aria-label': `Clear jar ${i + 1}` });
          x.innerHTML = X;
          x.addEventListener('click', (e) => { e.stopPropagation(); state.flight.slots[i] = null; state.flight.activeSlot = i; update(); });
          wrap.append(x);
        }
        slots.append(wrap);
      });
      box.append(slots);
      const totals = el('div', { class: 'totals', id: 'flight-totals' });
      totals.innerHTML = `
        <div class="row"><span>Jars at retail</span><span class="price" data-t="retail">${money(b.retail)}</span></div>
        <div class="row saving"><span>Flight savings (${Math.round(catalog.bundles.slab.discount * 100)}% off)</span><span class="price" data-t="discount">−${money(b.discount)}</span></div>
        <div class="row"><span>${escapeHtml(catalog.bundles.slab.name)}</span><span class="price" data-t="slab">${money(b.slab)}</span></div>
        <div class="row total"><span>Flight total</span><span class="price" data-t="total">${money(b.total)}</span></div>`;
      box.append(totals);
    } else {
      const s = sampleTotal(state.sample.minis.length);
      const top = el('div', { class: 'builder-top' });
      top.append(el('div', { class: 'progress', id: 'sample-progress', 'aria-live': 'polite' }, `${s.count} of ${s.setSize} chosen`), el('div', { class: 'small muted' }, s.isSet ? `Set of ${s.setSize} · ${money(s.setPrice)}` : `${money(s.each)} each · ${s.setSize} for ${money(s.setPrice)}`));
      box.append(top);
      const slots = el('div', { class: 'slots', role: 'group', 'aria-label': 'Minis in your set' });
      for (let i = 0; i < s.setSize; i++) {
        const m = state.sample.minis[i];
        const fr = m ? fragrance(m.fragrance) : undefined;
        const btn = el('button', { type: 'button', class: `slot${m ? '' : ' empty'}`, 'aria-pressed': String(m ? i === state.sample.active : false), disabled: !m });
        btn.innerHTML = m
          ? `<span class="slot-body"><span class="slot-name">${escapeHtml(fragranceName(m.fragrance, m.otherText))}</span><span class="slot-meta">${product(m.product).name} mini</span></span><span class="slot-num">${i + 1}</span>`
          : `<span class="slot-body"><span class="slot-name">Mini ${i + 1}</span><span class="slot-meta">tap a scent</span></span><span class="slot-num">${i + 1}</span>`;
        if (m) btn.setAttribute('aria-label', `Mini ${i + 1}: ${fragranceName(m.fragrance, m.otherText)}, ${product(m.product).name}. Select to change its product.`);
        btn.addEventListener('click', () => { state.sample.active = state.sample.active === i ? null : i; update(); });
        const wrap = el('div', { style: 'position:relative' }, btn);
        if (m) {
          const x = el('button', { type: 'button', class: 'slot-x', 'aria-label': `Remove mini ${i + 1}` });
          x.innerHTML = X;
          x.addEventListener('click', (e) => { e.stopPropagation(); state.sample.minis.splice(i, 1); state.sample.active = null; update(); });
          wrap.append(x);
        }
        slots.append(wrap);
      }
      box.append(slots);
      const totals = el('div', { class: 'totals', id: 'sample-totals' });
      totals.innerHTML = `<div class="row total"><span>Sample set total</span><span class="price" data-t="total">${money(s.total)}</span></div>`;
      box.append(totals);
    }
    builderEl.append(box);
  }

  function renderWorld(pick: ReturnType<typeof currentPick>): void {
    const id = pick?.fragrance ?? null;
    const f = id ? fragrance(id) : undefined;
    const m = f ? mood(f.mood) : undefined;
    if (worldShown !== id) {
      worldShown = id;
      const media = f ? worldMedia({ still: f.hero ? asset(f.hero) : undefined, video: f.heroVideo ? asset(f.heroVideo) : undefined, alt: `${f.name}: ${f.note}` }) : '';
      worldMediaEl.hidden = !media;
      worldMediaEl.innerHTML = media;
      if (f) worldMediaEl.style.setProperty('--tint', f.tint); worldMediaEl.dataset.tint = f ? '1' : '';
      watchWorldVideos(worldMediaEl);
    }
    if (!id) {
      const n = catalog.fragrances.length;
      worldNameEl.className = 'world-name big';
      worldNameEl.textContent = state.mode === 'flight' ? `Jar ${state.flight.activeSlot + 1} of ${state.flight.slots.length}.` : state.mode === 'sample' ? 'Five little jars.' : `${numberWord(n)} scents.`;
      worldNoteEl.innerHTML = state.mode === 'flight' ? 'Tap a scent below and it goes on the slab.' : state.mode === 'sample' ? `Tap up to ${catalog.bundles.samples.setSize} scents. The fifth one makes it a set.` : 'Tap one and its world appears here.';
      return;
    }
    worldNameEl.className = `world-name${f?.hero ? '' : ' big'}`;
    worldNameEl.textContent = fragranceName(id, pick!.otherText);
    worldNoteEl.innerHTML = f ? `${escapeHtml(f.note)}${m ? ` <span class="mood">· ${escapeHtml(m.label)}</span>` : ''}` : 'Type the scent you want in the box below the grid.';
  }

  function renderVariants(pick: ReturnType<typeof currentPick>): void {
    variantsEl.replaceChildren();
    // Product
    const prodSeg = el('div', { class: 'seg' });
    const slotDef = state.mode === 'flight' ? flight(state.option).slots[state.flight.activeSlot] : undefined;
    const currentProduct = pick?.product ?? (state.mode === 'sample' ? state.sample.product : state.single.product);
    const prodLabel = el('div', { class: 'seg-label' }, el('span', {}, state.mode === 'sample' ? (state.sample.active !== null ? `Product for mini ${state.sample.active + 1}` : 'Product for the next mini') : state.mode === 'flight' ? `Product for jar ${state.flight.activeSlot + 1}` : 'Product'), el('span', { class: 'picked' }, product(currentProduct).name));
    const prodOpts = el('div', { class: 'seg-options', role: 'group', 'aria-label': 'Product' });
    for (const p of catalog.products) {
      const allowed = !slotDef?.kind || p.kind === slotDef.kind;
      const o = el('button', { type: 'button', class: 'seg-opt', 'aria-pressed': String(p.id === currentProduct), 'data-product': p.id, disabled: !allowed });
      o.innerHTML = `<span class="lbl">${escapeHtml(p.name)}</span>`;
      o.addEventListener('click', () => setProduct(p.id));
      prodOpts.append(o);
    }
    prodSeg.append(prodLabel, prodOpts);
    variantsEl.append(prodSeg);

    // Size
    const sizeSeg = el('div', { class: 'seg' });
    if (state.mode === 'single') {
      const sizeLabel = el('div', { class: 'seg-label' }, el('span', {}, 'Size'), el('span', { class: 'picked' }, size(state.single.size).label));
      const sizeOpts = el('div', { class: 'seg-options', role: 'group', 'aria-label': 'Size' });
      for (const s of catalog.sizes) {
        const spec = { product: state.single.product, size: s.id };
        const ok = isAvailable(spec);
        const o = el('button', { type: 'button', class: 'seg-opt', 'aria-pressed': String(s.id === state.single.size), 'data-size': s.id, disabled: !ok });
        o.innerHTML = `<span class="lbl">${escapeHtml(s.label)}</span><span class="sub">${ok ? money(jarPrice(spec)) : 'n/a'}</span>`;
        o.addEventListener('click', () => { state.single.size = s.id; update(); });
        sizeOpts.append(o);
      }
      sizeSeg.append(sizeLabel, sizeOpts);
    } else if (state.mode === 'flight') {
      sizeSeg.append(el('div', { class: 'seg-label' }, el('span', {}, 'Size'), el('span', { class: 'picked' }, `${size(slotDef!.size).label} · set by Option ${state.option}`)));
    } else {
      sizeSeg.append(el('div', { class: 'seg-label' }, el('span', {}, 'Size'), el('span', { class: 'picked' }, `Mini · ${money(catalog.bundles.samples.each)} each`)));
    }
    variantsEl.append(sizeSeg);
    if (state.mode === 'single') {
      const p = product(state.single.product);
      variantsEl.append(el('p', { class: 'small muted' }, p.blurb));
    }
  }

  function renderBar(): void {
    if (state.mode === 'single') {
      const s = state.single;
      const ready = !!s.fragrance && isAvailable(s);
      barL1.textContent = s.fragrance ? `${fragranceName(s.fragrance, s.otherText)} · ${product(s.product).name} · ${size(s.size).label}` : 'Pick a scent to start';
      barL2.textContent = s.fragrance ? `${money(jarPrice(s))} per jar` : `${product(s.product).name} · ${size(s.size).label}`;
      barLabel.textContent = state.editId ? 'Update cart' : 'Add to cart';
      barPrice.textContent = money(jarPrice(s));
      barAdd.disabled = !ready;
    } else if (state.mode === 'flight') {
      const f = flight(state.option);
      const b = flightTotal(state.option, state.flight.slots.map((s, i) => (s ? { product: s.product, size: f.slots[i].size } : null)));
      barL1.textContent = `Slab flight · Option ${state.option} · ${b.filled} of ${b.slots} jars`;
      barL2.textContent = b.complete ? `${money(b.retail)} retail − ${money(b.discount)} + ${money(b.slab)} slab` : `Choose ${b.slots - b.filled} more jar${b.slots - b.filled === 1 ? '' : 's'}`;
      barLabel.textContent = state.editId ? 'Update flight' : 'Add flight to cart';
      barPrice.textContent = money(flightTotal(state.option, f.slots.map((s) => ({ product: s.kind === 'scrub' ? catalog.products.find((p) => p.kind === 'scrub')!.id : defaultProduct, size: s.size }))).total);
      barAdd.disabled = !b.complete;
    } else {
      const s = sampleTotal(state.sample.minis.length);
      barL1.textContent = `Sample minis · ${s.count} of ${s.setSize}`;
      barL2.textContent = s.isSet ? `Set price ${money(s.setPrice)}` : s.count ? `${money(s.each)} each · add ${s.setSize - s.count} more for the ${money(s.setPrice)} set` : `Pick up to ${s.setSize} scents`;
      barLabel.textContent = state.editId ? 'Update minis' : 'Add minis to cart';
      barPrice.textContent = money(s.count ? s.total : s.setPrice);
      barAdd.disabled = s.count === 0;
    }
  }

  update();
}

function loadLine(state: State, line: CartLine): void {
  state.editId = line.id;
  if (line.kind === 'jar') {
    state.mode = 'single';
    state.single = { fragrance: line.fragrance, otherText: line.otherText ?? '', product: line.product, size: line.size };
  } else if (line.kind === 'flight') {
    state.mode = 'flight'; state.option = line.option;
    state.flight = { activeSlot: 0, slots: line.jars.map((j) => ({ fragrance: j.fragrance, otherText: j.otherText ?? '', product: j.product })) };
  } else {
    state.mode = 'sample';
    state.sample = { active: null, product: catalog.bundles.samples.defaultProduct, minis: line.minis.map((m) => ({ fragrance: m.fragrance, otherText: m.otherText ?? '', product: m.product })) };
  }
}
