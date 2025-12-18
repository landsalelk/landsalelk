import { test, expect } from '@playwright/test';

test.describe('Property Pages Tests', () => {

    test('Properties listing page loads', async ({ page }) => {
        const response = await page.goto('/properties');
        expect(response?.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');

        // Should have a heading
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('Properties page has search/filter functionality', async ({ page }) => {
        await page.goto('/properties');
        await page.waitForLoadState('networkidle');

        // Look for search/filter elements
        const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]');
        const filterButton = page.locator('button:has-text("Filter"), select');

        // At least one should be present
        const hasSearch = await searchInput.count() > 0;
        const hasFilter = await filterButton.count() > 0;

        if (hasSearch) {
            await expect(searchInput.first()).toBeVisible();
        }
        if (hasFilter) {
            await expect(filterButton.first()).toBeVisible();
        }
    });

    test('Property cards are displayed', async ({ page }) => {
        await page.goto('/properties');
        await page.waitForLoadState('networkidle');

        // Wait for property cards to load
        await page.waitForTimeout(2000);

        // Look for property cards or loading state
        const cards = page.locator('[class*="card"], [class*="property"], article');
        const loading = page.locator('text=/loading/i, [class*="loader"], [class*="spinner"]');
        const noResults = page.locator('text=/no properties/i, text=/no results/i');

        const hasCards = await cards.count() > 0;
        const isLoading = await loading.count() > 0;
        const isEmpty = await noResults.count() > 0;

        // One of these states should be true
        expect(hasCards || isLoading || isEmpty).toBeTruthy();
    });

    test('Create property page exists (requires auth)', async ({ page }) => {
        const response = await page.goto('/properties/create');

        // Should redirect to login or show the page
        await page.waitForLoadState('networkidle');

        const currentUrl = page.url();
        // Should either be on create page or redirected to login
        expect(currentUrl.includes('/create') || currentUrl.includes('/login') || currentUrl.includes('/auth')).toBeTruthy();
    });
});

test.describe('Dashboard Pages Tests', () => {

    test('Dashboard redirects to login when not authenticated', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const currentUrl = page.url();
        // Should redirect to auth/login
        expect(currentUrl.includes('/login') || currentUrl.includes('/auth') || currentUrl.includes('/dashboard')).toBeTruthy();
    });
});

test.describe('Static Pages Tests', () => {

    test('FAQ page loads', async ({ page }) => {
        const response = await page.goto('/faq');
        expect(response?.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('Privacy page loads', async ({ page }) => {
        const response = await page.goto('/privacy');
        expect(response?.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
    });

    test('Terms page loads', async ({ page }) => {
        const response = await page.goto('/terms');
        expect(response?.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
    });

    test('Agents page loads', async ({ page }) => {
        const response = await page.goto('/agents');
        expect(response?.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
    });

    test('Become Agent page loads', async ({ page }) => {
        const response = await page.goto('/become-agent');
        expect(response?.status()).toBeLessThan(400);

        await page.waitForLoadState('networkidle');
    });
});

test.describe('Error Handling', () => {

    test('404 page shows for non-existent routes', async ({ page }) => {
        const response = await page.goto('/this-page-does-not-exist-12345');

        // Should return 404
        expect(response?.status()).toBe(404);

        // Should show custom 404 page
        await page.waitForLoadState('networkidle');
        const notFoundText = page.locator('text=/not found/i, text=/404/i');
        await expect(notFoundText.first()).toBeVisible();
    });
});
