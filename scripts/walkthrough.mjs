// Reviewer evidence pack: viewport screenshots of a real shopper's path on mobile + desktop, plus scroll captures of the home passage.
// Usage: node scripts/walkthrough.mjs <label>   → screens/<label>/
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const label = process.argv[2] ?? 'walk';
const BASE = process.env.WALK_BASE ?? 'http://localhost:4173/valeo-site/';
const dir = `screens/${label}`; mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const log = [];
for (const [w, h, tag] of [[390, 844, 'mobile'], [1280, 800, 'desktop']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const shot = async (name) => { await page.waitForTimeout(500); await page.screenshot({ path: `${dir}/${tag}-${name}.png` }); };
  // HOME: hero, then the passage at 5 scroll depths, then after the passage
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await shot('01-home-hero');
  const pass = await page.$('.passage');
  if (pass) {
    const top = await pass.evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
    const hgt = await pass.evaluate((e) => e.offsetHeight);
    for (const [k, f] of [[2, 0.05], [3, 0.3], [4, 0.55], [5, 0.8], [6, 1.02]]) { await page.evaluate((y) => window.scrollTo(0, y), top + (hgt - h) * f); await page.waitForTimeout(700); await shot(`0${k}-passage-${Math.round(f * 100)}`); }
    log.push(`${tag} passage videos: ` + JSON.stringify(await page.$$eval('.passage video', (vs) => vs.map((v) => ({ src: !!v.src, t: +v.currentTime.toFixed(2) })))));
  }
  await page.evaluate(() => document.querySelector('#ways')?.scrollIntoView()); await shot('07-home-ways');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await shot('08-home-bottom');
  // SHOP single: land, tap a scent, change product + size, add
  await page.goto(BASE + 'shop/', { waitUntil: 'networkidle' }); await page.evaluate(() => localStorage.clear());
  await shot('10-shop-land');
  await page.locator('.tile[data-id="raspberry-lemonade"]').click(); await shot('11-shop-picked');
  await page.evaluate(() => document.querySelector('#variants')?.scrollIntoView({ block: 'start' })); await shot('12-shop-variants');
  await page.locator('[data-product="sugar-scrub"]').click(); await page.locator('[data-size="8oz"]').click(); await shot('13-shop-scrub-8oz');
  await page.locator('#bar-add').click(); await page.waitForTimeout(500); await shot('14-cart-drawer');
  await page.keyboard.press('Escape');
  // FLIGHT: option A, 3 scents, change jar 2 to coffee scrub
  await page.goto(BASE + 'shop/?mode=flight&option=A', { waitUntil: 'networkidle' }); await shot('20-flight-land');
  for (const id of ['pistachio-salted-caramel', 'coffee']) await page.locator(`.tile[data-id="${id}"]`).click();
  await shot('21-flight-2of3');
  await page.locator('.slot[data-slot="1"]').click(); await page.locator('[data-product="coffee-scrub"]').click(); await shot('22-flight-jar2-coffee-scrub');
  await page.locator('.tile[data-id="cashmere-vanilla"]').click(); await page.evaluate(() => window.scrollTo(0, 0)); await shot('23-flight-complete-top');
  // SAMPLE
  await page.goto(BASE + 'shop/?mode=sample', { waitUntil: 'networkidle' });
  for (const id of ['coffee', 'watermelon', 'honey-vanilla', 'cinnamon-roll', 'coconut-lime']) await page.locator(`.tile[data-id="${id}"]`).click();
  await page.evaluate(() => window.scrollTo(0, 0)); await shot('30-sample-5of5');
  // CHECKOUT
  await page.locator('#bar-add').click(); await page.waitForTimeout(400); await page.locator('#cart-drawer a[href*="checkout"]').click(); await page.waitForLoadState('networkidle'); await shot('40-checkout');
  await page.fill('#f-name', 'Sample Customer'); await page.fill('#f-phone', '253-555-0100'); await page.locator('#place-order').click(); await page.locator('#order-number').waitFor(); await shot('41-confirmation');
  const m = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: innerWidth }));
  log.push(`${tag} horizontal overflow: ${m.scrollW > m.innerW ? 'YES (' + m.scrollW + ')' : 'none'}`);
  await page.close();
}
await browser.close();
console.log(log.join('\n'));
console.log(`evidence → ${dir}/`);
