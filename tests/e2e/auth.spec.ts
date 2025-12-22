import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/LandSale.lk/);
    // Expect some form elements
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
    // Use first() to avoid strict mode violations if multiple inputs exist (e.g. one in footer)
    await expect(page.locator('input[type="email"][name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"][name="password"]').first()).toBeVisible();
  });

  test('should load register page', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page).toHaveTitle(/LandSale.lk/);
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    await expect(page.locator('input[type="email"][name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"][name="password"]').first()).toBeVisible();
  });

  test('should load agent registration page', async ({ page }) => {
    await page.goto('/auth/register/agent');
    await expect(page).toHaveTitle(/LandSale.lk/);
     // Expect agent specific form elements or text
    await expect(page.locator('body')).toContainText(/Agent/i);
  });
});
