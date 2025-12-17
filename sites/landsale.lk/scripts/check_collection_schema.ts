
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
    console.log("=== LISTING COLLECTION ATTRIBUTES ===");

    try {
        // Try to list attributes - this requires getCollection which gives us the schema
        const collection = await db.getCollection(DATABASE_ID, LISTINGS_COLLECTION_ID);
        console.log(`Collection: ${collection.name}`);
        console.log("");
        console.log("Attributes:");
        for (const attr of collection.attributes as any[]) {
            console.log(`- ${attr.key} (${attr.type}) ${attr.required ? '[REQUIRED]' : ''}`);
        }
    } catch (e: any) {
        console.error("Failed to get collection:", e.message);
    }
}

main();
