import { test, expect, type Page } from '@playwright/test';

const seedCart = async (page: Page) => page.evaluate(() => localStorage.clear());

test.beforeEach(async ({ page }) => { await page.goto('shop/'); await seedCart(page); await page.reload(); });

test('R1: all 18 fragrance tiles render on one screen; picker reachable in ≤ 1 scroll; no horizontal scroll', async ({ page }, info) => {
  const tiles = page.locator('.tile:not([hidden])');
  await expect(tiles).toHaveCount(19); // 18 fragrances + Other
  const m = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth, innerW: innerWidth, vh: innerHeight,
    variantsBottom: document.querySelector('#variants')!.getBoundingClientRect().bottom + scrollY,
    gridBottom: document.querySelector('#grid')!.getBoundingClientRect().bottom + scrollY,
  }));
  expect(m.scrollW, 'no horizontal scroll').toBeLessThanOrEqual(m.innerW);
  expect(m.gridBottom, 'grid fully visible within 2 viewports').toBeLessThanOrEqual(m.vh * 2);
  expect(m.variantsBottom, 'product + size controls within ≤ 1 scroll').toBeLessThanOrEqual(m.vh * 2);
  await expect(page.locator('#bar-add')).toBeVisible();
  info.annotations.push({ type: 'metrics', description: JSON.stringify(m) });
});

test('R3: swatch selection updates the sticky bar and price-in-button; keyboard works', async ({ page }) => {
  await expect(page.locator('#bar-add')).toBeDisabled();
  await page.getByRole('button', { name: /^Pistachio Salted Caramel/ }).click();
  await expect(page.locator('.tile[aria-pressed="true"]')).toHaveAttribute('data-id', 'pistachio-salted-caramel');
  await expect(page.locator('#bar-l1')).toHaveText('Pistachio Salted Caramel'); await expect(page.locator('#bar-l2')).toHaveText('Body Butter · 4 oz · $15');
  await expect(page.locator('#bar-price')).toHaveText('$15');
  await page.locator('[data-size="8oz"]').click();
  await expect(page.locator('#bar-price')).toHaveText('$25');
  await page.locator('[data-product="coffee-scrub"]').click();
  await expect(page.locator('#bar-l2')).toHaveText('Coffee Scrub · 8 oz · $25');
  await page.locator('[data-size="16oz"]').click();
  await expect(page.locator('#bar-price')).toHaveText('$35');
  // keyboard: focus a tile, arrow right, Enter selects
  await page.locator('.tile[data-id="cashmere-vanilla"]').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.locator('.tile[aria-pressed="true"]')).toHaveAttribute('data-id', 'raspberry-lemonade');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).not.toBe('none');
});

test('mood filter chips filter without reload', async ({ page }) => {
  await page.locator('.chip[data-filter="calm"]').click();
  await expect(page.locator('.tile:not([hidden])')).toHaveCount(3); // 2 calm + Other
  await page.locator('.chip[data-filter="seasonal"]').click();
  await expect(page.locator('.tile:not([hidden])')).toHaveCount(2);
  await page.locator('.chip[data-filter="all"]').click();
  await expect(page.locator('.tile:not([hidden])')).toHaveCount(19);
});

test('"Other" opens a text field and is priced like any fragrance', async ({ page }) => {
  await expect(page.locator('#other')).toBeHidden();
  await page.locator('.tile[data-id="other"]').click();
  await expect(page.locator('#other')).toBeVisible();
  await page.locator('#other-text').fill('Rose');
  await expect(page.locator('#bar-l1')).toHaveText('Other: Rose');
  await expect(page.locator('#bar-price')).toHaveText('$15');
});

test('add to cart updates the count and persists in localStorage', async ({ page }) => {
  await page.locator('.tile[data-id="coffee"]').click();
  await page.locator('#bar-add').click();
  await expect(page.locator('#cart-count')).toHaveText('1');
  await expect(page.locator('#cart-drawer')).toBeVisible();
  await expect(page.locator('#cart-subtotal')).toHaveText('$15');
  await expect(page.locator('.pairs')).toContainText('Coffee Sugar Scrub');
  await page.locator('.pairs button').first().click();
  await expect(page.locator('#cart-count')).toHaveText('2');
  await expect(page.locator('#cart-subtotal')).toHaveText('$30');
  await page.reload();
  await expect(page.locator('#cart-count')).toHaveText('2');
});

test('R5: flight Option A totals $53.25 with retail → discount → slab → total', async ({ page }) => {
  await page.goto('shop/?mode=flight&option=A');
  await expect(page.locator('#flight-progress')).toHaveText('0 of 3 chosen');
  await expect(page.locator('#bar-add')).toBeDisabled();
  await page.locator('.tile[data-id="pistachio-salted-caramel"]').click();
  await page.locator('.tile[data-id="coffee"]').click();
  await page.locator('[data-product="coffee-scrub"]').click();
  await page.locator('.tile[data-id="cashmere-vanilla"]').click();
  await expect(page.locator('#flight-progress')).toHaveText('3 of 3 chosen');
  await expect(page.locator('#flight-totals [data-t="retail"]')).toHaveText('$45');
  await expect(page.locator('#flight-totals [data-t="discount"]')).toHaveText('−$6.75');
  await expect(page.locator('#flight-totals [data-t="slab"]')).toHaveText('$15');
  await expect(page.locator('#flight-totals [data-t="total"]')).toHaveText('$53.25');
  await expect(page.locator('#bar-price')).toHaveText('$53.25');
  await page.locator('#bar-add').click();
  await expect(page.locator('#cart-subtotal')).toHaveText('$53.25');
  await expect(page.locator('#cart-body details')).toContainText('3 jars');
});

test('R5: flight Option B = $49 and Option C = $57.50 with slot rules', async ({ page }) => {
  await page.goto('shop/?mode=flight&option=B');
  for (const id of ['watermelon', 'honey-vanilla', 'coffee', 'birthday-cake']) await page.locator(`.tile[data-id="${id}"]`).click();
  await expect(page.locator('#flight-totals [data-t="total"]')).toHaveText('$49');
  await page.goto('shop/?mode=flight&option=C');
  // slot 1 must be body butter: scrubs disabled
  await expect(page.locator('[data-product="sugar-scrub"]')).toBeDisabled();
  await page.locator('.tile[data-id="vanilla-amber"]').click();
  await expect(page.locator('[data-product="body-butter"]')).toBeDisabled(); // slot 2 = scrub
  await page.locator('.tile[data-id="coffee"]').click();
  await expect(page.locator('#flight-totals [data-t="retail"]')).toHaveText('$50');
  await expect(page.locator('#flight-totals [data-t="total"]')).toHaveText('$57.50');
});

test('R5: sample set — 3 minis = $15, 5 minis lock to $20, 6th is refused', async ({ page }) => {
  await page.goto('shop/?mode=sample');
  const ids = ['coffee', 'watermelon', 'honey-vanilla', 'cinnamon-roll', 'coconut-lime', 'birthday-cake'];
  for (const id of ids.slice(0, 3)) await page.locator(`.tile[data-id="${id}"]`).click();
  await expect(page.locator('#sample-progress')).toHaveText('3 of 5 chosen');
  await expect(page.locator('#sample-totals [data-t="total"]')).toHaveText('$15');
  for (const id of ids.slice(3, 5)) await page.locator(`.tile[data-id="${id}"]`).click();
  await expect(page.locator('#sample-progress')).toHaveText('5 of 5 chosen');
  await expect(page.locator('#sample-totals [data-t="total"]')).toHaveText('$20');
  await page.locator(`.tile[data-id="${ids[5]}"]`).click();
  await expect(page.locator('#sample-progress')).toHaveText('5 of 5 chosen');
  await page.locator('#bar-add').click();
  await expect(page.locator('#cart-subtotal')).toHaveText('$20');
});
