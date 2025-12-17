#!/usr/bin/env node
/**
 * Deploy Appwrite Functions
 * 
 * This script helps deploy the Appwrite Functions for:
 * - generate-certificate: PDF certificate generation
 * - generate-agent-id: Digital ID card generation
 * 
 * Prerequisites:
 * 1. Install Appwrite CLI: npm install -g appwrite-cli
 * 2. Login: appwrite login
 * 3. Set project: appwrite init
 * 
 * Usage: node scripts/deploy-functions.js
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const FUNCTIONS_DIR = './functions';

console.log('🚀 Deploying Appwrite Functions...\n');

// Check if Appwrite CLI is installed
try {
    execSync('appwrite --version', { stdio: 'pipe' });
} catch (e) {
    console.error('❌ Appwrite CLI not found. Install it with: npm install -g appwrite-cli');
    console.error('   Then login with: appwrite login');
    process.exit(1);
}

// Get all function directories
const functions = readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

if (functions.length === 0) {
    console.log('No functions found in ./functions directory');
    process.exit(0);
}

console.log(`Found ${functions.length} function(s): ${functions.join(', ')}\n`);

// Deploy each function
for (const func of functions) {
    const funcPath = join(FUNCTIONS_DIR, func);
    const packageJsonPath = join(funcPath, 'package.json');

    console.log(`\n📦 Deploying: ${func}`);
    console.log('─'.repeat(40));

    // Install dependencies
    if (existsSync(packageJsonPath)) {
        console.log('  Installing dependencies...');
        try {
            execSync('npm install', { cwd: funcPath, stdio: 'inherit' });
        } catch (e) {
            console.error(`  ❌ Failed to install dependencies for ${func}`);
            continue;
        }
    }

    // Deploy function
    console.log('  Deploying to Appwrite...');
    try {
        execSync(`appwrite functions createDeployment --functionId=${func} --activate=true --code="${funcPath}"`, {
            stdio: 'inherit'
        });
        console.log(`  ✅ ${func} deployed successfully!`);
    } catch (e) {
        console.error(`  ❌ Failed to deploy ${func}`);
        console.error('  Make sure the function exists in Appwrite Console first.');
    }
}

console.log('\n\n✅ Deployment complete!\n');
console.log('📋 Next steps:');
console.log('1. Go to Appwrite Console > Functions');
console.log('2. Configure environment variables for each function:');
console.log('   - APPWRITE_ENDPOINT');
console.log('   - APPWRITE_API_KEY');
console.log('   - DATABASE_ID');
console.log('   - BUCKET_CERTIFICATES (for generate-certificate)');
console.log('   - BUCKET_AGENT_IDS (for generate-agent-id)');
console.log('   - COLLECTION_AGENTS');
console.log('3. Create the storage buckets if they don\'t exist');
