
import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const LISTINGS_COLLECTION_ID = 'listings';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const db = new Databases(client);

async function main() {
    try {
        const result = await db.listDocuments(DATABASE_ID, LISTINGS_COLLECTION_ID, [Query.limit(1)]);
        console.log(`Total Listings in Database: ${result.total}`);
    } catch (e) {
        console.error("Failed to check listings:", e);
    }
}

main();
