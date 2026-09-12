// Screenshots every screen at 390 and 1280 into screens/<milestone>/. Usage: node scripts/screens.mjs <milestone>
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const milestone = process.argv[2] ?? 'latest';
const PORT = 4190; const BASE = `http://localhost:${PORT}/valeo-site/`;
const dir = `screens/${milestone}`; mkdirSync(dir, { recursive: true });
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const cart = [{ id: 'a1', kind: 'jar', fragrance: 'pistachio-salted-caramel', product: 'body-butter', size: '4oz', qty: 1 }, { id: 'a2', kind: 'flight', option: 'A', jars: [{ fragrance: 'coffee', product: 'body-butter', size: '4oz' }, { fragrance: 'watermelon', product: 'sugar-scrub', size: '4oz' }, { fragrance: 'cashmere-vanilla', product: 'body-butter', size: '4oz' }] }];
const browser = await chromium.launch();
try {
  for (const [w, h, tag] of [[390, 844, 'mobile'], [1280, 800, 'desktop']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    const shot = async (name, path, prep) => {
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      if (prep) await prep();
      await page.waitForTimeout(250);
      await page.screenshot({ path: `${dir}/${name}-${tag}.png`, fullPage: true });
      console.log(`${dir}/${name}-${tag}.png`);
    };
    await shot('home', '');
    await shot('shop-single', 'shop/', async () => { await page.locator('.tile[data-id="pistachio-salted-caramel"]').click(); });
    await shot('shop-flight', 'shop/?mode=flight&option=A', async () => { for (const id of ['pistachio-salted-caramel', 'coffee']) await page.locator(`.tile[data-id="${id}"]`).click(); });
    await shot('shop-sample', 'shop/?mode=sample', async () => { for (const id of ['coffee', 'watermelon', 'honey-vanilla']) await page.locator(`.tile[data-id="${id}"]`).click(); });
    await shot('cart-drawer', 'shop/', async () => { await page.evaluate((c) => localStorage.setItem('valeo.cart.v1', JSON.stringify(c)), cart); await page.reload(); await page.locator('#cart-open').click(); await page.waitForTimeout(400); });
    await shot('checkout', 'checkout/');
    await shot('confirmation', 'checkout/', async () => { await page.fill('#f-name', 'Sample Customer'); await page.fill('#f-phone', '253-555-0100'); await page.locator('#place-order').click(); await page.locator('#order-number').waitFor(); });
    await ctx.close();
  }
} finally { await browser.close(); server.kill(); }
