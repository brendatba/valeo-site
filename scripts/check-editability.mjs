// R7 proof: append a 19th fragrance to data/catalog.json, build to dist-r7, run tests/r7.spec.ts, restore.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';

const path = 'data/catalog.json';
const original = readFileSync(path, 'utf8');
const NAME = 'Test Nineteenth Scent';
try {
  const c = JSON.parse(original);
  c.fragrances.push({ id: 'test-nineteenth', name: NAME, mood: 'fruity', tint: '#E0F0FF', note: 'a test scent' });
  writeFileSync(path, JSON.stringify(c, null, 2));
  execSync('node scripts/check-prices.mjs', { stdio: 'inherit' });
  execSync('npx vite build --outDir dist-r7', { stdio: 'inherit' });
  execSync(`npx playwright test tests/r7.spec.ts --project=mobile`, { stdio: 'inherit', env: { ...process.env, PW_PORT: '4181', PW_DIST: 'dist-r7', R7_NAME: NAME, PW_R7: '1' } });
  console.log('\nR7 PASS — 19th fragrance rendered in shop, home, cart, and checkout with zero code changes.');
} finally {
  writeFileSync(path, original);
  rmSync('dist-r7', { recursive: true, force: true });
}
