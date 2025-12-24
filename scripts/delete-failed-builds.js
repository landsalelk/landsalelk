/**
 * Delete Failed Appwrite Site Builds
 * Removes all failed deployments from Appwrite Sites
 * 
 * Run: node scripts/delete-failed-builds.js
 */

const { Client, Sites } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject')
    .setKey(process.env.APPWRITE_API_KEY);

const sites = new Sites(client);

// Your site ID - update if needed
const SITE_ID = '6941d9280032a28b0536';

async function deleteFailedBuilds() {
    console.log('🗑️  Cleaning up failed Appwrite deployments...\n');

    if (!process.env.APPWRITE_API_KEY) {
        console.error('❌ Error: APPWRITE_API_KEY not set in .env.local');
        console.log('\nTo fix:');
        console.log('1. Go to Appwrite Console → Project Settings → API Keys');
        console.log('2. Create key with "sites" scope');
        console.log('3. Add to .env.local: APPWRITE_API_KEY=your_key');
        process.exit(1);
    }

    let totalDeleted = 0;
    let offset = 0;
    const limit = 25;

    try {
        while (true) {
            console.log(`📋 Fetching deployments (offset: ${offset})...`);

            const response = await sites.listDeployments(SITE_ID);

            if (!response.deployments || response.deployments.length === 0) {
                console.log('   No more deployments to process.');
                break;
            }

            console.log(`   Found ${response.deployments.length} deployments`);

            const failedDeployments = response.deployments.filter(d =>
                d.status === 'failed' || d.status === 'cancelled'
            );

            if (failedDeployments.length === 0) {
                console.log('   No failed deployments in this batch.\n');
                offset += limit;

                // Safety check
                if (offset > 500) {
                    console.log('⚠️ Reached safety limit (500). Stopping.');
                    break;
                }
                continue;
            }

            console.log(`   Found ${failedDeployments.length} failed/cancelled deployments\n`);

            for (const deployment of failedDeployments) {
                console.log(`   🗑️  Deleting ${deployment.$id} (${deployment.status})...`);
                try {
                    await sites.deleteDeployment(SITE_ID, deployment.$id);
                    console.log(`      ✅ Deleted`);
                    totalDeleted++;
                } catch (e) {
                    console.log(`      ⚠️ Could not delete: ${e.message}`);
                }
            }

            console.log('');
            offset += limit;

            // Safety limit
            if (offset > 500) {
                console.log('⚠️ Reached safety limit. Run again to continue.');
                break;
            }
        }

        console.log('='.repeat(50));
        console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} failed deployments.`);

    } catch (error) {
        console.error('❌ Error:', error.message);

        if (error.code === 401) {
            console.log('\n⚠️ API Key lacks permissions. Needs "sites" scope.');
        }
    }
}

deleteFailedBuilds();