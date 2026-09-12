/**
 * Pure price engine. All money is integer CENTS. No DOM, no state — the same
 * functions run in the browser and in scripts/check-prices.mjs.
 */
import { catalog, product, size, flight } from './catalog.ts';

export interface JarSpec { product: string; size: string }

/** Per-jar retail price in cents for a product + size. Throws if the combo is unavailable. */
export function jarPrice(spec: JarSpec): number {
  const p = product(spec.product);
  const s = size(spec.size);
  const cents = s.prices[p.kind];
  if (typeof cents !== 'number') throw new Error(`No price for ${spec.product} at ${spec.size}`);
  return cents;
}

/** True when the product/size combination is sold. */
export function isAvailable(spec: JarSpec): boolean {
  try { jarPrice(spec); return true; } catch { return false; }
}

export interface FlightBreakdown {
  option: string;
  retail: number;     // sum of jar retail
  discount: number;   // 15% of retail, rounded to the cent
  slab: number;       // slab add-on
  total: number;      // retail - discount + slab
  complete: boolean;  // every slot filled
  filled: number;
  slots: number;
}

/** Flight pricing: 15% off the jars' retail, then the slab is added at full price. */
export function flightTotal(option: string, jars: (JarSpec | null)[]): FlightBreakdown {
  const f = flight(option);
  const filled = jars.filter(Boolean) as JarSpec[];
  // Validate each jar against its slot's constraints.
  filled.forEach((jar, i) => {
    const slot = f.slots[i];
    if (!slot) throw new Error(`Flight ${option} has ${f.slots.length} slots, got jar #${i + 1}`);
    if (jar.size !== slot.size) throw new Error(`Flight ${option} slot ${i + 1} must be ${slot.size}`);
    if (slot.kind && product(jar.product).kind !== slot.kind) throw new Error(`Flight ${option} slot ${i + 1} must be a ${slot.kind}`);
  });
  const retail = filled.reduce((sum, jar) => sum + jarPrice(jar), 0);
  const discount = Math.round(retail * catalog.bundles.slab.discount);
  const slab = catalog.bundles.slab.price;
  return {
    option, retail, discount, slab,
    total: retail - discount + slab,
    complete: filled.length === f.slots.length,
    filled: filled.length,
    slots: f.slots.length,
  };
}

/** Full-price retail of a complete flight (what the slot sizes would cost as single jars, butter pricing). */
export function flightRetailReference(option: string): number {
  return flight(option).slots.reduce((sum, slot) => {
    const kind = slot.kind ?? 'butter';
    return sum + size(slot.size).prices[kind];
  }, 0);
}

export interface SampleBreakdown { count: number; total: number; each: number; setSize: number; setPrice: number; isSet: boolean }

/** Sample minis: $5 each for 1–4, the set price at 5. More than the set size is not sold. */
export function sampleTotal(count: number): SampleBreakdown {
  const { each, setSize, setPrice } = catalog.bundles.samples;
  if (count < 0 || count > setSize) throw new Error(`Sample set holds 1–${setSize} minis`);
  const isSet = count === setSize;
  return { count, total: isSet ? setPrice : count * each, each, setSize, setPrice, isSet };
}

export type CartLine =
  | { id: string; kind: 'jar'; fragrance: string; otherText?: string; product: string; size: string; qty: number }
  | { id: string; kind: 'flight'; option: string; jars: { fragrance: string; otherText?: string; product: string; size: string }[] }
  | { id: string; kind: 'sample'; minis: { fragrance: string; otherText?: string; product: string }[] };

type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never;
export type NewCartLine = DistributiveOmit<CartLine, 'id'>;

export function lineTotal(line: CartLine): number {
  switch (line.kind) {
    case 'jar': return jarPrice(line) * line.qty;
    case 'flight': return flightTotal(line.option, line.jars).total;
    case 'sample': return sampleTotal(line.minis.length).total;
  }
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + lineTotal(l), 0);
}

export function money(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rem = cents % 100;
  return rem === 0 ? `$${dollars}` : `$${dollars}.${String(rem).padStart(2, '0')}`;
}
