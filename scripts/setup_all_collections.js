/**
 * Backend Setup Script for Landsale.lk
 * 
 * This script creates all necessary collections in Appwrite.
 * 
 * PREREQUISITES:
 * 1. Install node-appwrite: npm install node-appwrite
 * 2. Set your APPWRITE_API_KEY in .env file
 * 
 * USAGE:
 * node scripts/setup_all_collections.js
 */

const { Client, Databases, Permission, Role } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim();
            }
        });
    }
}
loadEnv();

// Initialize Appwrite
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';

// Collection Definitions
const collections = [
    {
        id: 'messages',
        name: 'Messages',
        permissions: [
            Permission.create(Role.users()),
            Permission.read(Role.users()),
            Permission.update(Role.users()),
        ],
        attributes: [
            { type: 'string', key: 'sender_id', size: 100, required: true },
            { type: 'string', key: 'receiver_id', size: 100, required: true },
            { type: 'string', key: 'content', size: 2000, required: true },
            { type: 'string', key: 'conversation_id', size: 255, required: true },
            { type: 'boolean', key: 'is_read', default: false, required: false },
            { type: 'datetime', key: 'timestamp', required: true },
        ],
        indexes: [
            { key: 'by_conversation', type: 'key', attributes: ['conversation_id'] }
        ]
    },
    {
        id: 'favorites',
        name: 'Favorites',
        permissions: [
            Permission.create(Role.users()),
            Permission.read(Role.users()),
            Permission.delete(Role.users()),
        ],
        attributes: [
            { type: 'string', key: 'user_id', size: 100, required: true },
            { type: 'string', key: 'property_id', size: 100, required: true },
            { type: 'datetime', key: 'saved_at', required: true },
        ],
        indexes: [
            { key: 'by_user', type: 'key', attributes: ['user_id'] }
        ]
    },
    {
        id: 'transactions',
        name: 'Transactions',
        permissions: [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.read(Role.users()),
            Permission.update(Role.team('admins')),
            Permission.delete(Role.team('admins')),
        ],
        attributes: [
            { type: 'string', key: 'user_id', size: 100, required: true },
            { type: 'float', key: 'amount', required: true },
            { type: 'string', key: 'status', size: 50, required: true },
            { type: 'string', key: 'reference_id', size: 100, required: false },
            { type: 'string', key: 'type', size: 50, required: true },
            { type: 'datetime', key: 'timestamp', required: true },
        ],
        indexes: [
            { key: 'by_user', type: 'key', attributes: ['user_id'] },
            { key: 'by_status', type: 'key', attributes: ['status'] }
        ]
    },
    {
        id: 'kyc_requests',
        name: 'KYC Requests',
        permissions: [
            Permission.create(Role.users()),
            Permission.read(Role.users()),
            Permission.read(Role.team('admins')),
            Permission.update(Role.team('admins')),
        ],
        attributes: [
            { type: 'string', key: 'user_id', size: 100, required: true },
            { type: 'string', key: 'document_type', size: 50, required: true },
            { type: 'string', key: 'file_id', size: 100, required: true },
            { type: 'string', key: 'status', size: 50, required: true },
            { type: 'datetime', key: 'submitted_at', required: true },
            { type: 'datetime', key: 'reviewed_at', required: false },
            { type: 'string', key: 'reviewer_notes', size: 500, required: false },
        ],
        indexes: [
            { key: 'by_user', type: 'key', attributes: ['user_id'] },
            { key: 'by_status', type: 'key', attributes: ['status'] }
        ]
    }
];

// Helper to wait for attribute creation
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create a single collection
async function createCollection(collection) {
    console.log(`\n📦 Setting up collection: ${collection.name}...`);

    try {
        // Check if exists
        try {
            await databases.getCollection(DB_ID, collection.id);
            console.log(`   ✓ Collection "${collection.name}" already exists.`);
            return true;
        } catch (e) {
            // Doesn't exist, create it
        }

        // Create collection
        await databases.createCollection(
            DB_ID,
            collection.id,
            collection.name,
            collection.permissions
        );
        console.log(`   ✓ Created collection: ${collection.name}`);

        // Create attributes
        for (const attr of collection.attributes) {
            try {
                switch (attr.type) {
                    case 'string':
                        await databases.createStringAttribute(
                            DB_ID, collection.id, attr.key, attr.size, attr.required, attr.default || null
                        );
                        break;
                    case 'boolean':
                        await databases.createBooleanAttribute(
                            DB_ID, collection.id, attr.key, attr.required, attr.default || false
                        );
                        break;
                    case 'float':
                        await databases.createFloatAttribute(
                            DB_ID, collection.id, attr.key, attr.required
                        );
                        break;
                    case 'datetime':
                        await databases.createDatetimeAttribute(
                            DB_ID, collection.id, attr.key, attr.required
                        );
                        break;
                }
                console.log(`   ✓ Created attribute: ${attr.key}`);
            } catch (e) {
                console.log(`   ⚠ Attribute ${attr.key} may already exist: ${e.message}`);
            }
        }

        // Wait for attributes to be available
        await wait(3000);

        // Create indexes
        if (collection.indexes) {
            for (const idx of collection.indexes) {
                try {
                    await databases.createIndex(
                        DB_ID, collection.id, idx.key, idx.type, idx.attributes
                    );
                    console.log(`   ✓ Created index: ${idx.key}`);
                } catch (e) {
                    console.log(`   ⚠ Index ${idx.key} may already exist: ${e.message}`);
                }
            }
        }

        return true;
    } catch (error) {
        console.error(`   ✗ Error setting up ${collection.name}:`, error.message);
        return false;
    }
}

// Main execution
async function main() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   Landsale.lk Backend Setup                ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(`\nEndpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log(`Project:  ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    console.log(`Database: ${DB_ID}`);

    if (!process.env.APPWRITE_API_KEY) {
        console.error('\n❌ ERROR: APPWRITE_API_KEY is not set in .env file!');
        console.log('\nTo fix this:');
        console.log('1. Go to Appwrite Console > Project Settings > API Keys');
        console.log('2. Create a new API key with Database permissions');
        console.log('3. Add it to your .env file as: APPWRITE_API_KEY=your_key_here');
        return;
    }

    let success = 0;
    let failed = 0;

    for (const collection of collections) {
        const result = await createCollection(collection);
        if (result) success++;
        else failed++;
    }

    console.log('\n╔════════════════════════════════════════════╗');
    console.log(`║ Setup Complete: ${success} succeeded, ${failed} failed`);
    console.log('╚════════════════════════════════════════════╝');
}

main().catch(console.error);
