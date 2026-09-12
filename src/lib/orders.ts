import { catalog, fragranceName, product, size, flight } from './catalog.ts';
import { flightTotal, jarPrice, lineTotal, money, sampleTotal, cartTotal, type CartLine } from './pricing.ts';

export interface Customer { name: string; phone: string; email?: string; fulfillment: 'pickup' | 'delivery'; address?: string; notes?: string }
export interface Order { number: string; createdAt: string; customer: Customer; lines: CartLine[]; lineText: string[]; total: number }

const ALPHANUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function orderNumber(d = new Date()): string {
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  let x = '';
  const rnd = new Uint8Array(3);
  (crypto.getRandomValues ? crypto.getRandomValues(rnd) : rnd.map(() => Math.floor(Math.random() * 256)));
  for (const b of rnd) x += ALPHANUM[b % ALPHANUM.length];
  return `VB-${yy}${mm}${dd}-${x}`;
}

export function describeLine(line: CartLine): string {
  if (line.kind === 'jar') return `${line.qty} × ${fragranceName(line.fragrance, line.otherText)} ${product(line.product).name}, ${size(line.size).label} — ${money(jarPrice(line))} each = ${money(lineTotal(line))}`;
  if (line.kind === 'flight') {
    const b = flightTotal(line.option, line.jars);
    const jars = line.jars.map((j, i) => `    ${i + 1}. ${fragranceName(j.fragrance, j.otherText)} ${product(j.product).name} ${size(j.size).label}`).join('\n');
    return `Slab Flight Option ${line.option} (${flight(line.option).name}) — ${money(b.retail)} retail − ${money(b.discount)} + ${money(b.slab)} slab = ${money(b.total)}\n${jars}`;
  }
  const s = sampleTotal(line.minis.length);
  const minis = line.minis.map((m, i) => `    ${i + 1}. ${fragranceName(m.fragrance, m.otherText)} ${product(m.product).name} mini`).join('\n');
  return `Sample Minis × ${s.count} — ${s.isSet ? `set price ${money(s.setPrice)}` : `${money(s.each)} each = ${money(s.total)}`}\n${minis}`;
}

export function buildOrder(customer: Customer, lines: CartLine[]): Order {
  return { number: orderNumber(), createdAt: new Date().toISOString(), customer, lines, lineText: lines.map(describeLine), total: cartTotal(lines) };
}

export function orderText(o: Order): string {
  const c = o.customer;
  return [
    `Valeo Body order ${o.number}`,
    `Total: ${money(o.total)} (Venmo, memo "${o.number}")`,
    '',
    `Name: ${c.name}`,
    `Phone: ${c.phone}`,
    c.email ? `Email: ${c.email}` : null,
    `Fulfillment: ${c.fulfillment === 'pickup' ? 'Pickup' : `Local delivery to ${c.address ?? ''}`}`,
    c.notes ? `Notes: ${c.notes}` : null,
    '',
    'Items:',
    ...o.lineText.map((t) => `- ${t}`),
  ].filter((l) => l !== null).join('\n');
}

export function mailtoLink(o: Order): string {
  return `mailto:${catalog.business.email}?subject=${encodeURIComponent(`Valeo Body order ${o.number} — ${o.customer.name}`)}&body=${encodeURIComponent(orderText(o))}`;
}
export function smsLink(o: Order): string {
  // "?&body" is the form both iOS and Android honor.
  return `sms:${catalog.business.phoneDigits}?&body=${encodeURIComponent(orderText(o))}`;
}
export function venmoLink(o: Order): string | null {
  const handle = catalog.business.venmo.replace(/^@/, '');
  if (!handle) return null;
  return `https://venmo.com/${encodeURIComponent(handle)}?txn=pay&amount=${(o.total / 100).toFixed(2)}&note=${encodeURIComponent(o.number)}`;
}

/** POST the order to the serverless form endpoint, if one is configured. Never throws. */
export async function submitOrder(o: Order): Promise<{ ok: boolean; reason?: string }> {
  const endpoint = import.meta.env.VITE_ORDER_ENDPOINT as string | undefined;
  if (!endpoint) return { ok: false, reason: 'no-endpoint' };
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `Valeo Body order ${o.number} — ${o.customer.name}`,
        order: o.number, total: money(o.total), name: o.customer.name, phone: o.customer.phone, email: o.customer.email ?? '',
        fulfillment: o.customer.fulfillment, address: o.customer.address ?? '', notes: o.customer.notes ?? '',
        items: o.lineText.join('\n'), text: orderText(o), createdAt: o.createdAt,
      }),
    });
    return res.ok ? { ok: true } : { ok: false, reason: `http-${res.status}` };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

const LAST = 'valeo.lastOrder.v1';
export function saveLastOrder(o: Order): void { try { localStorage.setItem(LAST, JSON.stringify(o)); } catch { /* ignore */ } }
export function loadLastOrder(): Order | null { try { const r = localStorage.getItem(LAST); return r ? (JSON.parse(r) as Order) : null; } catch { return null; } }
