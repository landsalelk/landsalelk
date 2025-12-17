/**
 * Verify Appwrite data - check saved_searches and notifications collections
 * 
 * Usage: node scripts/verify-collections.mjs
 */

import { Client, Databases } from 'node-appwrite';

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '693962bb002fb1f881bd';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'osclass_landsale_db';

if (!APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY environment variable is required');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function verifyCollections() {
    console.log('📊 Verifying Appwrite Collections...\n');

    // Check saved_searches
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📂 SAVED_SEARCHES Collection');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
        const savedSearches = await databases.listDocuments(DATABASE_ID, 'saved_searches');
        console.log(`✅ Total documents: ${savedSearches.total}`);

        if (savedSearches.documents.length > 0) {
            console.log('\n📄 Documents:');
            savedSearches.documents.forEach((doc, i) => {
                console.log(`  ${i + 1}. ${doc.name}`);
                console.log(`     - user_id: ${doc.user_id}`);
                console.log(`     - frequency: ${doc.frequency}`);
                console.log(`     - is_active: ${doc.is_active}`);
                console.log(`     - search_params: ${doc.search_params?.substring(0, 50)}...`);
                console.log(`     - created: ${doc.$createdAt}`);
            });
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }

    // Check notifications
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔔 NOTIFICATIONS Collection');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
        const notifications = await databases.listDocuments(DATABASE_ID, 'notifications');
        console.log(`✅ Total documents: ${notifications.total}`);

        if (notifications.documents.length > 0) {
            console.log('\n📄 Documents:');
            notifications.documents.forEach((doc, i) => {
                console.log(`  ${i + 1}. ${doc.title}`);
                console.log(`     - type: ${doc.type}`);
                console.log(`     - is_read: ${doc.is_read}`);
                console.log(`     - message: ${doc.message?.substring(0, 50)}...`);
            });
        } else {
            console.log('   (No notifications yet - this is expected)');
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }

    // Check collection attributes
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Collection Schemas');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        const savedSearchColl = await databases.getCollection(DATABASE_ID, 'saved_searches');
        console.log('\n📂 saved_searches attributes:');
        savedSearchColl.attributes.forEach(attr => {
            console.log(`   - ${attr.key}: ${attr.type}${attr.required ? ' (required)' : ''}`);
        });
    } catch (e) {
        console.log(`❌ saved_searches: ${e.message}`);
    }

    try {
        const notifColl = await databases.getCollection(DATABASE_ID, 'notifications');
        console.log('\n🔔 notifications attributes:');
        notifColl.attributes.forEach(attr => {
            console.log(`   - ${attr.key}: ${attr.type}${attr.required ? ' (required)' : ''}`);
        });
    } catch (e) {
        console.log(`❌ notifications: ${e.message}`);
    }

    console.log('\n✅ Verification complete!');
}

verifyCollections();
