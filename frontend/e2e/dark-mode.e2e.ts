import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('theme-preference'));
    await page.reload();
  });

  test('should toggle dark class on html element when theme toggle is clicked', async ({
    page,
  }) => {
    await page.goto('/');

    // Initially, html should not have 'dark' class (system default in test env = light)
    const htmlElement = page.locator('html');
    await expect(htmlElement).not.toHaveClass(/dark/);

    // Click the theme toggle button
    const toggleButton = page.getByTestId('theme-toggle');
    await expect(toggleButton).toBeVisible();

    // First click: system → light (still no dark class)
    await toggleButton.click();
    await expect(htmlElement).not.toHaveClass(/dark/);

    // Second click: light → dark
    await toggleButton.click();
    await expect(htmlElement).toHaveClass(/dark/);

    // Third click: dark → system (back to light in test env)
    await toggleButton.click();
    await expect(htmlElement).not.toHaveClass(/dark/);
  });

  test('should persist theme preference across page reloads', async ({ page }) => {
    await page.goto('/');

    const toggleButton = page.getByTestId('theme-toggle');

    // Set to dark: system → light → dark (2 clicks)
    await toggleButton.click();
    await toggleButton.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Verify localStorage was set
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme-preference'));
    expect(storedTheme).toBe('dark');

    // Reload page
    await page.reload();

    // Dark mode should persist
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
