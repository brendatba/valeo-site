// Viewport (not full-page) shots of the home passage at scroll depth + video playback state.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const BASE = 'http://localhost:4173/valeo-site/';
mkdirSync('screens/v3', { recursive: true });
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h, tag] of [[1280, 800, 'desktop'], [390, 844, 'mobile']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const stops = await page.$$eval('.world-stop', (els) => els.map((e) => e.getBoundingClientRect().top + window.scrollY));
  for (const [i, top] of stops.entries()) {
    await page.evaluate((y) => window.scrollTo(0, y), top);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `screens/v3/passage-${i + 1}-${tag}.png` });
  }
  const vid = await page.$$eval('video.scent-world', (vs) => vs.map((v) => ({ src: !!v.src, paused: v.paused, t: +v.currentTime.toFixed(2), ready: v.readyState })));
  console.log(tag, JSON.stringify(vid));
  await page.close();
}
await browser.close();
