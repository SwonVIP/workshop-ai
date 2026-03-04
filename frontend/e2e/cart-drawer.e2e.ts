import { test, expect } from '@playwright/test';

test.describe('Cart Drawer — Sheet Overlay Behaviors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForSelector('[data-testid="product-card"]');
  });

  test('should open the cart drawer when clicking the cart trigger', async ({ page }) => {
    // when — user clicks the cart trigger button
    await page.locator('[data-testid="cart-trigger"]').click();

    // then — the cart drawer sheet is visible (rendered in CDK overlay)
    const drawer = page.locator('[data-testid="cart-drawer"]');
    await drawer.waitFor({ state: 'visible', timeout: 5000 });
    await expect(drawer).toBeVisible();

    // and — drawer shows expected content: title and empty state text
    await expect(drawer.getByText('Shopping Cart')).toBeVisible();
    await expect(drawer.getByText('No items yet')).toBeVisible();
    await expect(drawer.getByText('Add products from the catalog')).toBeVisible();
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

  test('should increase item quantity from drawer stepper', async ({ page }) => {
    // given — a product is in the cart and the drawer is open
    await page.evaluate(() => localStorage.removeItem('cart-session-id'));
    await page.reload();
    await page.waitForSelector('[data-testid="product-card"]');
    const [addResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items') && resp.request().method() === 'POST'),
      page.getByRole('button', { name: 'Add to Cart' }).first().click(),
    ]);
    expect(addResp.status()).toBe(201);
    await page.getByTestId('cart-trigger').click();
    await page.getByTestId('cart-drawer').waitFor({ state: 'visible' });
    await expect(page.getByTestId('drawer-qty-value')).toHaveText('1');

    // when — user clicks the + button in the drawer
    const [updateResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items/') && resp.request().method() === 'PUT'),
      page.getByTestId('drawer-qty-increase').click(),
    ]);

    // then — quantity increments and API returns 200
    expect(updateResp.status()).toBe(200);
    await expect(page.getByTestId('drawer-qty-value')).toHaveText('2');
  });

  test('should decrease item quantity from drawer stepper', async ({ page }) => {
    // given — a product with qty 2 is in the cart and the drawer is open
    await page.evaluate(() => localStorage.removeItem('cart-session-id'));
    await page.reload();
    await page.waitForSelector('[data-testid="product-card"]');
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items') && resp.request().method() === 'POST'),
      page.getByRole('button', { name: 'Add to Cart' }).first().click(),
    ]);
    await page.getByTestId('cart-trigger').click();
    await page.getByTestId('cart-drawer').waitFor({ state: 'visible' });
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items/') && resp.request().method() === 'PUT'),
      page.getByTestId('drawer-qty-increase').click(),
    ]);
    await expect(page.getByTestId('drawer-qty-value')).toHaveText('2');

    // when — user clicks the − button in the drawer
    const [decResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items/') && resp.request().method() === 'PUT'),
      page.getByTestId('drawer-qty-decrease').click(),
    ]);

    // then — quantity decrements and API returns 200
    expect(decResp.status()).toBe(200);
    await expect(page.getByTestId('drawer-qty-value')).toHaveText('1');
  });

  test('should remove item from drawer via remove button', async ({ page }) => {
    // given — a product is in the cart and the drawer is open
    await page.evaluate(() => localStorage.removeItem('cart-session-id'));
    await page.reload();
    await page.waitForSelector('[data-testid="product-card"]');
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items') && resp.request().method() === 'POST'),
      page.getByRole('button', { name: 'Add to Cart' }).first().click(),
    ]);
    await page.getByTestId('cart-trigger').click();
    await page.getByTestId('cart-drawer').waitFor({ state: 'visible' });

    // when — user clicks the remove button on the item
    const [deleteResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items/') && resp.request().method() === 'DELETE'),
      page.getByTestId('drawer-remove-item').click(),
    ]);

    // then — item is removed and empty state shown
    expect(deleteResp.status()).toBe(204);
    await expect(page.getByText('No items yet')).toBeVisible();
  });

  test('should clear cart from drawer via Clear Cart button', async ({ page }) => {
    // given — a product is in the cart and the drawer is open
    await page.evaluate(() => localStorage.removeItem('cart-session-id'));
    await page.reload();
    await page.waitForSelector('[data-testid="product-card"]');
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items') && resp.request().method() === 'POST'),
      page.getByRole('button', { name: 'Add to Cart' }).first().click(),
    ]);
    await page.getByTestId('cart-trigger').click();
    await page.getByTestId('cart-drawer').waitFor({ state: 'visible' });

    // when — user clicks Clear Cart
    const [clearResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart') && resp.request().method() === 'DELETE' && !resp.url().includes('/items')),
      page.getByTestId('drawer-clear-cart').click(),
    ]);

    // then — cart is emptied
    expect(clearResp.status()).toBe(200);
    await expect(page.getByText('No items yet')).toBeVisible();
  });
});
