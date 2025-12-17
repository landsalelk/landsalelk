/**
 * Complete Backend Setup Script for Landsale.lk
 * Creates Database and all Collections
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
                const cleanKey = key.trim();
                const cleanValue = valueParts.join('=').trim();
                if (!process.env[cleanKey]) {
                    process.env[cleanKey] = cleanValue;
                }
            }
        });
    }
}
loadEnv();

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb';

console.log('╔════════════════════════════════════════════╗');
console.log('║   Landsale.lk Complete Backend Setup       ║');
console.log('╚════════════════════════════════════════════╝');
console.log(`\nEndpoint: ${ENDPOINT}`);
console.log(`Project:  ${PROJECT_ID}`);
console.log(`Database: ${DB_ID}`);
console.log(`API Key:  ${API_KEY ? '***' + API_KEY.slice(-10) : 'NOT SET'}`);

if (!API_KEY) {
    console.error('\n❌ APPWRITE_API_KEY is required!');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

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
            { type: 'boolean', key: 'is_read', required: false },
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
            Permission.create(Role.users()),
            Permission.read(Role.users()),
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
            { key: 'by_user', type: 'key', attributes: ['user_id'] }
        ]
    },
    {
        id: 'kyc_requests',
        name: 'KYC Requests',
        permissions: [
            Permission.create(Role.users()),
            Permission.read(Role.users()),
        ],
        attributes: [
            { type: 'string', key: 'user_id', size: 100, required: true },
            { type: 'string', key: 'document_type', size: 50, required: true },
            { type: 'string', key: 'file_id', size: 100, required: true },
            { type: 'string', key: 'status', size: 50, required: true },
            { type: 'datetime', key: 'submitted_at', required: true },
        ],
        indexes: [
            { key: 'by_user', type: 'key', attributes: ['user_id'] },
            { key: 'by_status', type: 'key', attributes: ['status'] }
        ]
    }
];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function ensureDatabase() {
    console.log('\n📁 Checking database...');
    try {
        await databases.get(DB_ID);
        console.log(`   ✓ Database "${DB_ID}" exists`);
        return true;
    } catch (e) {
        if (e.code === 404) {
            console.log(`   Creating database "${DB_ID}"...`);
            try {
                await databases.create(DB_ID, 'Landsale.lk');
                console.log(`   ✓ Database created`);
                return true;
            } catch (createErr) {
                console.error(`   ✗ Failed to create database:`, createErr.message);
                return false;
            }
        }
        console.error(`   ✗ Database error:`, e.message);
        return false;
    }
}

async function createCollection(col) {
    console.log(`\n📦 ${col.name}...`);

    try {
        // Check if exists
        try {
            await databases.getCollection(DB_ID, col.id);
            console.log(`   ✓ Already exists`);
            return true;
        } catch (e) {
            if (e.code !== 404) throw e;
        }

        // Create collection
        await databases.createCollection(DB_ID, col.id, col.name, col.permissions);
        console.log(`   ✓ Created`);

        // Create attributes
        for (const attr of col.attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DB_ID, col.id, attr.key, attr.size, attr.required);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(DB_ID, col.id, attr.key, attr.required);
                } else if (attr.type === 'float') {
                    await databases.createFloatAttribute(DB_ID, col.id, attr.key, attr.required);
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(DB_ID, col.id, attr.key, attr.required);
                }
                console.log(`   ✓ Attr: ${attr.key}`);
            } catch (e) {
                console.log(`   ⚠ Attr ${attr.key}: ${e.message}`);
            }
        }

        // Wait for attributes
        await wait(2000);

        // Create indexes
        for (const idx of (col.indexes || [])) {
            try {
                await databases.createIndex(DB_ID, col.id, idx.key, idx.type, idx.attributes);
                console.log(`   ✓ Index: ${idx.key}`);
            } catch (e) {
                console.log(`   ⚠ Index ${idx.key}: ${e.message}`);
            }
        }

        return true;
    } catch (error) {
        console.error(`   ✗ Error:`, error.message);
        return false;
    }
}

async function main() {
    const dbReady = await ensureDatabase();
    if (!dbReady) {
        console.log('\n❌ Cannot proceed without database.');
        return;
    }

    let success = 0;
    for (const col of collections) {
        if (await createCollection(col)) success++;
    }

    console.log('\n════════════════════════════════════════════');
    console.log(`✅ Setup Complete: ${success}/${collections.length} collections ready`);
    console.log('════════════════════════════════════════════\n');
}

main().catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
});
