import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */

/**
 * Timeout configurations in milliseconds for the E2E test suite.
 * Adjusted to accommodate Next.js Cold Start and CI flakiness.
 */
const TIMEOUTS = {
    // Maximum time one test can run for. Increased for Next.js Cold Start on CI.
    TEST: 120 * 1000,
    // Maximum time expect() should wait for a condition to be met.
    EXPECT: 5000,
    // Maximum time each action such as `click()` can take.
    ACTION: 15000,
    // Maximum time for the web server to start, including the build step.
    SERVER: 120 * 1000,
};

export default defineConfig({
    testDir: './tests/e2e',
    /* Maximum time one test can run for. */
    timeout: TIMEOUTS.TEST,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: TIMEOUTS.EXPECT,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: TIMEOUTS.ACTION,
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',

        /* Capture screenshot on failure */
        screenshot: 'only-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },

        /* Test against mobile viewports. */
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        /**
         * The command to build and start the production server.
         * This avoids the Next.js dev server's slow cold start during tests.
         * If the command fails (e.g., build error), Playwright will exit and report the error.
         */
        command: 'npm run build && npm start',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        /*
         * Maximum time to wait for the server to start.
         * This needs to be long enough to accommodate the `npm run build` step.
         */
        timeout: TIMEOUTS.SERVER,
    },
});
