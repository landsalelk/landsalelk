/**
 * Setup core collections: listings and agents
 */

const { Client, Databases, Permission, Role } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val.length && !process.env[key.trim()]) {
            process.env[key.trim()] = val.join('=').trim();
        }
    });
}

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

const coreCollections = [
    {
        id: 'listings',
        name: 'Listings',
        permissions: [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ],
        attributes: [
            { type: 'string', key: 'title', size: 255, required: true },
            { type: 'string', key: 'description', size: 5000, required: false },
            { type: 'float', key: 'price', required: true },
            { type: 'string', key: 'location', size: 255, required: false },
            { type: 'string', key: 'city', size: 100, required: false },
            { type: 'string', key: 'listing_type', size: 50, required: false },
            { type: 'string', key: 'property_type', size: 50, required: false },
            { type: 'integer', key: 'beds', required: false },
            { type: 'integer', key: 'baths', required: false },
            { type: 'float', key: 'area', required: false },
            { type: 'string', key: 'area_unit', size: 20, required: false },
            { type: 'string', key: 'images', size: 5000, required: false },
            { type: 'string', key: 'user_id', size: 100, required: true },
            { type: 'string', key: 'agent_id', size: 100, required: false },
            { type: 'boolean', key: 'is_premium', required: false },
            { type: 'boolean', key: 'is_verified', required: false },
            { type: 'string', key: 'deed_type', size: 50, required: false },
            { type: 'boolean', key: 'flood_risk', required: false },
            { type: 'string', key: 'status', size: 50, required: false },
            { type: 'boolean', key: 'approval_nbro', required: false },
            { type: 'boolean', key: 'approval_coc', required: false },
            { type: 'boolean', key: 'approval_uda', required: false },
            { type: 'float', key: 'infrastructure_distance', required: false },
            { type: 'boolean', key: 'is_foreign_eligible', required: false },
            { type: 'boolean', key: 'has_payment_plan', required: false },
    },
    {
        id: 'agents',
        name: 'Agents',
        permissions: [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
        ],
        attributes: [
            { type: 'string', key: 'name', size: 255, required: true },
            { type: 'string', key: 'email', size: 255, required: false },
            { type: 'string', key: 'phone', size: 50, required: false },
            { type: 'string', key: 'photo', size: 500, required: false },
            { type: 'string', key: 'bio', size: 1000, required: false },
            { type: 'string', key: 'specialization', size: 255, required: false },
            { type: 'string', key: 'location', size: 255, required: false },
            { type: 'float', key: 'latitude', required: false },
            { type: 'float', key: 'longitude', required: false },
            { type: 'boolean', key: 'is_verified', required: false },
            { type: 'string', key: 'user_id', size: 100, required: false },
        ]
    }
];

async function createCollection(col) {
    console.log(`\n📦 ${col.name}...`);

    try {
        try {
            await databases.getCollection(DB_ID, col.id);
            console.log(`   Already exists`);
            return true;
        } catch (e) {
            if (e.code !== 404) throw e;
        }

        await databases.createCollection(DB_ID, col.id, col.name, col.permissions);
        console.log(`   Created`);

        for (const attr of col.attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DB_ID, col.id, attr.key, attr.size, attr.required);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(DB_ID, col.id, attr.key, attr.required);
                } else if (attr.type === 'float') {
                    await databases.createFloatAttribute(DB_ID, col.id, attr.key, attr.required);
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(DB_ID, col.id, attr.key, attr.required);
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(DB_ID, col.id, attr.key, attr.required);
                }
                console.log(`   + ${attr.key}`);
            } catch (e) {
                console.log(`   ! ${attr.key}: ${e.message?.slice(0, 50)}`);
            }
        }

        return true;
    } catch (error) {
        console.error(`   Error:`, error.message);
        return false;
    }
}

async function main() {
    console.log('Setting up core collections...');

    for (const col of coreCollections) {
        await createCollection(col);
        await wait(1000);
    }

    console.log('\nDone!');
}

main().catch(console.error);
