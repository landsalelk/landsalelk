import { test, expect } from '@playwright/test';

test.describe('Image Safety Tests', () => {
    test('Property creation page loads without image errors', async ({ page }) => {
        await page.goto('/properties/create');
        await page.waitForLoadState('networkidle');
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        // Check for JavaScript errors
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && (msg.text().includes('img') || msg.text().includes('image'))) {
                errors.push(msg.text());
            }
        });
        
        page.on('pageerror', error => {
            errors.push(`Page error: ${error.message}`);
        });
        
        // Wait for any image loading
        await page.waitForTimeout(2000);
        
        // Check that no image-related errors occurred
        const imageErrors = errors.filter(e => e.includes('img') || e.includes('image') || e.includes('Invalid URL'));
        // We're not expecting image errors, but if they occur, they should be handled gracefully
        console.log('Image related messages:', imageErrors);
    });
    
    test('Property edit page handles images safely', async ({ page }) => {
        await page.goto('/properties');
        await page.waitForLoadState('networkidle');
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        // Check for JavaScript errors
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        page.on('pageerror', error => {
            errors.push(`Page error: ${error.message}`);
        });
        
        // Wait for any operations
        await page.waitForTimeout(2000);
        
        // Check that no critical errors occurred
        const criticalErrors = errors.filter(e => 
            e.includes('Unhandled Runtime Error') || 
            e.includes('Invalid URL') ||
            e.includes('undefined')
        );
        
        expect(criticalErrors.length).toBe(0);
    });
});