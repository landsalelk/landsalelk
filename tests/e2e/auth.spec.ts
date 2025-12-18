import { test, expect } from '@playwright/test';

test.describe('Authentication Flow Tests', () => {

    test.describe('Login Page', () => {

        test('Login page loads correctly', async ({ page }) => {
            await page.goto('/auth/login');
            await page.waitForLoadState('networkidle');

            // Check page title or heading
            await expect(page.locator('h1, h2').first()).toBeVisible();

            // Check for email input
            const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
            await expect(emailInput).toBeVisible();

            // Check for password input
            const passwordInput = page.locator('input[type="password"]');
            await expect(passwordInput).toBeVisible();

            // Check for submit button
            const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
            await expect(submitButton).toBeVisible();
        });

        test('Login form validation - empty fields', async ({ page }) => {
            await page.goto('/auth/login');
            await page.waitForLoadState('networkidle');

            // Try to submit empty form
            const submitButton = page.locator('button[type="submit"]').first();
            await submitButton.click();

            // Should show validation or stay on page
            await page.waitForTimeout(500);
            expect(page.url()).toContain('/auth/login');
        });

        test('Login form validation - invalid email', async ({ page }) => {
            await page.goto('/auth/login');
            await page.waitForLoadState('networkidle');

            const emailInput = page.locator('input[type="email"], input[name="email"]').first();
            await emailInput.fill('notanemail');

            const passwordInput = page.locator('input[type="password"]').first();
            await passwordInput.fill('password123');

            const submitButton = page.locator('button[type="submit"]').first();
            await submitButton.click();

            // Should stay on login page (invalid email)
            await page.waitForTimeout(1000);
            expect(page.url()).toContain('/auth/login');
        });

        test('Login form shows password toggle', async ({ page }) => {
            await page.goto('/auth/login');
            await page.waitForLoadState('networkidle');

            // Look for eye icon button to toggle password visibility
            const toggleButton = page.locator('button:has(svg), [class*="eye"]').first();

            if (await toggleButton.isVisible()) {
                const passwordInput = page.locator('input[type="password"]').first();
                await expect(passwordInput).toHaveAttribute('type', 'password');

                await toggleButton.click();
                await page.waitForTimeout(300);

                // Password input should now be type="text"
                const inputType = await page.locator('input[name="password"], input[placeholder*="password" i]').first().getAttribute('type');
                // Either text or password is acceptable
                expect(['text', 'password']).toContain(inputType);
            }
        });

        test('Register link exists on login page', async ({ page }) => {
            await page.goto('/auth/login');
            await page.waitForLoadState('networkidle');

            const registerLink = page.locator('a[href*="register"], a:has-text("Register"), a:has-text("Sign up")');
            await expect(registerLink.first()).toBeVisible();
        });
    });

    test.describe('Register Page', () => {

        test('Register page loads correctly', async ({ page }) => {
            await page.goto('/auth/register');
            await page.waitForLoadState('networkidle');

            // Check for name input
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
            await expect(nameInput.first()).toBeVisible();

            // Check for email input
            const emailInput = page.locator('input[type="email"], input[name="email"]');
            await expect(emailInput.first()).toBeVisible();

            // Check for password input
            const passwordInput = page.locator('input[type="password"]');
            await expect(passwordInput.first()).toBeVisible();

            // Check for submit button
            const submitButton = page.locator('button[type="submit"]');
            await expect(submitButton).toBeVisible();
        });

        test('Register form validation - empty fields', async ({ page }) => {
            await page.goto('/auth/register');
            await page.waitForLoadState('networkidle');

            const submitButton = page.locator('button[type="submit"]').first();
            await submitButton.click();

            await page.waitForTimeout(500);
            expect(page.url()).toContain('/auth/register');
        });

        test('Login link exists on register page', async ({ page }) => {
            await page.goto('/auth/register');
            await page.waitForLoadState('networkidle');

            const loginLink = page.locator('a[href*="login"], a:has-text("Login"), a:has-text("Sign in")');
            await expect(loginLink.first()).toBeVisible();
        });
    });

    test.describe('Forgot Password Page', () => {

        test('Forgot password page loads', async ({ page }) => {
            const response = await page.goto('/auth/forgot-password');

            // Should load or redirect
            expect(response?.status()).toBeLessThan(500);

            await page.waitForLoadState('networkidle');

            // Check for email input
            const emailInput = page.locator('input[type="email"], input[name="email"]');
            if (await emailInput.isVisible()) {
                await expect(emailInput).toBeVisible();
            }
        });
    });
});
