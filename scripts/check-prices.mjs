// Asserts every price in VALEO_BUILD_BRIEF.md §5 against the live price engine.
// Runs the TypeScript engine directly (Node ≥ 22.6 strips types natively).
import { jarPrice, flightTotal, sampleTotal, money, lineTotal } from '../src/lib/pricing.ts';
import { catalog } from '../src/lib/catalog.ts';

let failures = 0;
const ok = (label, got, want) => {
  const pass = got === want;
  if (!pass) failures++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label.padEnd(58)} got ${money(got).padStart(7)}  want ${money(want)}`);
};

console.log('— per-jar prices (§5) —');
const butter = { '2oz': 1000, '4oz': 1500, '6oz': 2000, '8oz': 2500, '16oz': 4500 };
const scrub  = { '2oz': 1000, '4oz': 1500, '6oz': 2000, '8oz': 2500, '16oz': 3500 };
for (const [sz, want] of Object.entries(butter)) ok(`Body Butter ${sz}`, jarPrice({ product: 'body-butter', size: sz }), want);
for (const p of ['sugar-scrub', 'salt-scrub', 'coffee-scrub'])
  for (const [sz, want] of Object.entries(scrub)) ok(`${p} ${sz}`, jarPrice({ product: p, size: sz }), want);

console.log('— flights (§5, 15% off jars + $15 slab) —');
const jar = (product, size, fragrance = 'coffee') => ({ product, size, fragrance });
const A = flightTotal('A', [jar('body-butter', '4oz'), jar('sugar-scrub', '4oz'), jar('coffee-scrub', '4oz')]);
ok('Option A retail', A.retail, 4500); ok('Option A discount', A.discount, 675); ok('Option A slab', A.slab, 1500); ok('Option A TOTAL', A.total, 5325);
const B = flightTotal('B', [jar('body-butter', '2oz'), jar('body-butter', '2oz'), jar('salt-scrub', '2oz'), jar('sugar-scrub', '2oz')]);
ok('Option B retail', B.retail, 4000); ok('Option B discount', B.discount, 600); ok('Option B TOTAL', B.total, 4900);
const C = flightTotal('C', [jar('body-butter', '8oz'), jar('coffee-scrub', '8oz')]);
ok('Option C retail', C.retail, 5000); ok('Option C discount', C.discount, 750); ok('Option C TOTAL', C.total, 5750);

console.log('— flight slot enforcement —');
const throws = (label, fn) => { let threw = false; try { fn(); } catch { threw = true; } if (!threw) failures++; console.log(`${threw ? 'PASS' : 'FAIL'}  ${label}`); };
throws('Option C rejects two butters', () => flightTotal('C', [jar('body-butter', '8oz'), jar('body-butter', '8oz')]));
throws('Option A rejects a 2 oz jar', () => flightTotal('A', [jar('body-butter', '2oz')]));
throws('Option B rejects a 5th jar', () => flightTotal('B', [1, 2, 3, 4, 5].map(() => jar('body-butter', '2oz'))));
const partial = flightTotal('A', [jar('body-butter', '4oz'), null, null]);
if (partial.complete || partial.filled !== 1) failures++;
console.log(`${!partial.complete && partial.filled === 1 ? 'PASS' : 'FAIL'}  Option A partial shows 1 of 3, incomplete`);

console.log('— sample minis (§5) —');
for (let n = 1; n <= 4; n++) ok(`${n} mini${n > 1 ? 's' : ''}`, sampleTotal(n).total, n * 500);
ok('5 minis (set)', sampleTotal(5).total, 2000);
throws('6 minis rejected', () => sampleTotal(6));

console.log('— cart lines —');
ok('jar line qty 2 × 4 oz butter', lineTotal({ id: 'x', kind: 'jar', fragrance: 'coffee', product: 'body-butter', size: '4oz', qty: 2 }), 3000);
ok('"Other" fragrance priced like any other', lineTotal({ id: 'x', kind: 'jar', fragrance: 'other', otherText: 'Rose', product: 'body-butter', size: '6oz', qty: 1 }), 2000);

console.log('— catalog integrity —');
const n = catalog.fragrances.length;
const pass = n >= 18;
if (!pass) failures++;
console.log(`${pass ? 'PASS' : 'FAIL'}  ${n} fragrances in catalog (brief requires 18)`);
const moodIds = new Set(catalog.moods.map((m) => m.id));
for (const f of catalog.fragrances) if (!moodIds.has(f.mood)) { failures++; console.log(`FAIL  ${f.name} has unknown mood ${f.mood}`); }
const ids = catalog.fragrances.map((f) => f.id);
if (new Set(ids).size !== ids.length) { failures++; console.log('FAIL  duplicate fragrance ids'); }

console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL PRICES PASS');
process.exit(failures ? 1 : 0);
