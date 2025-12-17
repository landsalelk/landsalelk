
import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // Fallback to .env

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';

if (!PROJECT_ID || !API_KEY) {
    console.error('Missing config:', {
        PROJECT_ID: !!PROJECT_ID,
        API_KEY: !!API_KEY
    });
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function main() {
    try {
        console.log("Listing databases...");
        const dbs = await databases.list();
        console.log(`Total DBs: ${dbs.total}`);
        dbs.databases.forEach(db => console.log(`DB: ${db.$id} (${db.name})`));
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}
main();
