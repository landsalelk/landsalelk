
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
    console.log("=== IMPORT VERIFICATION ===");
    console.log(`Database: ${DATABASE_ID}`);
    console.log(`Collection: ${LISTINGS_COLLECTION_ID}`);
    console.log("");

    try {
        const result = await db.listDocuments(DATABASE_ID, LISTINGS_COLLECTION_ID, [Query.limit(10)]);
        console.log(`✅ Total Listings in Database: ${result.total}`);
        console.log("");

        if (result.total > 0) {
            console.log("--- Sample Listings ---");
            for (const doc of result.documents.slice(0, 5)) {
                let title = doc.title;
                try {
                    title = JSON.parse(doc.title).en.substring(0, 40);
                } catch { }
                console.log(`- ${doc.slug}: ${title}... (Price: ${doc.price} ${doc.currency_code})`);
            }
        }
    } catch (e: any) {
        console.error("❌ Verification failed:", e.message);
    }
}

main();
