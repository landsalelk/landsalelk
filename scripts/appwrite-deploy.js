/**
 * Appwrite Site Deployment Script
 *
 * Usage:
 *   APPWRITE_SITE_ID=<your-id> node scripts/appwrite-deploy.js
 *
 * This script ensures the Appwrite CLI is available and the required
 * environment variables are present before executing the push command.
 */
const util = require('util');
const { exec: execCallback } = require('child_process');
const path = require('path');

const exec = util.promisify(execCallback);
const projectRoot = path.resolve(__dirname, '..');
const siteId = process.env.APPWRITE_SITE_ID;

/**
 * Executes the Appwrite deployment process.
 *
 * This script performs the following actions:
 * 1. Verifies that the Appwrite CLI is installed and available in the system's PATH.
 * 2. Checks that the `APPWRITE_SITE_ID` environment variable is set.
 * 3. Executes the `appwrite push site` command from the project root.
 *
 * It is designed for use in CI/CD environments. It uses async/await for clean, readable control flow
 * and is wrapped in a try...catch block to handle errors robustly. If any step fails,
 * it logs the error to stderr and exits with a non-zero status code to signal failure to the CI runner.
 */
const main = async () => {
    try {
        // Check if the Appwrite CLI is installed and accessible.
        try {
            await exec('appwrite --version');
        } catch (error) {
            throw new Error('Appwrite CLI not found. Please install it globally.');
        }

        // Check if the site ID is provided via environment variables.
        if (!siteId) {
            throw new Error('APPWRITE_SITE_ID environment variable is not set.');
        }

        const deployCommand = `appwrite push site --site-id ${siteId} --force`;

        // Execute the deployment command.
        await exec(deployCommand, { cwd: projectRoot });

    } catch (error) {
        // If any command fails, the promise will reject and be caught here.
        const output = error.stderr || error.stdout || error.message;
        console.error(`Deployment script failed:\n${output}`);
        process.exit(1);
    }
};

main();
