
import { Client, Databases, Storage, ID, Query } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// --- Configuration ---

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!; // 'landsalelkdb'
const LISTINGS_COLLECTION_ID = 'listings'; // Replace with actual ID if different
const CATEGORIES_COLLECTION_ID = 'categories';
const BUCKET_ID = 'listing_images'; // Correct bucket ID from config.ts

// --- Types ---

interface VerifiedListing {
    user_id: string;
    category_id: string;
    title: string;
    description: string;
    slug: string;
    listing_type: string;
    status: string;
    price: number;
    currency_code: string;
    price_negotiable: boolean;
    location: string;
    contact: string;
    images_source: string[];
    published_at: string;
    is_premium: boolean;
    views_count: number;
    expires_at: string;
    // New fields
    ip_address?: string;
    auction_enabled?: boolean;
    bid_count?: number;
    attributes?: string;
    features?: string[];
    videos?: string[];
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string[];
}

// --- Setup ---

if (!API_KEY) {
    console.error("APPWRITE_API_KEY is missing from environment variables.");
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const db = new Databases(client);
const storage = new Storage(client);

// --- Helpers ---

async function downloadImage(url: string, destPath: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    const fileStream = fs.createWriteStream(destPath);
    // @ts-ignore
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

async function uploadImageToAppwrite(filePath: string, fileName: string): Promise<string> {
    // Appwrite Node SDK requires a stream or buffer for createBucketFile
    // But verify the signature. storage.createFile(bucketId, fileId, file)
    // In Node SDK 'file' is InputFile.fromPath 
    // We'll import InputFile from node-appwrite
    const { InputFile } = require('node-appwrite/file'); // Standard way for recent SDKs

    // Note: If import fails, we might need a workaround, but InputFile is standard.
    const file = InputFile.fromPath(filePath, fileName);
    const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return result.$id;
}

async function getCategoryMap(): Promise<Record<string, string>> {
    // Fetch all categories from Appwrite
    // We expect our verified JSON to have keys like 'land', 'houses', 'other'.
    // We need to match them to Appwrite Category Names or Slugs.

    const map: Record<string, string> = {};
    let response;
    try {
        response = await db.listDocuments(DATABASE_ID, CATEGORIES_COLLECTION_ID, [Query.limit(100)]);
    } catch (e) {
        console.error("Failed to list categories. Ensure collection ID is correct.", e);
        return {};
    }

    for (const doc of response.documents) {
        // Assuming category doc has 'slug' or 'name'. 
        // Let's try to match loosely.
        const slug = doc.slug?.trim().toLowerCase();
        const name = doc.name?.replace(/"/g, '').replace(/en:/g, '').trim().toLowerCase(); // Clean I18n string if needed

        if (slug === 'land' || name?.includes('land')) map['land'] = doc.$id;
        if (slug === 'house' || slug === 'houses' || name?.includes('house')) map['houses'] = doc.$id;
        if (slug === 'commercial' || name?.includes('commercial')) map['other'] = doc.$id;
        // Add 'office' mapping from found categories
        if (slug === 'commercial' || name?.includes('commercial')) map['office'] = doc.$id;
    }

    // Fallback if not found, maybe create or define later.
    console.log("Category Mapping Resolved:", map);
    return map;
}

async function cleanListings() {
    console.log("Cleaning existing listings...");
    try {
        let count = 0;
        while (true) {
            const list = await db.listDocuments(DATABASE_ID, LISTINGS_COLLECTION_ID, [Query.limit(100)]);
            if (list.total === 0) break;

            const promises = list.documents.map(d => db.deleteDocument(DATABASE_ID, LISTINGS_COLLECTION_ID, d.$id));
            await Promise.all(promises);
            count += list.documents.length;
            console.log(`Deleted ${count} documents...`);
            if (list.documents.length < 100) break;
        }
        console.log("Cleanup complete.");
    } catch (e) {
        console.error("Cleanup failed:", e);
    }
}

// --- Main ---

async function main() {
    const dataPath = path.resolve('src/data/verified_import_listings.json');
    if (!fs.existsSync(dataPath)) {
        console.error("Data file verification failed.");
        return;
    }
    const listings: VerifiedListing[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // 1. Cleanup
    await cleanListings();

    // 2. Resolve Categories
    const categoryMap = await getCategoryMap();

    // 3. Process Listings
    const LIMIT = 5; // User requested limited import
    const listingsToProcess = listings.slice(0, LIMIT);
    console.log(`Starting import of ${listings.length} listings (Limited to ${LIMIT} for this run)...`);

    // Create temp dir for images
    const tempDir = path.resolve('temp_images');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    for (const [itemsProcessed, item] of listingsToProcess.entries()) {
        console.log(`Processing [${itemsProcessed + 1}/${listings.length}]: ${JSON.parse(item.title).en.substring(0, 30)}...`);

        // Resolve Category
        // In verify script we mapped: 49->'land', 43->'houses'. 
        // Item.category_id will be 'land' or 'houses' or 'other'.
        const appwriteCatId = categoryMap[item.category_id] || categoryMap['other'];
        if (!appwriteCatId) {
            console.warn(`Skipping item due to missing category mapping for '${item.category_id}'`);
            continue;
        }

        // Handle Images
        const uploadedImageIds: string[] = [];
        // Limit images to max 3 per listing to save time/bandwidth for this run? User didn't specify, but good practice.
        // Let's do all for completeness, or max 5.
        const imagesToProcess = item.images_source.slice(0, 5);

        for (const url of imagesToProcess) {
            try {
                const urlObj = new URL(url);
                const filename = path.basename(urlObj.pathname) || `img_${Date.now()}.jpg`;
                const localPath = path.join(tempDir, filename);

                await downloadImage(url, localPath);
                const fileId = await uploadImageToAppwrite(localPath, filename);
                uploadedImageIds.push(fileId);

                // Cleanup local file
                fs.unlinkSync(localPath);
            } catch (err) {
                console.error(`Failed to process image ${url}:`, err);
            }
        }

        // Create Document with complete schema
        try {
            await db.createDocument(
                DATABASE_ID,
                LISTINGS_COLLECTION_ID,
                ID.unique(),
                {
                    user_id: item.user_id,
                    category_id: appwriteCatId,
                    title: item.title,
                    description: item.description,
                    slug: item.slug,
                    listing_type: item.listing_type,
                    status: item.status,
                    price: item.price,
                    currency_code: item.currency_code,
                    price_negotiable: item.price_negotiable,
                    location: item.location,
                    contact: item.contact,
                    images: uploadedImageIds,
                    is_premium: item.is_premium,
                    views_count: item.views_count,
                    expires_at: item.expires_at,
                    published_at: item.published_at,
                    // New fields from complete schema
                    ip_address: item.ip_address || '127.0.0.1',
                    auction_enabled: item.auction_enabled || false,
                    bid_count: item.bid_count || 0,
                    attributes: item.attributes || '{}',
                    features: item.features || [],
                    videos: item.videos || [],
                    seo_title: item.seo_title,
                    seo_description: item.seo_description,
                    seo_keywords: item.seo_keywords || [],
                }
            );
            console.log(`✅ Created listing: ${item.slug}`);
        } catch (err) {
            console.error(`❌ Failed to create listing doc:`, err);
        }
    }

    // Cleanup temp dir
    fs.rmdirSync(tempDir, { recursive: true });
    console.log("Import process completed.");
}

main().catch(console.error);
