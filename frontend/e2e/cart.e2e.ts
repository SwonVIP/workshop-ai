import { test, expect, Page } from '@playwright/test';

async function addFirstProductToCart(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="product-card"]');
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/cart/items') && resp.request().method() === 'POST'),
    page.getByRole('button', { name: 'Add to Cart' }).first().click(),
  ]);
  expect(response.status()).toBe(201);
}

async function navigateToCartWithItems(page: Page): Promise<void> {
  await page.goto('/cart');
  await page.waitForSelector('[data-testid="cart-item-row"]');
}

test.describe('Shopping Cart — Full User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    await page.evaluate(() => localStorage.removeItem('cart-session-id'));
    await page.reload();
  });

  test('should add a product to cart and see badge update in header', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    await expect(page.getByTestId('cart-badge')).toBeVisible();
    await expect(page.getByTestId('cart-badge')).toHaveText('1');
  });

  test('should add same product twice and increment quantity', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    await expect(page.getByTestId('cart-badge')).toHaveText('1');
    // Use stepper to add same product again (first card now shows stepper)
    const firstCard = page.getByTestId('product-card').first();
    const [resp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items') && resp.request().method() === 'POST'),
      firstCard.getByTestId('card-qty-increase').click(),
    ]);
    expect(resp.status()).toBe(201);
    await expect(page.getByTestId('cart-badge')).toHaveText('2');
  });

  test('should display cart items on cart page after adding product', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    await navigateToCartWithItems(page);
    await expect(page.getByTestId('cart-item-row')).toHaveCount(1);
    await expect(page.getByTestId('cart-total')).toBeVisible();
  });

  test('should increase item quantity on cart page', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    await navigateToCartWithItems(page);
    await expect(page.getByTestId('qty-value')).toHaveText('1');
    const [updateResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items/') && resp.request().method() === 'PUT'),
      page.getByTestId('qty-increase').click(),
    ]);
    expect(updateResp.status()).toBe(200);
    await expect(page.getByTestId('qty-value')).toHaveText('2');
  });

  test('should decrease item quantity on cart page', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    // Use stepper to add same product again (first card now shows stepper)
    const firstCard = page.getByTestId('product-card').first();
    const [addResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items') && resp.request().method() === 'POST'),
      firstCard.getByTestId('card-qty-increase').click(),
    ]);
    expect(addResp.status()).toBe(201);
    await navigateToCartWithItems(page);
    await expect(page.getByTestId('qty-value')).toHaveText('2');
    const [updateResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items/') && resp.request().method() === 'PUT'),
      page.getByTestId('qty-decrease').click(),
    ]);
    expect(updateResp.status()).toBe(200);
    await expect(page.getByTestId('qty-value')).toHaveText('1');
  });

  test('should disable minus button when quantity is 1', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    await navigateToCartWithItems(page);
    await expect(page.getByTestId('qty-decrease')).toBeDisabled();
  });

  test('should remove item from cart and show empty state', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    await navigateToCartWithItems(page);
    const [deleteResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items/') && resp.request().method() === 'DELETE'),
      page.getByTestId('remove-item').click(),
    ]);
    expect(deleteResp.status()).toBe(204);
    await expect(page.getByText('Your cart is empty')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse Products' })).toBeVisible();
  });

  test('should navigate to checkout from cart page', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    await navigateToCartWithItems(page);
    await page.getByTestId('checkout-button').click();
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('should show empty state when navigating to cart without items', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText('Your cart is empty')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse Products' })).toBeVisible();
  });

  test('should navigate from empty cart to catalog via Browse Products link', async ({ page }) => {
    await page.goto('/cart');
    await page.getByRole('link', { name: 'Browse Products' }).click();
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('should persist cart across hard page refresh', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    await expect(page.getByTestId('cart-badge')).toHaveText('1');

    // hard refresh — full page reload
    await page.reload();
    await page.waitForSelector('[data-testid="product-card"]');

    // then — cart badge still shows "1"
    await expect(page.getByTestId('cart-badge')).toHaveText('1');
  });

  test('should persist cart across page navigation', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    await expect(page.getByTestId('cart-badge')).toHaveText('1');
    await navigateToCartWithItems(page);
    await expect(page.getByTestId('cart-item-row')).toHaveCount(1);
    await page.goto('/catalog');
    await page.waitForSelector('[data-testid="product-card"]');
    await expect(page.getByTestId('cart-badge')).toHaveText('1');
  });

  test('should show cart items in header drawer after adding product', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    await page.getByTestId('cart-trigger').click();
    await expect(page.getByTestId('cart-drawer')).toBeVisible();
    await expect(page.getByText('1 item in your cart')).toBeVisible();
  });

  test('should show quantity stepper on product card after adding to cart', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    const firstCard = page.getByTestId('product-card').first();
    await expect(firstCard.getByTestId('card-qty-value')).toHaveText('1');
    await expect(firstCard.getByTestId('card-qty-decrease')).toBeVisible();
    await expect(firstCard.getByTestId('card-qty-increase')).toBeVisible();
  });

  test('should increment quantity from product card stepper', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    const firstCard = page.getByTestId('product-card').first();
    await expect(firstCard.getByTestId('card-qty-value')).toHaveText('1');
    const [resp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items') && resp.request().method() === 'POST'),
      firstCard.getByTestId('card-qty-increase').click(),
    ]);
    expect(resp.status()).toBe(201);
    await expect(firstCard.getByTestId('card-qty-value')).toHaveText('2');
  });

  test('should remove product from cart via product card stepper when quantity is 1', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    const firstCard = page.getByTestId('product-card').first();
    await expect(firstCard.getByTestId('card-qty-value')).toHaveText('1');
    const [resp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart/items/') && resp.request().method() === 'DELETE'),
      firstCard.getByTestId('card-qty-decrease').click(),
    ]);
    expect(resp.status()).toBe(204);
    await expect(firstCard.getByRole('button', { name: 'Add to Cart' })).toBeVisible();
    await expect(page.getByTestId('cart-badge')).not.toBeVisible();
  });

  test('should clear all items from cart via Clear Cart button', async ({ page }) => {
    await page.goto('/catalog');
    await addFirstProductToCart(page);
    await navigateToCartWithItems(page);
    const [clearResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/cart') && resp.request().method() === 'DELETE' && !resp.url().includes('/items')),
      page.getByTestId('clear-cart').click(),
    ]);
    expect(clearResp.status()).toBe(200);
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });

  test('should not show Clear Cart button when cart is empty', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByTestId('clear-cart')).not.toBeVisible();
  });
});
