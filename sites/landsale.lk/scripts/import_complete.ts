// Complete import: 2 listings with descriptions + images
import { Client, Databases, Storage, ID, Query } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const db = new Databases(client);
const storage = new Storage(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BUCKET_ID = 'listing_images';

async function downloadImage(url: string, dest: string) {
    console.log("    Downloading:", url.substring(0, 50) + "...");
    const res = await fetch(url);
    if (!res.ok) throw new Error("Download failed");
    const stream = fs.createWriteStream(dest);
    // @ts-ignore
    await finished(Readable.fromWeb(res.body).pipe(stream));
}

async function uploadImage(filePath: string, fileName: string): Promise<string> {
    console.log("    Uploading to Appwrite...");
    const { InputFile } = require('node-appwrite/file');
    const file = InputFile.fromPath(filePath, fileName);
    const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return result.$id;
}

async function main() {
    console.log("=== COMPLETE IMPORT (2 LISTINGS WITH IMAGES) ===\n");

    // Setup
    const tempDir = path.resolve('temp_img');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Get category
    const cats = await db.listDocuments(DATABASE_ID, 'categories', [Query.limit(1)]);
    const categoryId = cats.documents[0]?.$id || '';
    console.log("Category ID:", categoryId);

    // Get valid attributes
    const col = await db.getCollection(DATABASE_ID, 'listings');
    const validAttrs = (col.attributes as any[]).map(a => a.key);
    console.log("Valid attrs:", validAttrs.length);

    // Load data - get listings that haven't been imported yet
    const data = JSON.parse(fs.readFileSync('src/data/verified_import_listings.json', 'utf-8'));
    const listings = data.slice(6, 8); // Take 2 new ones

    for (const [i, item] of listings.entries()) {
        console.log(`\n[${i + 1}/2] ${item.slug?.substring(0, 40)}...`);

        // Upload images (max 3)
        const imageIds: string[] = [];
        const imagesToUpload = (item.images_source || []).slice(0, 3);

        for (const [j, url] of imagesToUpload.entries()) {
            try {
                const fileName = `img_${Date.now()}_${j}.jpg`;
                const localPath = path.join(tempDir, fileName);
                await downloadImage(url, localPath);
                const fileId = await uploadImage(localPath, fileName);
                imageIds.push(fileId);
                fs.unlinkSync(localPath);
                console.log(`    ✅ Image ${j + 1} uploaded: ${fileId}`);
            } catch (e: any) {
                console.log(`    ❌ Image ${j + 1} failed:`, e.message?.substring(0, 40));
            }
        }

        // Build document with FULL data
        const fields: Record<string, any> = {
            title: item.title,
            description: item.description, // FULL description
            price: item.price || 10000000,
            currency_code: 'LKR',
            location: item.location,
            contact: item.contact,
            status: 'active',
            slug: item.slug + '-v2', // Avoid duplicate slug
            listing_type: 'sale',
            user_id: 'imported',
            is_premium: false,
            views_count: item.views_count || 0,
            price_negotiable: true,
            images: imageIds, // WITH IMAGES
            category_id: categoryId,
        };

        const doc: Record<string, any> = {};
        for (const [k, v] of Object.entries(fields)) {
            if (validAttrs.includes(k) && v !== undefined) doc[k] = v;
        }

        try {
            const result = await db.createDocument(DATABASE_ID, 'listings', ID.unique(), doc);
            console.log("  ✅ CREATED with", imageIds.length, "images - ID:", result.$id);
        } catch (e: any) {
            console.log("  ❌ FAILED:", e.message?.substring(0, 80));
        }
    }

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Final count
    const final = await db.listDocuments(DATABASE_ID, 'listings', [Query.limit(1)]);
    console.log("\n=== TOTAL LISTINGS IN DB:", final.total, "===");
}

main().catch(e => console.log("Error:", e.message));
