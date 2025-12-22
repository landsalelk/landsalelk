import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  const protectedPages = [
    '/dashboard',
    '/profile',
    '/messages'
  ];

  for (const route of protectedPages) {
    test(`should redirect or show login for ${route}`, async ({ page }) => {
      await page.goto(route);

      // Check for redirection to login page OR if the page content indicates login is required
      try {
          // If redirected to login
          await expect(page).toHaveURL(/\/auth\/login/, { timeout: 3000 });
      } catch (e) {
          // If not redirected, check if content suggests restricted access or login needed
          // Use first() to avoid strict mode violations if multiple sign-in buttons exist (e.g. social logins)
          const loginButton = page.getByRole('button', { name: /sign in/i }).first();
          const accessDenied = page.getByText(/access denied|unauthorized|please login/i).first();

          await expect(loginButton.or(accessDenied)).toBeVisible();
      }
    });
  }
});
