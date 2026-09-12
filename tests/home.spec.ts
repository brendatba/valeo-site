import { test, expect } from '@playwright/test';

test('R4: home shows wordmark, tagline once, pillar strip, three tiles, deep links; hero ≤ 70vh on mobile', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('h1')).toHaveText('VALEO BODY');
  await expect(page.locator('.tagline')).toHaveCount(1);
  await expect(page.locator('.tagline')).toContainText('I am able. I am strong.');
  await expect(page.locator('.pillar')).toHaveText(['Unfiltered', 'No Chemicals', 'Organic', 'Pure Essential Oils & Butters']);
  await expect(page.locator('.way')).toHaveCount(3);
  await expect(page.locator('.way').nth(1)).toHaveAttribute('href', /shop\/\?mode=flight&option=A/);
  await expect(page.locator('.way').nth(2)).toHaveAttribute('href', /shop\/\?mode=sample/);
  const m = await page.evaluate(() => ({ heroH: document.querySelector('.hero')!.getBoundingClientRect().height, vh: innerHeight, scrollW: document.documentElement.scrollWidth, innerW: innerWidth, noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length }));
  if (m.innerW < 720) expect(m.heroH).toBeLessThanOrEqual(m.vh * 0.7);
  expect(m.scrollW).toBeLessThanOrEqual(m.innerW);
  expect(m.noAlt).toBe(0);
  await expect(page.locator('#scents-preview span')).toHaveCount(18);
  await expect(page.locator('.site-footer')).toContainText('253-359-4643');
  await page.locator('#cta-shop').click();
  await expect(page).toHaveURL(/shop\//);
});

test('works at 360px wide with no horizontal scroll (mobile-only)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ['', 'shop/', 'shop/?mode=flight&option=A', 'checkout/']) {
    await page.goto(path);
    const m = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: innerWidth }));
    expect(m.scrollW, path).toBeLessThanOrEqual(m.innerW);
  }
});
