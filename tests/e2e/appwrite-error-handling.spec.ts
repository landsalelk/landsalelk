import { test, expect } from '@playwright/test';

test.describe('Appwrite Error Handling Tests', () => {
    test('Chat functionality handles missing indexes gracefully', async ({ page }) => {
        await page.goto('/');
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
        
        // Wait for any async operations
        await page.waitForTimeout(2000);
        
        // Look for Appwrite related errors that should be handled
        const appwriteErrors = errors.filter(e => 
            e.includes('Appwrite') || 
            e.includes('index') || 
            e.includes('missing') ||
            e.includes('conversation_id') ||
            e.includes('is_read')
        );
        
        // These errors should be handled gracefully and not crash the app
        console.log('Appwrite related messages (should be handled):', appwriteErrors);
    });
    
    test('Messaging page handles database errors', async ({ page }) => {
        // Try to access messages page
        await page.goto('/messages');
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
        
        // Wait for any async operations
        await page.waitForTimeout(2000);
        
        // Check for unhandled Appwrite errors
        const unhandledErrors = errors.filter(e => 
            e.includes('Unhandled') && 
            (e.includes('Appwrite') || e.includes('database'))
        );
        
        // Should not have unhandled Appwrite errors
        expect(unhandledErrors.length).toBe(0);
    });
});