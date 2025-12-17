// Import images for existing listings + add more with images
import { Client, Databases, Storage, ID, Query } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import dotenv from 'dotenv';

console.log("STEP 1: Loading...");
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
    console.log("STEP 2: Getting listings without images...");

    const tempDir = path.resolve('temp_img2');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Load verified data
    const data = JSON.parse(fs.readFileSync('src/data/verified_import_listings.json', 'utf-8'));

    // Get existing listings
    const existingListings = await db.listDocuments(DATABASE_ID, 'listings', [Query.limit(100)]);
    console.log("STEP 3: Found", existingListings.total, "listings in DB");

    // Find listings without images
    const needImages = existingListings.documents.filter(d => !d.images || d.images.length === 0);
    console.log("STEP 4:", needImages.length, "listings need images");

    // Process only first 5 to keep it fast
    const toProcess = needImages.slice(0, 5);

    for (const [i, listing] of toProcess.entries()) {
        console.log(`\n[${i + 1}/${toProcess.length}] Updating ${listing.$id}...`);

        // Find matching source data by slug
        const sourceData = data.find((d: any) => listing.slug?.includes(d.slug?.split('-v')[0]));
        if (!sourceData || !sourceData.images_source || sourceData.images_source.length === 0) {
            console.log("  No source images found");
            continue;
        }

        // Upload 2 images
        const imageIds: string[] = [];
        for (const [j, url] of sourceData.images_source.slice(0, 2).entries()) {
            try {
                const fileName = `img_${Date.now()}_${j}.jpg`;
                const localPath = path.join(tempDir, fileName);
                console.log(`  Downloading image ${j + 1}...`);
                await downloadImage(url, localPath);
                console.log(`  Uploading...`);
                const fileId = await uploadImage(localPath, fileName);
                imageIds.push(fileId);
                fs.unlinkSync(localPath);
            } catch (e) {
                console.log(`  Image ${j + 1} failed`);
            }
        }

        if (imageIds.length > 0) {
            await db.updateDocument(DATABASE_ID, 'listings', listing.$id, { images: imageIds });
            console.log(`  ✅ Updated with ${imageIds.length} images`);
        }
    }

    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log("\nDONE");
}

main().catch(e => console.log("Error:", e.message));
