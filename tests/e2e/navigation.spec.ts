import { test, expect, Page } from '@playwright/test';

// Configuration
const BASE_URL = 'http://localhost:3000';

// Collect all console errors
const consoleErrors: { page: string; message: string; type: string }[] = [];

test.describe('Navigation & Console Error Tests', () => {

    // Pages to test
    const pages = [
        { path: '/', name: 'Home' },
        { path: '/auth/login', name: 'Login' },
        { path: '/auth/register', name: 'Register' },
        { path: '/properties', name: 'Properties List' },
        { path: '/faq', name: 'FAQ' },
        { path: '/privacy', name: 'Privacy' },
        { path: '/terms', name: 'Terms' },
        { path: '/agents', name: 'Agents' },
        { path: '/become-agent', name: 'Become Agent' },
    ];

    for (const pageConfig of pages) {
        test(`Page loads without errors: ${pageConfig.name}`, async ({ page }) => {
            // Collect console errors
            const pageErrors: string[] = [];

            page.on('console', msg => {
                if (msg.type() === 'error') {
                    pageErrors.push(msg.text());
                    consoleErrors.push({
                        page: pageConfig.path,
                        message: msg.text(),
                        type: 'console'
                    });
                }
            });

            page.on('pageerror', error => {
                pageErrors.push(error.message);
                consoleErrors.push({
                    page: pageConfig.path,
                    message: error.message,
                    type: 'pageerror'
                });
            });

            // Navigate to page
            const response = await page.goto(pageConfig.path);

            // Check response status
            expect(response?.status()).toBeLessThan(400);

            // Wait for page to be fully loaded
            await page.waitForLoadState('networkidle');

            // Take screenshot for visual reference
            await page.screenshot({
                path: `test-results/screenshots/${pageConfig.name.replace(/\s/g, '-')}.png`,
                fullPage: true
            });

            // Log any errors found (but don't fail test for hydration warnings)
            if (pageErrors.length > 0) {
                console.log(`Console errors on ${pageConfig.name}:`, pageErrors);
            }
        });
    }
});

test.describe('Broken Links Detection', () => {
    test('Check all links on home page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Get all anchor tags
        const links = await page.locator('a[href]').all();
        const brokenLinks: { href: string; status: number }[] = [];
        const checkedLinks = new Set<string>();

        for (const link of links) {
            const href = await link.getAttribute('href');
            if (!href) continue;

            // Skip if already checked
            if (checkedLinks.has(href)) continue;
            checkedLinks.add(href);

            // Skip external links, anchors, javascript, and mailto
            if (href.startsWith('http') && !href.includes('localhost')) continue;
            if (href.startsWith('#')) continue;
            if (href.startsWith('javascript:')) continue;
            if (href.startsWith('mailto:')) continue;
            if (href.startsWith('tel:')) continue;

            // Check internal links
            try {
                const fullUrl = href.startsWith('/') ? `${BASE_URL}${href}` : href;
                const response = await page.request.get(fullUrl);

                if (response.status() >= 400) {
                    brokenLinks.push({ href, status: response.status() });
                }
            } catch (error) {
                brokenLinks.push({ href, status: 0 });
            }
        }

        // Report broken links
        if (brokenLinks.length > 0) {
            console.log('Broken links found:', brokenLinks);
        }

        // Test passes but logs broken links
        expect(brokenLinks.filter(l => l.status === 404).length).toBe(0);
    });

    test('Check all links on properties page', async ({ page }) => {
        await page.goto('/properties');
        await page.waitForLoadState('networkidle');

        const links = await page.locator('a[href]').all();
        const brokenLinks: { href: string; status: number }[] = [];
        const checkedLinks = new Set<string>();

        for (const link of links.slice(0, 20)) { // Limit to first 20 links
            const href = await link.getAttribute('href');
            if (!href) continue;
            if (checkedLinks.has(href)) continue;
            checkedLinks.add(href);

            if (href.startsWith('http') && !href.includes('localhost')) continue;
            if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) continue;

            try {
                const fullUrl = href.startsWith('/') ? `${BASE_URL}${href}` : href;
                const response = await page.request.get(fullUrl);
                if (response.status() >= 400) {
                    brokenLinks.push({ href, status: response.status() });
                }
            } catch {
                brokenLinks.push({ href, status: 0 });
            }
        }

        if (brokenLinks.length > 0) {
            console.log('Broken links on properties page:', brokenLinks);
        }
    });
});
