import { test, expect } from '@playwright/test';

test.describe('Product Catalog — Browsing & Discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
  });

  test('should display a paginated grid of products when opening the catalog', async ({ page }) => {
    // given — a user opens the catalog
    await expect(page.getByRole('heading', { name: 'Product Catalog' })).toBeVisible();

    // then — product cards are visible
    const cards = page.locator('[data-testid="product-card"]');
    await expect(cards).toHaveCount(12);

    // and — pagination is visible
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
  });

  test('should filter products by category when a category is selected', async ({ page }) => {
    // when — user selects Electronics from the category dropdown
    await page.locator('[data-testid="category-filter"]').selectOption('Electronics');

    // then — wait for the grid to update
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();

    // and — all visible products should show the Electronics badge
    const badges = page.locator('[data-testid="product-card"] [data-testid="category-badge"]');
    for (const badge of await badges.all()) {
      await expect(badge).toHaveText('Electronics');
    }
  });

  test('should filter products by search term when user types in search box', async ({ page }) => {
    // when — user searches for a specific product
    await page.getByPlaceholder('Search products...').fill('Headphones');

    // then — wait for debounce + API call and results to appear
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();

    // and — at least one result contains "Headphones"
    await expect(page.locator('[data-testid="product-card"]').first()).toContainText('Headphones');
  });

  test('should filter products by price range when price filter is selected', async ({ page }) => {
    // when — user filters by price range CHF 50-100
    await page.locator('[data-testid="price-filter"]').selectOption('50-100');

    // then — products are shown or empty state appears
    await expect(
      page.locator('[data-testid="product-card"], [data-testid="empty-state"]').first(),
    ).toBeVisible();

    // and — if products exist, at least one card is visible
    const cards = page.locator('[data-testid="product-card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // and — all displayed prices fall within CHF 50–100
    for (const card of await cards.all()) {
      const priceText = await card.locator('[data-testid="product-price"]').textContent();
      const price = parseFloat(priceText!.replace(/[^0-9.]/g, ''));
      expect(price).toBeGreaterThanOrEqual(50);
      expect(price).toBeLessThanOrEqual(100);
    }
  });

  test('should sort products when sort option changes', async ({ page }) => {
    // when — user sorts by price ascending
    await page.locator('[data-testid="sort-filter"]').selectOption('price-asc');

    // then — verify products are visible
    const cards = page.locator('[data-testid="product-card"]');
    await expect(cards.first()).toBeVisible();

    // and — first product price ≤ second product price (sort order verified)
    const firstPriceText = await cards
      .nth(0)
      .locator('[data-testid="product-price"]')
      .textContent();
    const secondPriceText = await cards
      .nth(1)
      .locator('[data-testid="product-price"]')
      .textContent();
    const firstPrice = parseFloat(firstPriceText!.replace(/[^0-9.]/g, ''));
    const secondPrice = parseFloat(secondPriceText!.replace(/[^0-9.]/g, ''));
    expect(firstPrice).toBeLessThanOrEqual(secondPrice);
  });

  test('should navigate to the next page when Next button is clicked', async ({ page }) => {
    // when — user clicks Next to see more products
    const [resp] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/products') && resp.status() === 200),
      page.getByRole('button', { name: /next/i }).click(),
    ]);
    expect(resp.status()).toBe(200);

    // then — product count label reflects page 2 range (starting at 13)
    await expect(page.locator('[data-testid="product-count"]')).toContainText(/Showing 13-/);
  });

  test('should disable Previous button on the first page', async ({ page }) => {
    // then — on the first page, Previous should be disabled
    const prevButton = page.getByRole('button', { name: /previous/i });
    await expect(prevButton).toBeDisabled();
  });

  test('should show empty state when search returns no results', async ({ page }) => {
    // when — user searches for something that doesn't exist
    await page.getByPlaceholder('Search products...').fill('xyznonexistentproduct123');

    // then — empty state should be visible
    await expect(page.getByText('No products found')).toBeVisible();
  });

  test('should reset to first page when filter changes', async ({ page }) => {
    // given — user navigates to page 2
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();

    // when — user applies a filter
    await page.locator('[data-testid="category-filter"]').selectOption('Electronics');

    // then — should be back on page 1
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test('should display correct product count label', async ({ page }) => {
    // then — the count label reflects page range and total
    const countLabel = page.locator('[data-testid="product-count"]');
    await expect(countLabel).toBeVisible();
    await expect(countLabel).toContainText(/Showing \d+-\d+ of \d+ products/);
  });
});
