// Import ALL listings with images (100 total)
import { Client, Databases, Storage, ID, Query } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import dotenv from 'dotenv';

console.log("=== FULL IMPORT: 100 LISTINGS WITH IMAGES ===\n");
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
    const res = await fetch(url);
    if (!res.ok) throw new Error("Download failed");
    const stream = fs.createWriteStream(dest);
    // @ts-ignore
    await finished(Readable.fromWeb(res.body).pipe(stream));
}

async function uploadImage(filePath: string, fileName: string): Promise<string> {
    const { InputFile } = require('node-appwrite/file');
    const file = InputFile.fromPath(filePath, fileName);
    const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return result.$id;
}

async function main() {
    const tempDir = path.resolve('temp_full_import');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Get category
    console.log("Getting category...");
    const cats = await db.listDocuments(DATABASE_ID, 'categories', [Query.limit(1)]);
    const categoryId = cats.documents[0]?.$id || '';

    // Get valid attributes
    console.log("Getting schema...");
    const col = await db.getCollection(DATABASE_ID, 'listings');
    const validAttrs = (col.attributes as any[]).map(a => a.key);

    // Load data
    console.log("Loading data...");
    const data = JSON.parse(fs.readFileSync('src/data/verified_import_listings.json', 'utf-8'));

    // Skip already imported (first 8)
    const toImport = data.slice(8);
    console.log(`Importing ${toImport.length} new listings...\n`);

    let success = 0;
    let failed = 0;

    for (const [i, item] of toImport.entries()) {
        process.stdout.write(`[${i + 1}/${toImport.length}] ${(item.slug || '').substring(0, 30)}...`);

        // Upload 2 images per listing
        const imageIds: string[] = [];
        for (const [j, url] of (item.images_source || []).slice(0, 2).entries()) {
            try {
                const fileName = `img_${Date.now()}_${i}_${j}.jpg`;
                const localPath = path.join(tempDir, fileName);
                await downloadImage(url, localPath);
                const fileId = await uploadImage(localPath, fileName);
                imageIds.push(fileId);
                fs.unlinkSync(localPath);
            } catch (e) {
                // Skip failed image
            }
        }

        // Build document
        const fields: Record<string, any> = {
            title: item.title,
            description: item.description?.substring(0, 5000),
            price: item.price || 5000000,
            currency_code: 'LKR',
            location: item.location,
            contact: item.contact,
            status: 'active',
            slug: item.slug,
            listing_type: 'sale',
            user_id: 'imported',
            is_premium: false,
            views_count: item.views_count || 0,
            price_negotiable: true,
            images: imageIds,
            category_id: categoryId,
        };

        const doc: Record<string, any> = {};
        for (const [k, v] of Object.entries(fields)) {
            if (validAttrs.includes(k) && v !== undefined) doc[k] = v;
        }

        try {
            await db.createDocument(DATABASE_ID, 'listings', ID.unique(), doc);
            console.log(` ✅ (${imageIds.length} imgs)`);
            success++;
        } catch (e: any) {
            console.log(` ❌ ${e.message?.substring(0, 50)}`);
            failed++;
        }

        // Progress every 10
        if ((i + 1) % 10 === 0) {
            console.log(`\n--- Progress: ${success} success, ${failed} failed ---\n`);
        }
    }

    fs.rmSync(tempDir, { recursive: true, force: true });

    // Final count
    const final = await db.listDocuments(DATABASE_ID, 'listings', [Query.limit(1)]);
    console.log(`\n=== COMPLETE ===`);
    console.log(`Imported: ${success}/${toImport.length}`);
    console.log(`Total in DB: ${final.total}`);
}

main().catch(e => console.log("Error:", e.message));
