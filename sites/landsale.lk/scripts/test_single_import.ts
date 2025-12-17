
// Ultra-minimal: Import 1 listing, no images, to test schema
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
    console.log("=== SINGLE LISTING TEST (NO IMAGES) ===\n");

    // 1. Get valid attributes
    const col = await db.getCollection(DATABASE_ID, 'listings');
    const validAttrs = (col.attributes as any[]).map(a => a.key);
    console.log("Valid attrs:", validAttrs.join(', '));

    // 2. Get one category ID
    let categoryId = '';
    try {
        const cats = await db.listDocuments(DATABASE_ID, 'categories', [Query.limit(1)]);
        if (cats.documents.length > 0) categoryId = cats.documents[0].$id;
    } catch { }
    console.log("Category ID:", categoryId || 'none');

    // 3. Load first listing from verified data
    const listings = JSON.parse(fs.readFileSync('src/data/verified_import_listings.json', 'utf-8'));
    const item = listings[0];

    // 4. Build document with ONLY valid attributes
    const doc: Record<string, any> = {};
    const fieldMap: Record<string, any> = {
        title: item.title,
        description: item.description,
        price: item.price || 1000000,
        currency_code: 'LKR',
        location: item.location,
        contact: item.contact,
        status: 'active',
        slug: item.slug,
        listing_type: 'sale',
        user_id: 'imported_listing',
        is_premium: false,
        views_count: 0,
        price_negotiable: true,
        category_id: categoryId,
        images: [],
    };

    for (const [key, val] of Object.entries(fieldMap)) {
        if (validAttrs.includes(key)) doc[key] = val;
    }

    console.log("\nDocument fields:", Object.keys(doc).join(', '));

    // 5. Create
    try {
        const result = await db.createDocument(DATABASE_ID, 'listings', ID.unique(), doc);
        console.log("\n✅ SUCCESS! Doc ID:", result.$id);
    } catch (err: any) {
        console.log("\n❌ FAILED:", err.message);
    }
}

main();
