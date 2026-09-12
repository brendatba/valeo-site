import { chromium } from '@playwright/test';
const BASE = 'http://localhost:4173/valeo-site/';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(BASE + 'shop/', { waitUntil: 'networkidle' });
await page.locator('.tile[data-id="sandalwood-bergamot"]').click();
await page.waitForTimeout(500);
const info = await page.evaluate(() => {
  const panel = document.querySelector('.picker-side, .scent-head, [class*="world"]');
  return {
    hasVideo: !!panel?.querySelector('video'),
    hasImg: !!panel?.querySelector('img'),
    html: panel ? panel.outerHTML.slice(0, 300) : 'NOT FOUND'
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
