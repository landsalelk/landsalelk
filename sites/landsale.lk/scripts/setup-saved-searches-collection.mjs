/**
 * Setup script for saved_searches collection in Appwrite
 * Run this to add missing attributes to the collection
 * 
 * Usage: node scripts/setup-saved-searches-collection.mjs
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

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

const COLLECTION_ID = 'saved_searches';

async function setupSavedSearchesCollection() {
    console.log('🚀 Setting up Saved Searches collection attributes...\n');

    try {
        // Check if collection exists
        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_ID);
            console.log('✅ Collection exists');
        } catch (e) {
            // Create collection if it doesn't exist
            console.log('📝 Creating saved_searches collection...');
            await databases.createCollection(
                DATABASE_ID,
                COLLECTION_ID,
                'Saved Searches',
                [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                true
            );
            console.log('✅ Collection created');
        }

        // Attributes to ensure exist
        const attributes = [
            { name: 'user_id', type: 'string', size: 36, required: true },
            { name: 'name', type: 'string', size: 100, required: true },
            { name: 'search_params', type: 'string', size: 5000, required: true },
            { name: 'frequency', type: 'enum', elements: ['instant', 'daily', 'weekly'], required: false, default: 'daily' },
            { name: 'is_active', type: 'boolean', required: false, default: true },
            { name: 'last_sent_at', type: 'datetime', required: false }
        ];

        console.log('\n📝 Checking/Creating attributes...');

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.name,
                        attr.size,
                        attr.required,
                        attr.default || undefined
                    );
                    console.log(`  ✅ Created string attribute: ${attr.name}`);
                } else if (attr.type === 'enum') {
                    await databases.createEnumAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.name,
                        attr.elements,
                        attr.required,
                        attr.default || undefined
                    );
                    console.log(`  ✅ Created enum attribute: ${attr.name}`);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.name,
                        attr.required,
                        attr.default
                    );
                    console.log(`  ✅ Created boolean attribute: ${attr.name}`);
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.name,
                        attr.required
                    );
                    console.log(`  ✅ Created datetime attribute: ${attr.name}`);
                }
            } catch (e) {
                if (e.message?.includes('already exists')) {
                    console.log(`  ⚠️ Attribute ${attr.name} already exists`);
                } else {
                    console.log(`  ❌ Attribute ${attr.name}: ${e.message}`);
                }
            }
        }

        // Wait for attributes to be ready
        console.log('\n⏳ Waiting for attributes to be ready...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Create index
        console.log('\n📇 Creating index...');
        try {
            await databases.createIndex(
                DATABASE_ID,
                COLLECTION_ID,
                'user_id_idx',
                'key',
                ['user_id'],
                ['asc']
            );
            console.log('  ✅ Created index: user_id_idx');
        } catch (e) {
            if (e.message?.includes('already exists')) {
                console.log('  ⚠️ Index user_id_idx already exists');
            } else {
                console.log(`  ❌ Index error: ${e.message}`);
            }
        }

        console.log('\n🎉 Saved Searches collection setup complete!');

    } catch (error) {
        console.error('❌ Error setting up collection:', error.message);
        process.exit(1);
    }
}

setupSavedSearchesCollection();
