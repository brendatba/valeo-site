import { catalog } from '../lib/catalog.ts';
import { cart } from '../lib/cart.ts';
import { money, type CartLine } from '../lib/pricing.ts';
import { buildOrder, describeLine, loadLastOrder, mailtoLink, orderText, saveLastOrder, smsLink, submitOrder, venmoLink, type Customer, type Order } from '../lib/orders.ts';
import { el, escapeHtml, page, qs, toast } from '../lib/util.ts';

export function renderCheckout(root: HTMLElement): void {
  const last = loadLastOrder();
  if (qs().get('order') && last && last.number === qs().get('order')) { renderConfirmation(root, last, null); return; }
  if (!cart.lines.length) {
    root.innerHTML = `<div class="section" style="grid-column:1/-1"><h1>Checkout</h1><p class="muted" style="margin:10px 0 18px">Your cart is empty.</p><a class="btn btn-primary" href="${page('shop/')}">Shop scents</a>${last ? `<p class="small muted" style="margin-top:24px">Looking for your last order? <a href="${page(`checkout/?order=${last.number}`)}">${last.number}</a></p>` : ''}</div>`;
    return;
  }
  document.title = `Checkout · ${catalog.business.name}`;
  root.innerHTML = `
    <div>
      <h1>Checkout</h1>
      <p class="muted" style="margin:6px 0 16px">Pickup or local delivery. You'll pay by Venmo after you place the order.</p>
      <form class="form" id="order-form" novalidate>
        <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" type="text" autocomplete="name" required><span class="err">Please add your name.</span></div>
        <div class="field"><label for="f-phone">Phone <span class="opt">(Shauna texts you to confirm)</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required><span class="err">Please add a phone number we can text.</span></div>
        <div class="field"><label for="f-email">Email <span class="opt">(optional)</span></label><input id="f-email" name="email" type="email" autocomplete="email"><span class="err">That email doesn't look right.</span></div>
        <fieldset class="field" style="border:0;padding:0;margin:0"><legend style="font-weight:700;font-size:.9rem;padding:0;margin-bottom:6px">Pickup or delivery</legend>
          <div class="radio-row">
            <label class="radio-opt"><input type="radio" name="fulfillment" value="pickup" checked> Pickup</label>
            <label class="radio-opt"><input type="radio" name="fulfillment" value="delivery"> Local delivery</label>
          </div>
        </fieldset>
        <div class="field" id="f-address-wrap" hidden><label for="f-address">Delivery address</label><input id="f-address" name="address" type="text" autocomplete="street-address"><span class="err">Please add the delivery address.</span><p class="small muted">${escapeHtml(catalog.business.deliveryNote)}</p></div>
        <div class="field"><label for="f-notes">Notes <span class="opt">(optional)</span></label><textarea id="f-notes" name="notes" placeholder="Gift? Allergies? Best time to reach you?"></textarea></div>
        <button class="btn btn-primary" type="submit" id="place-order">Place order · <span class="price">${money(cart.total)}</span></button>
        <p class="small muted">Nothing is charged here. Venmo details come next.</p>
      </form>
    </div>
    <aside class="summary-card" aria-label="Order summary">
      <div style="display:flex;justify-content:space-between;align-items:baseline"><h2 style="font-size:1.4rem">Your order</h2><a class="link-btn" href="${page('shop/')}">Edit</a></div>
      <div id="summary-lines"></div>
      <div class="total"><span>Total</span><span class="price">${money(cart.total)}</span></div>
      <p class="small muted">Paid by Venmo · pickup or local delivery</p>
    </aside>`;
  const lines = root.querySelector('#summary-lines')!;
  cart.lines.forEach((l) => lines.append(summaryRow(l)));

  const form = root.querySelector<HTMLFormElement>('#order-form')!;
  const addrWrap = root.querySelector<HTMLElement>('#f-address-wrap')!;
  form.querySelectorAll<HTMLInputElement>('input[name="fulfillment"]').forEach((r) => r.addEventListener('change', () => { addrWrap.hidden = form.fulfillment.value !== 'delivery'; }));
  // Validation errors clear as soon as the customer types.
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach((f) => f.addEventListener('input', () => { const w = f.closest<HTMLElement>('.field'); if (w) w.dataset.invalid = 'false'; }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const customer: Customer = {
      name: String(fd.get('name') ?? '').trim(), phone: String(fd.get('phone') ?? '').trim(), email: String(fd.get('email') ?? '').trim() || undefined,
      fulfillment: fd.get('fulfillment') === 'delivery' ? 'delivery' : 'pickup', address: String(fd.get('address') ?? '').trim() || undefined, notes: String(fd.get('notes') ?? '').trim() || undefined,
    };
    let valid = true;
    const mark = (id: string, bad: boolean) => { const f = root.querySelector<HTMLElement>(`#${id}`)!.closest<HTMLElement>('.field')!; f.dataset.invalid = String(bad); if (bad) valid = false; };
    mark('f-name', !customer.name);
    mark('f-phone', customer.phone.replace(/\D/g, '').length < 10);
    mark('f-email', !!customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email));
    mark('f-address', customer.fulfillment === 'delivery' && !customer.address);
    if (!valid) { root.querySelector<HTMLElement>('.field[data-invalid="true"] input')?.focus(); return; }

    const btn = root.querySelector<HTMLButtonElement>('#place-order')!;
    btn.disabled = true; btn.textContent = 'Placing order…';
    const order = buildOrder(customer, cart.lines);
    saveLastOrder(order);
    cart.clear();
    history.replaceState(null, '', `${location.pathname}?order=${order.number}`);
    renderConfirmation(root, order, null);
    window.scrollTo({ top: 0 });
    // On a phone, open the text composer straight from the tap so the order is one "Send" away from Shauna.
    const phone = /iPhone|iPad|Android/i.test(navigator.userAgent);
    if (phone) setTimeout(() => { location.href = smsLink(order); }, 350);
    const sent = await submitOrder(order);
    const status = root.querySelector<HTMLElement>('#deliver-status');
    if (status && sent.ok) { status.dataset.ok = 'true'; status.textContent = '✓ Sent to Shauna automatically. Texting it too is fine.'; }
  });
}

function summaryRow(l: CartLine): HTMLElement {
  const text = describeLine(l);
  const [head, ...rest] = text.split('\n');
  const row = el('div', { class: 'row' });
  row.innerHTML = `<div><div class="n">${escapeHtml(head.split(' — ')[0])}</div>${rest.length ? `<div class="m">${rest.map((r) => escapeHtml(r.trim())).join('<br>')}</div>` : ''}</div><div class="price">${escapeHtml(head.split(' = ').pop() ?? '')}</div>`;
  return row;
}

function renderConfirmation(root: HTMLElement, o: Order, sent: { ok: boolean; reason?: string } | null): void {
  document.title = `Order ${o.number} · ${catalog.business.name}`;
  const venmo = venmoLink(o);
  const handle = catalog.business.venmo ? `@${catalog.business.venmo.replace(/^@/, '')}` : '';
  root.innerHTML = `
    <div class="confirm" style="grid-column:1/-1;max-width:720px">
      <div><h1>Thank you, ${escapeHtml(o.customer.name.split(' ')[0])}.</h1>
        <p class="muted" style="margin-top:8px">Two quick steps and it's done. Shauna will text ${escapeHtml(o.customer.phone)} to confirm ${o.customer.fulfillment === 'pickup' ? 'pickup' : 'delivery'}.</p></div>
      <div class="ordno" id="order-number" aria-label="Order number">${o.number}</div>

      <section class="deliver summary-card" aria-labelledby="deliver-title">
        <h2 id="deliver-title" style="font-size:1.5rem">Step 1 · Send it to Shauna</h2>
        <p class="status" id="deliver-status" data-ok="${sent?.ok ? 'true' : 'false'}">${sent?.ok ? '✓ Sent to Shauna automatically. Texting it too is fine.' : 'Your order reaches Shauna when you send this. The message is already written, just tap send.'}</p>
        <div class="paths">
          <a class="btn btn-primary" id="sms-link" href="${smsLink(o)}">Text it to Shauna</a>
          <a class="text-btn" id="mail-link" href="${mailtoLink(o)}">Email it instead</a>
        </div>
      </section>

      <section class="venmo" aria-labelledby="venmo-title">
        <h2 id="venmo-title" style="font-size:1.5rem;color:#1E3A8A">Step 2 · Pay with Venmo</h2>
        <div class="amount" id="venmo-amount">${money(o.total)}</div>
        <p>${handle ? `Send it to <strong>${escapeHtml(handle)}</strong> on Venmo.` : 'Shauna will text you her Venmo handle when she confirms the order.'} Put your order number in the memo so it matches up:</p>
        <div class="memo"><code id="venmo-memo">${o.number}</code><button type="button" class="btn btn-soft btn-sm" id="copy-memo">Copy</button></div>
        ${venmo ? `<a class="btn btn-primary" href="${venmo}" rel="noopener" style="background:#008CFF">Open Venmo · ${money(o.total)}</a>` : ''}
      </section>

      <section class="summary-card" aria-labelledby="sum-title">
        <h2 id="sum-title" style="font-size:1.3rem">Order summary</h2>
        <div id="confirm-lines"></div>
        <div class="total"><span>Total</span><span class="price">${money(o.total)}</span></div>
        <details><summary class="small" style="cursor:pointer;color:var(--green-2);font-weight:700">Plain-text copy</summary><pre class="order-text" id="order-text">${escapeHtml(orderText(o))}</pre></details>
      </section>
      <p><a href="${page('shop/')}">← Back to the shop</a></p>
    </div>`;
  const lines = root.querySelector('#confirm-lines')!;
  o.lines.forEach((l) => lines.append(summaryRow(l)));
  root.querySelector('#copy-memo')!.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(o.number); toast('Order number copied'); } catch { toast(o.number); }
  });
}
