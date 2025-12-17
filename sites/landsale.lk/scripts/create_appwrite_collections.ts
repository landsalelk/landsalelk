// scripts/create_appwrite_collections.ts

import { Client, Databases, ID } from 'node-appwrite';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const API_KEY = process.env.APPWRITE_API_KEY || '';

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
    console.error('Appwrite env vars missing');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'osclass_landsale_db';

async function createCollection(id: string, name: string, permissions: string[] = []) {
    try {
        await databases.createCollection(
            DATABASE_ID,
            ID.unique(),
            name,
            permissions
        );
        console.log(`Created collection ${name}`);
    } catch (e) {
        console.error(`Error creating ${name}:`, e);
    }
}

async function main() {
    // agents collection
    await createCollection('agents', 'agents');
    // digital purchases collection
    await createCollection('digital_purchases', 'digital_purchases');
    // transactions collection
    await createCollection('transactions', 'transactions');
}

main();
