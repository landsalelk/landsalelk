/**
 * Setup script for notifications collection in Appwrite
 * Run this once to create the collection with proper schema
 * 
 * Usage: node scripts/setup-notifications-collection.mjs
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

const COLLECTION_ID = 'notifications';
const COLLECTION_NAME = 'Notifications';

async function setupNotificationsCollection() {
    console.log('🚀 Setting up Notifications collection...\n');

    try {
        // Check if collection exists
        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_ID);
            console.log('✅ Collection already exists');
            return;
        } catch (e) {
            // Collection doesn't exist, create it
            console.log('📝 Creating notifications collection...');
        }

        // Create collection
        await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            COLLECTION_NAME,
            [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ],
            true // Document security enabled
        );
        console.log('✅ Collection created');

        // Create attributes
        const attributes = [
            { name: 'user_id', type: 'string', size: 36, required: true },
            { name: 'type', type: 'enum', elements: ['inquiry', 'favorite', 'price_drop', 'new_listing', 'message', 'review', 'system', 'saved_search'], required: true },
            { name: 'title', type: 'string', size: 200, required: true },
            { name: 'message', type: 'string', size: 1000, required: true },
            { name: 'link', type: 'string', size: 255, required: false },
            { name: 'is_read', type: 'boolean', required: true, default: false },
            { name: 'metadata', type: 'string', size: 2000, required: false }
        ];

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
                } else if (attr.type === 'enum') {
                    await databases.createEnumAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.name,
                        attr.elements,
                        attr.required
                    );
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.name,
                        attr.required,
                        attr.default
                    );
                }
                console.log(`  ✅ Created attribute: ${attr.name}`);
            } catch (e) {
                console.log(`  ⚠️ Attribute ${attr.name}: ${e.message}`);
            }
        }

        // Wait for attributes to be ready
        console.log('\n⏳ Waiting for attributes to be ready...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Create indexes
        console.log('\n📇 Creating indexes...');

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
            console.log(`  ⚠️ Index user_id_idx: ${e.message}`);
        }

        try {
            await databases.createIndex(
                DATABASE_ID,
                COLLECTION_ID,
                'user_read_idx',
                'key',
                ['user_id', 'is_read'],
                ['asc', 'asc']
            );
            console.log('  ✅ Created index: user_read_idx');
        } catch (e) {
            console.log(`  ⚠️ Index user_read_idx: ${e.message}`);
        }

        console.log('\n🎉 Notifications collection setup complete!');

    } catch (error) {
        console.error('❌ Error setting up collection:', error.message);
        process.exit(1);
    }
}

setupNotificationsCollection();
