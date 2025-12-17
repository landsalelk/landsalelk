// Import 5 listings quickly (no images)
import { Client, Databases, ID, Query } from 'node-appwrite';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const db = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function main() {
    console.log("=== IMPORTING 5 LISTINGS (NO IMAGES) ===\n");

    // Get category
    let categoryId = '';
    const cats = await db.listDocuments(DATABASE_ID, 'categories', [Query.limit(1)]);
    if (cats.documents.length > 0) categoryId = cats.documents[0].$id;
    console.log("Category:", categoryId);

    // Get valid attributes
    const col = await db.getCollection(DATABASE_ID, 'listings');
    const validAttrs = (col.attributes as any[]).map(a => a.key);

    // Load data
    const data = JSON.parse(fs.readFileSync('src/data/verified_import_listings.json', 'utf-8'));
    const listings = data.slice(1, 6); // Skip first (already imported), take next 5

    let success = 0;
    for (const [i, item] of listings.entries()) {
        console.log(`[${i + 1}/5] ${item.slug?.substring(0, 40)}...`);

        const fields: Record<string, any> = {
            title: item.title,
            description: item.description?.substring(0, 2000),
            price: item.price || 5000000,
            currency_code: 'LKR',
            location: item.location,
            contact: item.contact,
            status: 'active',
            slug: item.slug,
            listing_type: 'sale',
            user_id: 'imported',
            is_premium: false,
            views_count: 0,
            price_negotiable: true,
            images: [],
            category_id: categoryId,
        };

        const doc: Record<string, any> = {};
        for (const [k, v] of Object.entries(fields)) {
            if (validAttrs.includes(k) && v !== undefined) doc[k] = v;
        }

        try {
            await db.createDocument(DATABASE_ID, 'listings', ID.unique(), doc);
            console.log("  ✅ Created");
            success++;
        } catch (e: any) {
            console.log("  ❌", e.message?.substring(0, 60));
        }
    }

    console.log(`\nDone: ${success}/5 imported`);

    // Final count
    const final = await db.listDocuments(DATABASE_ID, 'listings', [Query.limit(1)]);
    console.log("Total in database:", final.total);
}

main().catch(e => console.log("Error:", e.message));
