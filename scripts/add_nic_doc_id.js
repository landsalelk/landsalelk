/**
 * Script to add missing attributes to Appwrite collections
 * This fixes the "Unknown attribute: nic_doc_id" error
 * 
 * Run: node scripts/add_nic_doc_id.js
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = 'landsalelkdb';
const COLLECTION_ID = 'agents';

async function addMissingAttributes() {
    console.log('🔧 Adding missing attributes to agents collection...\n');

    const attributesToAdd = [
        {
            key: 'nic_doc_id',
            size: 255,
            required: false,
            defaultValue: null,
            description: 'File ID of uploaded NIC document for KYC'
        },
        {
            key: 'license_number',
            size: 100,
            required: false,
            defaultValue: null,
            description: 'Business registration or license number'
        }
    ];

    for (const attr of attributesToAdd) {
        try {
            console.log(`📝 Adding attribute: ${attr.key}...`);

            await databases.createStringAttribute(
                DB_ID,
                COLLECTION_ID,
                attr.key,
                attr.size,
                attr.required,
                attr.defaultValue,
                false // not array
            );

            console.log(`   ✅ ${attr.key} added successfully!`);
        } catch (error) {
            if (error.code === 409 || error.message?.includes('already exists')) {
                console.log(`   ⏭️ ${attr.key} already exists, skipping.`);
            } else {
                console.error(`   ❌ Failed to add ${attr.key}: ${error.message}`);
            }
        }
    }

    console.log('\n✅ Done! Attribute sync complete.');
    console.log('\n💡 Note: It may take a few seconds for Appwrite to process the new attributes.');
}

// Check if API key is set
if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ Error: APPWRITE_API_KEY is not set in .env.local');
    console.log('\nTo fix this:');
    console.log('1. Go to Appwrite Console → Project Settings → API Keys');
    console.log('2. Create a new API key with "databases" scope');
    console.log('3. Add to .env.local: APPWRITE_API_KEY=your_key_here');
    process.exit(1);
}

addMissingAttributes();
