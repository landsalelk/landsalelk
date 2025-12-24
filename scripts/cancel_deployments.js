/**
 * Emergency: Cancel all pending Appwrite site deployments
 * Run: node scripts/cancel_deployments.js
 */

const { Client, Sites } = require('node-appwrite');

// Load environment variables
require('dotenv').config({ path: '../.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject')
    .setKey(process.env.APPWRITE_API_KEY); // Requires API Key with Sites scope

const sites = new Sites(client);

async function cancelAllDeployments() {
    console.log('🚨 Emergency: Cancelling all pending Appwrite deployments...\n');

    const SITE_ID = 'landsalelksite'; // Your site ID from appwrite.json

    try {
        let cancelled = 0;
        let offset = 0;
        const limit = 25;

        while (true) {
            console.log(`📋 Fetching deployments (offset: ${offset})...`);

            const response = await sites.listDeployments(SITE_ID, [], undefined, limit, offset);

            if (response.deployments.length === 0) {
                console.log('No more deployments to process.');
                break;
            }

            for (const deployment of response.deployments) {
                if (deployment.status === 'processing' || deployment.status === 'building' || deployment.status === 'waiting') {
                    console.log(`   ❌ Cancelling ${deployment.$id} (status: ${deployment.status})...`);
                    try {
                        await sites.deleteDeployment(SITE_ID, deployment.$id);
                        cancelled++;
                        console.log(`      ✅ Cancelled.`);
                    } catch (e) {
                        console.log(`      ⚠️ Could not cancel: ${e.message}`);
                    }
                } else {
                    console.log(`   ⏭️ Skipping ${deployment.$id} (status: ${deployment.status})`);
                }
            }

            offset += limit;

            // Safety limit
            if (offset > 500) {
                console.log('⚠️ Reached safety limit (500 deployments). Stopping.');
                break;
            }
        }

        console.log(`\n✅ Done! Cancelled ${cancelled} deployments.`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n⚠️ Make sure you have set APPWRITE_API_KEY in your .env.local file with Sites scope.');
    }
}

cancelAllDeployments();
