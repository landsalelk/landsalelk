
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
    console.log('--- Checking Attributes: regions ---');
    try {
        const attrs = await databases.listAttributes(DB_ID, 'regions');
        attrs.attributes.forEach((attr: any) => {
            console.log(`- ${attr.key} (${attr.type}) Required: ${attr.required}`);
        });
    } catch (e: any) {
        console.error("Failed:", e.message);
    }
}
main();
