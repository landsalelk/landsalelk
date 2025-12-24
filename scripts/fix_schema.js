/**
 * Fix Schema Script
 * Adds missing attributes to Appwrite collections
 * 
 * Run: node scripts/fix_schema.js
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = 'landsalelkdb';

// Attributes to add (found by schema_audit.js)
const attributesToFix = [
    {
        collection: 'messages',
        attribute: 'created_at',
        type: 'datetime',
        required: false
    }
];

async function fixSchema() {
    console.log('🔧 Fixing Schema Mismatches\n');

    if (!process.env.APPWRITE_API_KEY) {
        console.error('❌ Error: APPWRITE_API_KEY is not set in .env.local');
        process.exit(1);
    }

    let fixed = 0;
    let skipped = 0;
    let failed = 0;

    for (const attr of attributesToFix) {
        console.log(`📝 Adding ${attr.collection}.${attr.attribute}...`);

        try {
            if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DB_ID,
                    attr.collection,
                    attr.attribute,
                    attr.required,
                    null, // default
                    false // array
                );
            } else if (attr.type === 'string') {
                await databases.createStringAttribute(
                    DB_ID,
                    attr.collection,
                    attr.attribute,
                    attr.size || 255,
                    attr.required,
                    null, // default
                    false // array
                );
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DB_ID,
                    attr.collection,
                    attr.attribute,
                    attr.required,
                    attr.min || 0,
                    attr.max || 9223372036854775807,
                    null // default
                );
            } else if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DB_ID,
                    attr.collection,
                    attr.attribute,
                    attr.required,
                    attr.default || false
                );
            }

            console.log(`   ✅ Added ${attr.attribute}`);
            fixed++;
        } catch (error) {
            if (error.code === 409 || error.message?.includes('already exists')) {
                console.log(`   ⏭️ Already exists, skipping`);
                skipped++;
            } else {
                console.error(`   ❌ Failed: ${error.message}`);
                failed++;
            }
        }
    }

    console.log('\n' + '='.repeat(40));
    console.log('SUMMARY:');
    console.log(`   ✅ Fixed: ${fixed}`);
    console.log(`   ⏭️ Skipped: ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);

    if (failed === 0) {
        console.log('\n🎉 All schema issues resolved!');
    }
}

fixSchema();
