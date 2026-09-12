import { catalog, fragrance, fragranceName, product, size, flight } from '../lib/catalog.ts';
import { cart } from '../lib/cart.ts';
import { flightTotal, jarPrice, lineTotal, money, sampleTotal, type CartLine } from '../lib/pricing.ts';
import { asset, el, escapeHtml, page, toast } from '../lib/util.ts';

let drawer: HTMLElement | null = null;
let lastFocus: HTMLElement | null = null;

export function mountDrawer(): void {
  if (drawer) return;
  const backdrop = el('div', { class: 'drawer-backdrop' });
  backdrop.addEventListener('click', closeDrawer);
  drawer = el('aside', { class: 'drawer', id: 'cart-drawer', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cart-title', hidden: true });
  drawer.innerHTML = `
    <div class="drawer-head"><h2 id="cart-title">Your cart</h2><button class="icon-btn" type="button" id="cart-close" aria-label="Close cart"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg></button></div>
    <div class="drawer-body" id="cart-body"></div>
    <div class="drawer-foot" id="cart-foot"></div>`;
  document.body.append(backdrop, drawer);
  drawer.querySelector('#cart-close')!.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) closeDrawer(); });
  cart.subscribe(render);
}

export function openDrawer(): void {
  mountDrawer();
  lastFocus = document.activeElement as HTMLElement;
  drawer!.hidden = false;
  requestAnimationFrame(() => { document.body.classList.add('drawer-open'); (drawer!.querySelector('#cart-close') as HTMLElement).focus(); });
}
export function closeDrawer(): void {
  document.body.classList.remove('drawer-open');
  setTimeout(() => { if (drawer && !document.body.classList.contains('drawer-open')) drawer.hidden = true; }, 260);
  lastFocus?.focus();
}

function lineView(line: CartLine): HTMLElement {
  const price = money(lineTotal(line));
  if (line.kind === 'jar') {
    const p = product(line.product);
    const node = el('div', { class: 'line' });
    node.innerHTML = `
      <div><div class="l-name">${escapeHtml(fragranceName(line.fragrance, line.otherText))}</div>
        <div class="l-meta">${p.name} · ${size(line.size).label} · ${money(jarPrice(line))} each</div>
        <div class="l-actions">
          <div class="qty" role="group" aria-label="Quantity">
            <button type="button" data-act="dec" aria-label="Decrease quantity">−</button><output aria-live="polite">${line.qty}</output><button type="button" data-act="inc" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="link-btn" data-act="remove">Remove</button>
        </div></div>
      <div class="l-price price">${price}</div>`;
    node.querySelector('[data-act="dec"]')!.addEventListener('click', () => cart.setQty(line.id, line.qty - 1));
    node.querySelector('[data-act="inc"]')!.addEventListener('click', () => cart.setQty(line.id, line.qty + 1));
    node.querySelector('[data-act="remove"]')!.addEventListener('click', () => cart.remove(line.id));
    return node;
  }
  if (line.kind === 'flight') {
    const f = flight(line.option);
    const b = flightTotal(line.option, line.jars);
    const node = el('div', { class: 'line has-img' });
    node.innerHTML = `
      <img src="${asset(catalog.bundles.slab.image)}" alt="" width="56" height="56">
      <div><div class="l-name">Slab Flight · Option ${line.option}</div>
        <div class="l-meta">${f.name} · ${money(b.retail)} retail − ${money(b.discount)} + ${money(b.slab)} slab</div>
        <div class="l-actions"><a class="link-btn" href="${page(`shop/?mode=flight&option=${line.option}&edit=${line.id}`)}">Edit</a><button type="button" class="link-btn" data-act="remove">Remove</button></div></div>
      <div class="l-price price">${price}</div>
      <details><summary>${line.jars.length} jars on the slab</summary><ul>${line.jars.map((j) => `<li>${escapeHtml(fragranceName(j.fragrance, j.otherText))} · ${product(j.product).name} · ${size(j.size).label}</li>`).join('')}</ul></details>`;
    node.querySelector('[data-act="remove"]')!.addEventListener('click', () => cart.remove(line.id));
    return node;
  }
  const s = sampleTotal(line.minis.length);
  const node = el('div', { class: 'line has-img' });
  node.innerHTML = `
    <img src="${asset(catalog.bundles.samples.image)}" alt="" width="56" height="56">
    <div><div class="l-name">Sample Minis · ${s.count} of ${s.setSize}</div>
      <div class="l-meta">${s.isSet ? `Set of ${s.setSize} for ${money(s.setPrice)}` : `${money(s.each)} each`}</div>
      <div class="l-actions"><a class="link-btn" href="${page(`shop/?mode=sample&edit=${line.id}`)}">Edit</a><button type="button" class="link-btn" data-act="remove">Remove</button></div></div>
    <div class="l-price price">${price}</div>
    <details><summary>${line.minis.length} minis</summary><ul>${line.minis.map((m) => `<li>${escapeHtml(fragranceName(m.fragrance, m.otherText))} · ${product(m.product).name}</li>`).join('')}</ul></details>`;
  node.querySelector('[data-act="remove"]')!.addEventListener('click', () => cart.remove(line.id));
  return node;
}

/** "Pairs well with": a body butter in the cart suggests the same-fragrance sugar scrub, and vice versa. */
function pairSuggestions(lines: CartLine[]) {
  const jars = lines.filter((l): l is Extract<CartLine, { kind: 'jar' }> => l.kind === 'jar');
  const out: { fragrance: string; otherText?: string; product: string; size: string; label: string }[] = [];
  const seen = new Set<string>();
  for (const j of jars) {
    const kind = product(j.product).kind;
    const partner = kind === 'butter' ? 'sugar-scrub' : 'body-butter';
    const has = jars.some((o) => o.fragrance === j.fragrance && product(o.product).kind !== kind);
    const key = `${j.fragrance}|${partner}`;
    if (has || seen.has(key)) continue;
    seen.add(key);
    out.push({ fragrance: j.fragrance, otherText: j.otherText, product: partner, size: j.size, label: `${fragranceName(j.fragrance, j.otherText)} ${product(partner).name}` });
  }
  return out.slice(0, 3);
}

function render(lines: CartLine[]): void {
  if (!drawer) return;
  const body = drawer.querySelector<HTMLElement>('#cart-body')!;
  const foot = drawer.querySelector<HTMLElement>('#cart-foot')!;
  body.replaceChildren();
  if (!lines.length) {
    body.innerHTML = `<div class="empty-cart"><p>Your cart is empty.</p><a class="btn btn-primary" href="${page('shop/')}">Shop scents</a></div>`;
    foot.innerHTML = '';
    return;
  }
  lines.forEach((l) => body.append(lineView(l)));
  const pairs = pairSuggestions(lines);
  if (pairs.length) {
    const box = el('div', { class: 'pairs' });
    box.innerHTML = `<h3>Pairs well with</h3>`;
    for (const p of pairs) {
      const row = el('div', { class: 'pair' });
      row.innerHTML = `<span>${escapeHtml(p.label)} · ${size(p.size).label} · <strong>${money(jarPrice(p))}</strong></span>`;
      const btn = el('button', { type: 'button', class: 'text-btn' }, 'Add');
      btn.addEventListener('click', () => { cart.add({ kind: 'jar', fragrance: p.fragrance, otherText: p.otherText, product: p.product, size: p.size, qty: 1 }); toast('Added to cart'); });
      row.append(btn);
      box.append(row);
    }
    body.append(box);
  }
  foot.innerHTML = `
    <div class="subtotal"><span>Subtotal</span><span class="price" id="cart-subtotal">${money(cart.total)}</span></div>
    <a class="btn btn-primary" href="${page('checkout/')}">Checkout</a>
    <p class="small muted">Pickup or local delivery · paid by Venmo</p>`;
}
