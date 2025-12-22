import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  const pages = [
    { route: '/', title: 'LandSale.lk' },
    { route: '/blog', title: 'LandSale.lk' },
    { route: '/become-agent', title: 'LandSale.lk' },
    { route: '/legal', title: 'LandSale.lk' },
    { route: '/terms', title: 'LandSale.lk' },
    { route: '/privacy', title: 'LandSale.lk' },
    { route: '/faq', title: 'LandSale.lk' },
    { route: '/kyc', title: 'LandSale.lk' },
    { route: '/tools/mortgage-calculator', title: 'Mortgage Calculator' },
    { route: '/agents', title: 'LandSale.lk' },
  ];

  for (const pageInfo of pages) {
    test(`should load ${pageInfo.route} successfully`, async ({ page }) => {
      await page.goto(pageInfo.route);
      await expect(page).toHaveTitle(new RegExp(pageInfo.title));
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
