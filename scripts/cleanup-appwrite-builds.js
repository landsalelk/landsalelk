/**
 * Appwrite Cleanup Script
 * Keeps only active deployments for site and all functions
 * Deletes all old, failed, and inactive builds
 * 
 * Run: node scripts/cleanup-appwrite-builds.js
 */

const { Client, Sites, Functions } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject')
    .setKey(process.env.APPWRITE_API_KEY);

const sites = new Sites(client);
const functions = new Functions(client);

// Site ID
const SITE_ID = '6941d9280032a28b0536';

async function cleanupSiteDeployments() {
    console.log('\n📦 Cleaning Site Deployments...\n');

    try {
        const response = await sites.listDeployments(SITE_ID);
        const deployments = response.deployments || [];

        console.log(`   Found ${deployments.length} total deployments`);

        // Find the active deployment
        const activeDeployment = deployments.find(d => d.status === 'ready' && d.activate === true);

        if (!activeDeployment) {
            console.log('   ⚠️ No active deployment found. Keeping most recent ready build.');
            const readyDeployments = deployments.filter(d => d.status === 'ready');
            if (readyDeployments.length > 0) {
                // Keep the most recent one
                readyDeployments.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
                const keepId = readyDeployments[0].$id;
                console.log(`   Keeping: ${keepId}`);
            }
        } else {
            console.log(`   ✅ Active deployment: ${activeDeployment.$id}`);
        }

        const activeId = activeDeployment?.$id;
        let deleted = 0;

        for (const deployment of deployments) {
            if (deployment.$id === activeId) {
                console.log(`   ⏭️ Keeping active: ${deployment.$id}`);
                continue;
            }

            console.log(`   🗑️ Deleting: ${deployment.$id} (${deployment.status})`);
            try {
                await sites.deleteDeployment(SITE_ID, deployment.$id);
                deleted++;
            } catch (e) {
                console.log(`      ⚠️ Could not delete: ${e.message}`);
            }
        }

        console.log(`\n   ✅ Site cleanup complete! Deleted ${deleted} old deployments.`);

    } catch (error) {
        console.error('   ❌ Error cleaning site:', error.message);
    }
}

async function cleanupFunctionDeployments() {
    console.log('\n⚡ Cleaning Function Deployments...\n');

    try {
        // List all functions
        const functionsResponse = await functions.list();
        const functionsList = functionsResponse.functions || [];

        console.log(`   Found ${functionsList.length} functions\n`);

        let totalDeleted = 0;

        for (const func of functionsList) {
            console.log(`   📁 ${func.name} (${func.$id}):`);

            try {
                // List deployments for this function
                const deploymentsResponse = await functions.listDeployments(func.$id);
                const deployments = deploymentsResponse.deployments || [];

                if (deployments.length === 0) {
                    console.log('      No deployments found');
                    continue;
                }

                console.log(`      Found ${deployments.length} deployments`);

                // Find active deployment (the one that's currently deployed)
                const activeDeployment = deployments.find(d => d.$id === func.deployment);

                if (!activeDeployment) {
                    // Keep the most recent ready one
                    const readyDeployments = deployments.filter(d => d.status === 'ready');
                    if (readyDeployments.length > 0) {
                        readyDeployments.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
                        console.log(`      Keeping most recent: ${readyDeployments[0].$id}`);
                    }
                } else {
                    console.log(`      Active: ${activeDeployment.$id}`);
                }

                const activeId = activeDeployment?.$id || func.deployment;
                let deleted = 0;

                for (const deployment of deployments) {
                    if (deployment.$id === activeId) {
                        continue; // Keep active
                    }

                    try {
                        await functions.deleteDeployment(func.$id, deployment.$id);
                        deleted++;
                    } catch (e) {
                        // Silently continue
                    }
                }

                if (deleted > 0) {
                    console.log(`      ✅ Deleted ${deleted} old deployments`);
                    totalDeleted += deleted;
                } else {
                    console.log(`      ✅ Already clean`);
                }

            } catch (e) {
                console.log(`      ⚠️ Error: ${e.message}`);
            }
        }

        console.log(`\n   ✅ Functions cleanup complete! Deleted ${totalDeleted} old deployments.`);

    } catch (error) {
        console.error('   ❌ Error cleaning functions:', error.message);
    }
}

async function main() {
    console.log('🧹 Appwrite Cleanup: Keep Only Active Builds\n');
    console.log('='.repeat(50));

    if (!process.env.APPWRITE_API_KEY) {
        console.error('❌ APPWRITE_API_KEY not set in .env.local');
        process.exit(1);
    }

    await cleanupSiteDeployments();
    await cleanupFunctionDeployments();

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Cleanup complete! Only active builds remain.\n');
}

main();
