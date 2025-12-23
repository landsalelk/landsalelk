const fs = require('fs');
const path = require('path');

const requiredFiles = ['package.json', 'next.config.mjs'];
const rootDir = process.cwd();

console.log('Verifying deployment prerequisites...');

let missingFiles = [];

requiredFiles.forEach(file => {
    if (!fs.existsSync(path.join(rootDir, file))) {
        missingFiles.push(file);
    }
});

if (missingFiles.length > 0) {
    console.error(`Error: Missing required files for root deployment: ${missingFiles.join(', ')}`);
    process.exit(1);
}

console.log('Deployment verification successful. Root directory contains valid Next.js application structure.');
process.exit(0);
