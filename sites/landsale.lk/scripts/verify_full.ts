// Quick verification of imported listings with images
import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const db = new Databases(client);

async function main() {
    const result = await db.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'listings',
        [Query.limit(10), Query.orderDesc('$createdAt')]
    );

    console.log("=== LISTINGS WITH DETAILS ===\n");
    console.log("Total:", result.total);
    console.log("");

    for (const doc of result.documents) {
        let title = doc.title;
        try { title = JSON.parse(doc.title).en?.substring(0, 50); } catch { }

        console.log(`ID: ${doc.$id}`);
        console.log(`  Title: ${title}...`);
        console.log(`  Price: ${doc.price} ${doc.currency_code}`);
        console.log(`  Images: ${(doc.images || []).length}`);
        console.log(`  Description length: ${(doc.description || '').length} chars`);
        console.log("");
    }
}

main();
