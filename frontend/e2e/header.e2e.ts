import { test, expect } from '@playwright/test';

test.describe('Header — Navigation & Branding', () => {
  test('should display the store name linking to home', async ({ page }) => {
    // given — user opens the catalog
    await page.goto('/catalog');

    // then — the store name is visible
    const homeLink = page.locator('header a', { hasText: 'Workshop Store' });
    await expect(homeLink).toBeVisible();
  });

  test('should navigate to catalog when clicking the Catalog link', async ({ page }) => {
    // given — user is on the home page
    await page.goto('/');

    // when — user clicks the Catalog nav link
    await page.locator('header a', { hasText: 'Catalog' }).click();

    // then — URL should be /catalog
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('should show the cart trigger button with shopping cart label', async ({ page }) => {
    // given — user opens the catalog
    await page.goto('/catalog');

    // then — cart trigger is visible with correct aria-label
    const cartTrigger = page.locator('[data-testid="cart-trigger"]');
    await expect(cartTrigger).toBeVisible();
    await expect(cartTrigger).toHaveAttribute('aria-label', 'Shopping cart');
  });

  test('should show the header fixed at the top across all pages', async ({ page }) => {
    // given — parameterized across multiple routes
    const routes = ['/catalog', '/cart', '/checkout'] as const;

    for (const route of routes) {
      // when — user visits each route
      await page.goto(route);

      // then — header is visible and fixed
      const header = page.locator('header');
      await expect(header).toBeVisible();
      await expect(header).toHaveCSS('position', 'fixed');
      await expect(header).toHaveCSS('top', '0px');
    }
  });
});
