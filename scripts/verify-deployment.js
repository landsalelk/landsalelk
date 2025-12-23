/**
 * Verifies that the root directory contains the required files
 * for a valid Next.js deployment.
 *
 * This script checks for the existence of critical configuration files
 * in the repository root to ensure the deployment context is correct.
 *
 * @returns {void} Exits with code 0 on success, 1 on failure.
 */
const fs = require('fs');
const path = require('path');

const requiredFiles = ['package.json', 'next.config.mjs'];
const rootDir = process.cwd();

console.log('Verifying deployment prerequisites...');

let missingFiles = [];

try {
    requiredFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        if (!fs.existsSync(filePath)) {
            missingFiles.push(file);
        }
    });

    if (missingFiles.length > 0) {
        console.error(`Error: Missing required files for root deployment: ${missingFiles.join(', ')}`);
        process.exit(1);
    }

    console.log('Deployment verification successful. Root directory contains valid Next.js application structure.');
    process.exit(0);
} catch (error) {
    console.error(`Critical Error: Failed to verify deployment prerequisites: ${error.message}`);
    process.exit(1);
}
