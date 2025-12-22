import { test, expect } from '@playwright/test';

test.describe('Properties Pages', () => {
  test('should load properties list', async ({ page }) => {
    await page.goto('/properties');
    await expect(page).toHaveTitle(/LandSale.lk/);
    // Check if at least one property card or the container is visible
    // Note: This depends on whether there are properties in the DB.
    // Assuming the page loads without error is the first step.
    await expect(page.locator('h1')).toBeVisible();
  });
});
