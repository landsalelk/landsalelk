/**
 * Setup Digital Consent Flow Schema
 * 
 * Updates 'listings' collection and creates 'consent_logs'.
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

async function main() {
    console.log('🤖 Setting up Digital Consent Flow Schema...');

    try {
        // 1. Update listings collection
        console.log('\n📝 Updating "listings" collection...');
        const listingsId = 'listings';

        try {
            await databases.getCollection(DB_ID, listingsId);
        } catch (e) {
            console.error('Listings collection not found!');
            return;
        }

        const listingAttrs = [
            { key: 'owner_phone', type: 'string', size: 20, required: false },
            { key: 'verification_code', type: 'string', size: 255, required: false }, // Hashed
            { key: 'agreed_commission', type: 'float', required: false },
            // agent_id already exists in setup_core.js
            // status already exists in setup_core.js
        ];

        for (const attr of listingAttrs) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DB_ID, listingsId, attr.key, attr.size, attr.required);
                } else if (attr.type === 'float') {
                    await databases.createFloatAttribute(DB_ID, listingsId, attr.key, attr.required);
                }
                console.log(`   + Created attribute: ${attr.key}`);
            } catch (e) {
                console.log(`   ! Attribute ${attr.key} may already exist: ${e.message}`);
            }
        }

        // 2. Create consent_logs collection
        console.log('\n📜 Creating "consent_logs" collection...');
        const consentLogsId = 'consent_logs';

        try {
            await databases.createCollection(DB_ID, consentLogsId, 'Consent Logs', [
                Permission.read(Role.team('admins')),
                Permission.read(Role.label('agent')), // Or specific agents? Better limit to admin for logs.
                // Agents should verify via function, not read raw logs? 
                // User said: "Permission... read(user:[agent_id])...".
                // But logs are for audit. Let's start with Admin only + Creator.
                Permission.read(Role.team('admins')),
                Permission.create(Role.any()), // Function needs to create? Or use API Key.
            ]);
            console.log('   + Created collection: consent_logs');
        } catch (e) {
            console.log(`   ! Collection consent_logs may already exist: ${e.message}`);
        }

        await wait(2000); // Wait for collection to settle

        const logAttrs = [
            { key: 'listing_id', type: 'string', size: 100, required: true },
            { key: 'owner_phone', type: 'string', size: 20, required: true },
            { key: 'verified_at', type: 'datetime', required: true },
            { key: 'method', type: 'string', size: 50, required: true }, // OTP or Link
            { key: 'ip_address', type: 'string', size: 50, required: false },
        ];

        for (const attr of logAttrs) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DB_ID, consentLogsId, attr.key, attr.size, attr.required);
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(DB_ID, consentLogsId, attr.key, attr.required);
                }
                console.log(`   + Created attribute: ${attr.key}`);
            } catch (e) {
                console.log(`   ! Attribute ${attr.key} may already exist: ${e.message}`);
            }
        }

    } catch (e) {
        console.error('Setup failed:', e);
    }
}

main();
