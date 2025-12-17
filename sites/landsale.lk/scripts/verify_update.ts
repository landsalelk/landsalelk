
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
    console.log('--- Verifying Database Counts ---');
    try {
        const regions = await databases.listDocuments(DB_ID, 'regions', []);
        console.log(`Regions: ${regions.total} (Expected ~25)`);

        const cities = await databases.listDocuments(DB_ID, 'cities', []);
        console.log(`Cities: ${cities.total} (Expected ~330+)`);

        const areas = await databases.listDocuments(DB_ID, 'areas', []);
        console.log(`Areas: ${areas.total} (Expected ~14,000+)`);
    } catch (e: any) {
        console.error("Verification failed:", e.message);
    }
}
main();
