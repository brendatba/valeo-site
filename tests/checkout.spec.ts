import { test, expect } from '@playwright/test';

test('R6: checkout renders summary, order number, Venmo memo, SMS + mailto paths; cart clears', async ({ page }) => {
  await page.goto('shop/');
  await page.evaluate(() => localStorage.setItem('valeo.cart.v1', JSON.stringify([
    { id: 'a1', kind: 'jar', fragrance: 'coffee', product: 'body-butter', size: '4oz', qty: 2 },
    { id: 'a2', kind: 'flight', option: 'A', jars: [{ fragrance: 'coffee', product: 'body-butter', size: '4oz' }, { fragrance: 'watermelon', product: 'sugar-scrub', size: '4oz' }, { fragrance: 'other', otherText: 'Rose', product: 'body-butter', size: '4oz' }] },
  ])));
  await page.goto('checkout/');
  await expect(page.locator('.summary-card .total .price')).toHaveText('$83.25');
  await page.locator('#place-order').click(); // empty form → validation
  await expect(page.locator('.field[data-invalid="true"]')).toHaveCount(2);
  await page.fill('#f-name', 'Test Customer');
  await page.fill('#f-phone', '253-555-0100');
  await page.locator('input[value="delivery"]').check();
  await expect(page.locator('#f-address-wrap')).toBeVisible();
  await page.fill('#f-address', '123 Main St, Tacoma');
  await page.locator('#place-order').click();
  await expect(page.locator('#order-number')).toHaveText(/^VB-\d{6}-[A-Z0-9]{3}$/);
  const num = await page.locator('#order-number').textContent();
  await expect(page.locator('#venmo-memo')).toHaveText(num!);
  await expect(page.locator('#venmo-amount')).toHaveText('$83.25');
  await expect(page.locator('#sms-link')).toHaveAttribute('href', /^sms:2533594643\?&body=/);
  await expect(page.locator('#mail-link')).toHaveAttribute('href', /^mailto:valeobodycare@gmail\.com\?subject=/);
  const sms = await page.locator('#sms-link').getAttribute('href');
  expect(decodeURIComponent(sms!)).toContain(num!);
  expect(decodeURIComponent(sms!)).toContain('Other: Rose');
  await expect(page.locator('#order-text')).toContainText('Total: $83.25');
  expect(await page.evaluate(() => localStorage.getItem('valeo.cart.v1'))).toBe('[]');
  await expect(page.locator('#cart-count')).toHaveText('0');
  // confirmation survives reload via ?order=
  await page.reload();
  await expect(page.locator('#order-number')).toHaveText(num!);
});
