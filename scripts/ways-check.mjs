import { chromium } from '@playwright/test';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto('http://localhost:4173/valeo-site/', { waitUntil: 'networkidle' });
await p.locator('#ways').scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
console.log(await p.$$eval('.way img', (imgs) => imgs.map((i) => ({ src: i.src.split('/').pop(), complete: i.complete, w: i.naturalWidth, h: i.getBoundingClientRect().height | 0 }))));
await p.screenshot({ path: 'screens/v3/ways-desktop.png' });
await b.close();
