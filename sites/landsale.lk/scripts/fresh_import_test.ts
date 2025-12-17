// Fresh import with category_id fix
import { Client, Databases, ID, Query } from 'node-appwrite';
import * as fs from 'fs';
import dotenv from 'dotenv';

console.log("STEP 1: Loading environment...");
dotenv.config({ path: '.env.local' });

console.log("STEP 2: Creating Appwrite client...");
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const db = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function main() {
    console.log("STEP 3: Getting category ID...");
    let categoryId = '';
    try {
        const cats = await db.listDocuments(DATABASE_ID, 'categories', [Query.limit(1)]);
        if (cats.documents.length > 0) {
            categoryId = cats.documents[0].$id;
            console.log("Found category:", categoryId);
        }
    } catch (e: any) {
        console.log("No categories, will use empty");
    }

    console.log("STEP 4: Getting collection schema...");
    const col = await db.getCollection(DATABASE_ID, 'listings');
    const validAttrs = (col.attributes as any[]).map(a => a.key);
    console.log("Valid attributes:", validAttrs.join(', '));

    console.log("STEP 5: Reading data...");
    const data = JSON.parse(fs.readFileSync('src/data/verified_import_listings.json', 'utf-8'));
    const item = data[0];

    console.log("STEP 6: Building document...");
    const doc: Record<string, any> = {};
    const fields: Record<string, any> = {
        title: item.title,
        description: item.description?.substring(0, 2000) || '{"en":"Test"}',
        price: item.price || 5000000,
        currency_code: 'LKR',
        location: item.location || '{"country":"Sri Lanka"}',
        contact: item.contact || '{"name":"Test"}',
        status: 'active',
        slug: item.slug || 'test-listing-1',
        listing_type: 'sale',
        user_id: 'imported',
        is_premium: false,
        views_count: 0,
        price_negotiable: true,
        images: [],
        category_id: categoryId,
    };

    for (const [k, v] of Object.entries(fields)) {
        if (validAttrs.includes(k)) doc[k] = v;
    }
    console.log("Document fields:", Object.keys(doc).join(', '));

    console.log("STEP 7: Creating in Appwrite...");
    const result = await db.createDocument(DATABASE_ID, 'listings', ID.unique(), doc);
    console.log("SUCCESS! Doc ID:", result.$id);
}

main().catch(e => console.log("FAILED:", e.message));
