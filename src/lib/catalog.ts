import raw from '../../data/catalog.json' with { type: 'json' };

export type ProductKind = 'butter' | 'scrub';
export interface Product { id: string; name: string; short: string; kind: ProductKind; image: string; blurb: string; ingredients: string[] }
export interface Size { id: string; label: string; prices: Record<ProductKind, number> }
export interface Mood { id: string; label: string; color: string }
export interface Fragrance { id: string; name: string; mood: string; tint: string; swatch?: string; note: string; tag?: string; hero?: string; heroVideo?: string; heroM?: string; thumb?: string }
export interface FlightSlot { size: string; kind?: ProductKind }
export interface Flight { id: string; name: string; slots: FlightSlot[] }
export interface Catalog {
  business: {
    name: string; wordmark: string; altName: string; est: string; tagline: string; taglineNote: string;
    pillars: string[]; about: string; phone: string; phoneDigits: string; email: string; instagram: string;
    domain: string; venmo: string; deliveryNote: string;
  };
  products: Product[];
  sizes: Size[];
  moods: Mood[];
  fragrances: Fragrance[];
  other: { id: string; name: string; swatch?: string; tint: string; prompt: string };
  bundles: {
    slab: { name: string; price: number; discount: number; image: string };
    flights: Flight[];
    samples: { name: string; each: number; setSize: number; setPrice: number; defaultProduct: string; image: string };
  };
}

export const catalog = raw as Catalog;

export const OTHER_ID = catalog.other.id;

export function product(id: string): Product {
  const p = catalog.products.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown product: ${id}`);
  return p;
}
export function size(id: string): Size {
  const s = catalog.sizes.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown size: ${id}`);
  return s;
}
export function fragrance(id: string): Fragrance | undefined {
  return catalog.fragrances.find((x) => x.id === id);
}
export function mood(id: string): Mood | undefined {
  return catalog.moods.find((x) => x.id === id);
}
export function flight(option: string): Flight {
  const f = catalog.bundles.flights.find((x) => x.id === option);
  if (!f) throw new Error(`Unknown flight option: ${option}`);
  return f;
}
/** Display name for a fragrance id, handling "Other (free text)". */
export function fragranceName(id: string, otherText?: string): string {
  if (id === OTHER_ID) return otherText?.trim() ? `Other: ${otherText.trim()}` : 'Other';
  return fragrance(id)?.name ?? id;
}
/** Fragrances that may fill a given product. Every fragrance is available for every product today;
 *  an optional `only` list on a fragrance would restrict it without touching code. */
export function fragrancesFor(productId: string): Fragrance[] {
  return catalog.fragrances.filter((f) => {
    const only = (f as Fragrance & { only?: string[] }).only;
    return !only || only.includes(productId);
  });
}
