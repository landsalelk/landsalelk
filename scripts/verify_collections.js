/**
 * Quick verification script to check if collections exist
 */

const { Client, Databases } = require('node-appwrite');
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
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb';

async function verify() {
    console.log('\\n🔍 Verifying Collections...');
    console.log(`Database: ${DB_ID}\\n`);

    const collections = ['messages', 'favorites', 'transactions', 'kyc_requests', 'listings', 'agents'];

    for (const id of collections) {
        try {
            const col = await databases.getCollection(DB_ID, id);
            console.log(`✅ ${col.name} (${col.$id}) - ${col.attributes?.length || 0} attributes`);
        } catch (e) {
            console.log(`❌ ${id} - NOT FOUND`);
        }
    }

    console.log('\n');
}

verify().catch(console.error);
