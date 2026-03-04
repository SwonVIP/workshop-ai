import { Page } from '@playwright/test';

/**
 * Navigate to the catalog page.
 */
export async function navigateToCatalog(page: Page): Promise<void> {
  await page.goto('/catalog');
}

/**
 * Navigate to the cart page.
 */
export async function navigateToCart(page: Page): Promise<void> {
  await page.goto('/cart');
}
