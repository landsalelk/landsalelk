
import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DB_ID = 'landsalelkdb';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function main() {
    console.log('--- Debug: Seed One Region ---');
    const regionId = 'debug_region_1';
    const data = {
        country_code: 'LK',
        name: 'Debug Region',
        slug: 'debug-region',
        is_active: true
    };

    try {
        console.log(`Creating document ${regionId} in 'regions'...`);
        await databases.createDocument(DB_ID, 'regions', regionId, data);
        console.log('Success: Document created.');
    } catch (e: any) {
        if (e.code === 409) {
            console.log('Document already exists.');
        } else {
            console.error('Create Failed:', e.message);
            return;
        }
    }

    try {
        console.log('Reading back document...');
        const doc = await databases.getDocument(DB_ID, 'regions', regionId);
        console.log('Read Success:', doc.$id, doc.name);
    } catch (e: any) {
        console.error('Read Failed:', e.message);
    }
}
main();
