// Lighthouse (mobile) on / and /shop/. Thresholds: perf ≥ 90, a11y ≥ 95. Reports → screens/lighthouse/.
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const PORT = 4191; const BASE = `http://localhost:${PORT}/valeo-site/`;
mkdirSync('screens/lighthouse', { recursive: true });
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
let fail = false;
try {
  for (const [name, path] of [['home', ''], ['shop', 'shop/'], ['checkout', 'checkout/']]) {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const r = await lighthouse(BASE + path, { port: chrome.port, output: 'html', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], formFactor: 'mobile', screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false } });
      runs.push(r);
    }
    // median by performance
    runs.sort((a, b) => a.lhr.categories.performance.score - b.lhr.categories.performance.score);
    const r = runs[1];
    const c = r.lhr.categories;
    const s = { perf: Math.round(c.performance.score * 100), a11y: Math.round(c.accessibility.score * 100), bp: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100) };
    writeFileSync(`screens/lighthouse/${name}.html`, r.report);
    writeFileSync(`screens/lighthouse/${name}.json`, JSON.stringify({ ...s, lcp: r.lhr.audits['largest-contentful-paint'].displayValue, cls: r.lhr.audits['cumulative-layout-shift'].displayValue, tbt: r.lhr.audits['total-blocking-time'].displayValue }, null, 2));
    const ok = s.perf >= 90 && s.a11y >= 95;
    if (!ok) fail = true;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(9)} perf ${s.perf}  a11y ${s.a11y}  best-practices ${s.bp}  seo ${s.seo}  (LCP ${r.lhr.audits['largest-contentful-paint'].displayValue}, CLS ${r.lhr.audits['cumulative-layout-shift'].displayValue})`);
  }
} finally { await chrome.kill(); server.kill(); }
process.exit(fail ? 1 : 0);
