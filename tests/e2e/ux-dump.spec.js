import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Pages to audit
const PAGES = [
    '/',
    '/properties',
    '/agents',
    '/pricing',
    '/login'
];

test('UX Architecture Dump', async ({ page }) => {
    const snapshots = {};

    for (const urlPath of PAGES) {
        await page.goto(`http://localhost:3000${urlPath}`);
        await page.waitForLoadState('domcontentloaded');

        // Capture Accessibility Tree (Semantic Structure)
        const snapshot = await page.accessibility.snapshot();

        // Capture Visible Text (Clarity Check)
        const innerText = await page.innerText('body');

        snapshots[urlPath] = {
            title: await page.title(),
            url: urlPath,
            accessibilityTree: snapshot,
            contentSummary: innerText.slice(0, 2000) // First 2k chars for context
        };
    }

    // Save to file for Python to read
    const outPath = path.resolve(__dirname, '../../site/manager_ai/ux_snapshots.json');
    fs.writeFileSync(outPath, JSON.stringify(snapshots, null, 2));
    console.log(`✅ UX Snapshots saved to ${outPath}`);
});
