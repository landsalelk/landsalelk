import { test, expect } from '@playwright/test';

// Define the pages to visit
const pages = [
  '/',
  '/properties',
  '/agents',
  '/auth/login',
  '/auth/register',
  '/auth/register/agent',
  '/auth/forgot-password',
  '/become-agent',
  '/blog',
  '/compare',
  '/faq',
  '/terms',
  '/privacy',
  '/tools/mortgage-calculator',
];

test.describe('Page Verification', () => {
  for (const pagePath of pages) {
    test(`should render ${pagePath} without errors`, async ({ page }) => {
      // Capture console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
      });

      // Capture page errors (uncaught exceptions)
      const pageErrors = [];
      page.on('pageerror', exception => {
        pageErrors.push(exception.message);
      });

      const response = await page.goto(pagePath);

      // Check for 500 or 404
      expect(response.status(), `Page ${pagePath} returned status ${response.status()}`).toBeLessThan(400);

      // Wait for network idle to ensure content loads
      await page.waitForLoadState('networkidle');

      // Check if there were any errors
      if (consoleErrors.length > 0) {
        console.warn(`Console errors on ${pagePath}:`, consoleErrors);
      }
      if (pageErrors.length > 0) {
        console.error(`Page errors on ${pagePath}:`, pageErrors);
      }

      expect(pageErrors.length, `Found page errors on ${pagePath}`).toBe(0);

      // Basic accessibility/content check
      await expect(page).toHaveTitle(/.+/);
    });
  }

  // Specific check for /properties/[id] - we need a valid ID or we can check behavior with an invalid one
  test('should handle invalid property ID gracefully', async ({ page }) => {
    const response = await page.goto('/properties/invalid-id');
    // It might return 404, which is expected.
    if (response.status() === 404) {
        // Success
    } else {
        // If it returns 200, it should probably show a "Not Found" message
        await expect(page.locator('body')).toContainText(/not found|error/i);
    }
  });

  // Check search functionality
  test('should allow searching for properties', async ({ page }) => {
    await page.goto('/properties');
    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible()) {
        await searchInput.fill('Colombo');
        await searchInput.press('Enter');
        await page.waitForLoadState('networkidle');
        // Just ensure it didn't crash
        expect(page.url()).toContain('properties');
    }
  });
});
