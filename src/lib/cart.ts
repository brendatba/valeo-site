import type { CartLine, NewCartLine } from './pricing.ts';
import { cartTotal } from './pricing.ts';
import { uid } from './util.ts';

const KEY = 'valeo.cart.v1';
type Listener = (lines: CartLine[]) => void;
const listeners = new Set<Listener>();
let lines: CartLine[] = load();

function load(): CartLine[] {
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as CartLine[]) : []; } catch { return []; }
}
function save(): void {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* private mode: cart lives in memory */ }
  listeners.forEach((fn) => fn(lines));
}

export const cart = {
  get lines(): CartLine[] { return lines; },
  get count(): number { return lines.reduce((n, l) => n + (l.kind === 'jar' ? l.qty : 1), 0); },
  get total(): number { return cartTotal(lines); },
  subscribe(fn: Listener): () => void { listeners.add(fn); fn(lines); return () => listeners.delete(fn); },
  add(line: NewCartLine): CartLine {
    // Merge identical single jars.
    if (line.kind === 'jar') {
      const same = lines.find((l): l is Extract<CartLine, { kind: 'jar' }> =>
        l.kind === 'jar' && l.fragrance === line.fragrance && (l.otherText ?? '') === (line.otherText ?? '') && l.product === line.product && l.size === line.size);
      if (same) { same.qty += line.qty; save(); return same; }
    }
    const full = { ...line, id: uid() } as CartLine;
    lines = [...lines, full];
    save();
    return full;
  },
  setQty(id: string, qty: number): void {
    lines = lines.flatMap((l) => (l.id === id && l.kind === 'jar' ? (qty <= 0 ? [] : [{ ...l, qty }]) : [l]));
    save();
  },
  remove(id: string): void { lines = lines.filter((l) => l.id !== id); save(); },
  clear(): void { lines = []; save(); },
};

// Cross-tab sync.
window.addEventListener('storage', (e) => { if (e.key === KEY) { lines = load(); listeners.forEach((fn) => fn(lines)); } });
