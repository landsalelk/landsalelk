import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DB_ID = 'landsalelkdb';

if (!PROJECT_ID || !API_KEY) {
    console.error('Missing config');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function main() {
    console.log('=== REGIONS Schema ===');
    try {
        const attrs = await databases.listAttributes(DB_ID, 'regions');
        console.log(`Total: ${attrs.total}`);
        for (const attr of attrs.attributes as any[]) {
            console.log(`${attr.key}: ${attr.type} | required: ${attr.required} | array: ${attr.array || false} | size: ${attr.size || 'N/A'}`);
        }
    } catch (e: any) {
        console.error(e.message);
    }
}
main();
