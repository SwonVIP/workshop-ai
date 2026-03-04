import { test, expect } from '@playwright/test';

test.describe('Cart Drawer — Sheet Overlay Behaviors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForTimeout(1000);
  });

  test('should open the cart drawer when clicking the cart trigger', async ({ page }) => {
    // when — user clicks the cart trigger button
    await page.locator('[data-testid="cart-trigger"]').click();

    // then — the cart drawer sheet is visible (rendered in CDK overlay)
    const drawer = page.locator('[data-testid="cart-drawer"]');
    await drawer.waitFor({ state: 'visible', timeout: 5000 });
    await expect(drawer).toBeVisible();
  });

  test('should show "Shopping Cart" title when drawer is open', async ({ page }) => {
    // when — user opens the cart drawer
    await page.locator('[data-testid="cart-trigger"]').click();
    await page.locator('[data-testid="cart-drawer"]').waitFor({ state: 'visible', timeout: 5000 });

    // then — the sheet title reads "Shopping Cart"
    await expect(page.getByText('Shopping Cart')).toBeVisible();
  });

  test('should show empty state messages when cart has no items', async ({ page }) => {
    // when — user opens the cart drawer
    await page.locator('[data-testid="cart-trigger"]').click();
    await page.locator('[data-testid="cart-drawer"]').waitFor({ state: 'visible', timeout: 5000 });

    // then — empty state messages are displayed (parameterized)
    const emptyMessages = ['Your cart is empty', 'No items yet', 'Add products from the catalog'] as const;
    for (const message of emptyMessages) {
      await expect(page.getByText(message)).toBeVisible();
    }
  });

  test('should not show cart badge when cart is empty', async ({ page }) => {
    // given — the cart has no items

    // then — the badge element should not be visible
    const badge = page.locator('[data-testid="cart-badge"]');
    await expect(badge).toHaveCount(0);
  });

  test('should close the drawer when pressing Escape', async ({ page }) => {
    // given — the cart drawer is open
    await page.locator('[data-testid="cart-trigger"]').click();
    const drawer = page.locator('[data-testid="cart-drawer"]');
    await drawer.waitFor({ state: 'visible', timeout: 5000 });

    // when — user presses Escape
    await page.keyboard.press('Escape');

    // then — the drawer closes
    await expect(drawer).toBeHidden({ timeout: 5000 });
  });
});
