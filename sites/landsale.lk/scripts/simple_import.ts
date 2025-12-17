
import { Client, Databases, Storage, ID, Query } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Configuration
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const LISTINGS_COLLECTION_ID = 'listings';
const BUCKET_ID = 'listing_images';

if (!API_KEY) {
    console.error("APPWRITE_API_KEY is missing");
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const db = new Databases(client);
const storage = new Storage(client);

// Simple listing structure - only fields we know exist
interface SimpleListing {
    title: string;
    description: string;
    price: number;
    currency_code: string;
    location: string;
    contact: string;
    status: string;
    images_source: string[];
    slug: string;
    category_id: string;
}

async function downloadImage(url: string, destPath: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const fileStream = fs.createWriteStream(destPath);
    // @ts-ignore
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

async function uploadImageToAppwrite(filePath: string, fileName: string): Promise<string> {
    const { InputFile } = require('node-appwrite/file');
    const file = InputFile.fromPath(filePath, fileName);
    const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return result.$id;
}

async function getCategoryMap(): Promise<Record<string, string>> {
    const map: Record<string, string> = {};
    try {
        const response = await db.listDocuments(DATABASE_ID, 'categories', [Query.limit(100)]);
        for (const doc of response.documents) {
            const slug = (doc.slug || '').toLowerCase();
            if (slug.includes('land')) map['land'] = doc.$id;
            if (slug.includes('house')) map['houses'] = doc.$id;
            if (slug.includes('commercial') || slug.includes('office')) map['other'] = doc.$id;
        }
    } catch (e) {
        console.log("No categories found, using placeholders");
    }
    return map;
}

async function getCollectionAttributes(): Promise<string[]> {
    try {
        const col = await db.getCollection(DATABASE_ID, LISTINGS_COLLECTION_ID);
        return (col.attributes as any[]).map(a => a.key);
    } catch (e) {
        console.error("Failed to get collection schema");
        return [];
    }
}

async function main() {
    console.log("=== SIMPLE IMPORT (5 listings) ===\n");

    // Get actual collection attributes
    const validAttributes = await getCollectionAttributes();
    console.log("Valid attributes:", validAttributes.slice(0, 10).join(', '), '...');
    console.log("");

    // Load verified data
    const dataPath = path.resolve('src/data/verified_import_listings.json');
    if (!fs.existsSync(dataPath)) {
        console.error("Data file not found");
        return;
    }

    const listings = JSON.parse(fs.readFileSync(dataPath, 'utf-8')).slice(0, 5);
    const categoryMap = await getCategoryMap();

    const tempDir = path.resolve('temp_images');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    let successCount = 0;

    for (const [idx, item] of listings.entries()) {
        console.log(`[${idx + 1}/5] Processing...`);

        // Upload images (max 2 per listing for speed)
        const imageIds: string[] = [];
        for (const url of (item.images_source || []).slice(0, 2)) {
            try {
                const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
                const localPath = path.join(tempDir, filename);
                await downloadImage(url, localPath);
                const fileId = await uploadImageToAppwrite(localPath, filename);
                imageIds.push(fileId);
                fs.unlinkSync(localPath);
            } catch (e) {
                console.log("  Image upload failed, skipping");
            }
        }

        // Build document with ONLY valid attributes
        const doc: Record<string, any> = {};

        // Map our data to whatever attributes exist
        const fieldMap: Record<string, any> = {
            title: item.title,
            description: item.description,
            price: item.price,
            currency_code: item.currency_code,
            location: item.location,
            contact: item.contact,
            status: item.status || 'active',
            slug: item.slug,
            images: imageIds,
            category_id: categoryMap[item.category_id] || categoryMap['land'] || '',
            listing_type: item.listing_type || 'sale',
            user_id: item.user_id || 'imported',
            is_premium: false,
            views_count: item.views_count || 0,
            price_negotiable: true,
        };

        for (const [key, value] of Object.entries(fieldMap)) {
            if (validAttributes.includes(key)) {
                doc[key] = value;
            }
        }

        try {
            await db.createDocument(DATABASE_ID, LISTINGS_COLLECTION_ID, ID.unique(), doc);
            console.log(`  ✅ Created successfully`);
            successCount++;
        } catch (err: any) {
            console.log(`  ❌ Failed: ${err.message?.substring(0, 80)}`);
        }
    }

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log(`\n=== DONE: ${successCount}/5 listings imported ===`);
}

main().catch(console.error);
