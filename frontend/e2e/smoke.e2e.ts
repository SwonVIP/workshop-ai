import { test, expect } from '@playwright/test';

test.describe('Application Smoke Test', () => {
  test('should load the application and display the header', async ({ page }) => {
    // given — the application is running
    await page.goto('/');

    // then — the header is visible with the store name
    await expect(page.getByRole('link', { name: 'Workshop Store' })).toBeVisible();
  });
});
