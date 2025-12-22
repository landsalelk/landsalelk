import { test, expect } from '@playwright/test';

test.describe('Feature Pages', () => {
  test('should load create listing page', async ({ page }) => {
    await page.goto('/properties/create');
    // Check if the page loads the listing form
    await expect(page.getByText('List Your Property')).toBeVisible();
    await expect(page.getByText('What are you listing?')).toBeVisible();
  });
});
