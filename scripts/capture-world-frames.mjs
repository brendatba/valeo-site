import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const BASE = 'http://localhost:4173/valeo-site/';
const dir = 'screens/world-check'; mkdirSync(dir, {recursive:true});
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
await page.goto(BASE + 'shop/', { waitUntil: 'networkidle' });
for (const id of ['bubble-gum-cotton-candy','ocean-mist-sea-salt','coffee','marshmallow-vanilla-kisses']) {
  await page.locator(`.tile[data-id="${id}"]`).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${dir}/${id}.png`, clip: { x: 650, y: 60, width: 600, height: 400 } });
}
await browser.close();
