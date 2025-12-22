import { test, expect } from '@playwright/test';

test.describe('Critical Path Smoke Tests', () => {

    test('Home page loads and has correct title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/LandSale.lk/);
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    });

    test('Navbar is present', async ({ page }) => {
        await page.goto('/');
        // Check if the desktop nav exists
        await expect(page.locator('.nav-pills')).toBeVisible();
    });

    test('Login page loads', async ({ page }) => {
        await page.goto('/auth/login');
        // Verify URL
        expect(page.url()).toContain('/auth/login');
        // Verify at least one input field exists
        await expect(page.locator('input[type="email"]')).toBeVisible();
    });
});
