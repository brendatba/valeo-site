// Run by scripts/check-editability.mjs against a build whose catalog.json has a 19th fragrance appended.
import { test, expect } from '@playwright/test';
const NAME = process.env.R7_NAME ?? 'Test Nineteenth Scent';

test('R7: a 19th fragrance added to catalog.json appears everywhere', async ({ page }) => {
  await page.goto('shop/');
  await expect(page.locator('.tile:not([hidden])')).toHaveCount(20);
  await expect(page.locator('#frag-hint')).toHaveText('19 scents');
  const tile = page.getByRole('button', { name: new RegExp(`^${NAME}`) });
  await expect(tile).toBeVisible();
  await tile.click();
  await expect(page.locator('#bar-l1')).toContainText(NAME);
  await page.locator('#bar-add').click();
  await expect(page.locator('#cart-body')).toContainText(NAME);
  await page.goto('');
  await expect(page.locator('#scents-preview span')).toHaveCount(19);
  await expect(page.locator('#scents-preview')).toContainText(NAME);
  await page.goto('checkout/');
  await expect(page.locator('#summary-lines')).toContainText(NAME);
});
