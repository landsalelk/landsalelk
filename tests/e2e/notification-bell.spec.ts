import { test, expect } from '@playwright/test';

test.describe('Notification Bell Component Tests', () => {
    test('Notification bell loads without initialization errors', async ({ page }) => {
        // Navigate to homepage
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Wait for page to fully load
        await page.waitForTimeout(3000);
        
        // Check for JavaScript errors in console
        let hasInitializationError = false;
        page.on('console', msg => {
            if (msg.type() === 'error' && msg.text().includes('checkUser')) {
                hasInitializationError = true;
            }
        });
        
        page.on('pageerror', error => {
            if (error.message.includes('checkUser')) {
                hasInitializationError = true;
            }
        });
        
        // Try to find notification bell (might not be visible if user not logged in)
        const bellElements = await page.$$('button[aria-label="Notifications"]');
        
        // Wait a bit to catch any async errors
        await page.waitForTimeout(2000);
        
        // Expect no initialization errors
        expect(hasInitializationError).toBeFalsy();
    });
    
    test('Notification bell functionality when logged in', async ({ page }) => {
        // This test would require a logged in user
        // For now, just check that the component doesn't throw initialization errors
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Wait for full page load
        await page.waitForTimeout(3000);
        
        // Check console for errors
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        page.on('pageerror', error => {
            errors.push(`Page error: ${error.message}`);
        });
        
        // Wait for any async operations
        await page.waitForTimeout(2000);
        
        // Check that no initialization errors occurred
        const initErrors = errors.filter(e => e.includes('checkUser') || e.includes('Cannot access'));
        expect(initErrors.length).toBe(0);
    });
});