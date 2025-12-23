/**
 * Deployment Prerequisite Verification Script
 *
 * This script verifies that the root directory contains the necessary
 * files for a valid Appwrite Site deployment of the main Next.js application.
 *
 * Usage: node scripts/verify-deployment.js
 *
 * @returns {Promise<void>} Exits with code 0 on success, 1 on failure.
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = ['package.json', 'next.config.mjs'];
const rootDir = process.cwd();

async function verifyDeployment() {
    // Using console.info for CLI status updates
    console.info('Verifying deployment prerequisites...');

    let missingFiles = [];

    try {
        await Promise.all(requiredFiles.map(async (file) => {
            const filePath = path.join(rootDir, file);
            try {
                await fs.promises.access(filePath, fs.constants.F_OK);
            } catch {
                missingFiles.push(file);
            }
        }));

        if (missingFiles.length > 0) {
            console.error(`Error: Missing required files for root deployment: ${missingFiles.join(', ')}`);
            process.exit(1);
        }

        console.info('Deployment verification successful. Root directory contains valid Next.js application structure.');
        process.exit(0);
    } catch (error) {
        console.error('An unexpected error occurred during verification:', error.message);
        process.exit(1);
    }
}

verifyDeployment();
