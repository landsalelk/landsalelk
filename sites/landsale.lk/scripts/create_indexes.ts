import { Client, Databases, IndexType } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DB_ID = 'landsalelkdb';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID!)
    .setKey(API_KEY!);

const databases = new Databases(client);

interface IndexDef {
    collection: string;
    key: string;
    type: IndexType;
    attributes: string[];
}

// Define all indexes needed for optimal performance
const INDEXES: IndexDef[] = [
    // Listings indexes - Most important for search
    { collection: 'listings', key: 'slug_idx', type: IndexType.Unique, attributes: ['slug'] },
    { collection: 'listings', key: 'status_idx', type: IndexType.Key, attributes: ['status'] },
    { collection: 'listings', key: 'user_id_idx', type: IndexType.Key, attributes: ['user_id'] },
    { collection: 'listings', key: 'category_id_idx', type: IndexType.Key, attributes: ['category_id'] },
    { collection: 'listings', key: 'listing_type_idx', type: IndexType.Key, attributes: ['listing_type'] },
    { collection: 'listings', key: 'price_idx', type: IndexType.Key, attributes: ['price'] },
    { collection: 'listings', key: 'is_premium_idx', type: IndexType.Key, attributes: ['is_premium'] },

    // Categories
    { collection: 'categories', key: 'slug_idx', type: IndexType.Unique, attributes: ['slug'] },
    { collection: 'categories', key: 'is_active_idx', type: IndexType.Key, attributes: ['is_active'] },

    // Regions
    { collection: 'regions', key: 'slug_idx', type: IndexType.Unique, attributes: ['slug'] },
    { collection: 'regions', key: 'country_code_idx', type: IndexType.Key, attributes: ['country_code'] },
    { collection: 'regions', key: 'is_active_idx', type: IndexType.Key, attributes: ['is_active'] },

    // Cities
    { collection: 'cities', key: 'slug_idx', type: IndexType.Unique, attributes: ['slug'] },
    { collection: 'cities', key: 'region_id_idx', type: IndexType.Key, attributes: ['region_id'] },
    { collection: 'cities', key: 'is_active_idx', type: IndexType.Key, attributes: ['is_active'] },

    // Areas
    { collection: 'areas', key: 'slug_idx', type: IndexType.Unique, attributes: ['slug'] },
    { collection: 'areas', key: 'city_id_idx', type: IndexType.Key, attributes: ['city_id'] },
    { collection: 'areas', key: 'is_active_idx', type: IndexType.Key, attributes: ['is_active'] },

    // Favorites
    { collection: 'favorites', key: 'user_id_idx', type: IndexType.Key, attributes: ['user_id'] },
    { collection: 'favorites', key: 'listing_id_idx', type: IndexType.Key, attributes: ['listing_id'] },

    // Reviews
    { collection: 'reviews', key: 'listing_id_idx', type: IndexType.Key, attributes: ['listing_id'] },
    { collection: 'reviews', key: 'user_id_idx', type: IndexType.Key, attributes: ['user_id'] },

    // Saved Searches
    { collection: 'saved_searches', key: 'user_id_idx', type: IndexType.Key, attributes: ['user_id'] },

    // FAQs
    { collection: 'faqs', key: 'category_idx', type: IndexType.Key, attributes: ['category'] },
    { collection: 'faqs', key: 'is_active_idx', type: IndexType.Key, attributes: ['is_active'] },

    // CMS Pages
    { collection: 'cms_pages', key: 'slug_idx', type: IndexType.Unique, attributes: ['slug'] },

    // Settings
    { collection: 'settings', key: 'key_idx', type: IndexType.Unique, attributes: ['key'] },

    // Blog Posts
    { collection: 'blog_posts', key: 'slug_idx', type: IndexType.Unique, attributes: ['slug'] },
    { collection: 'blog_posts', key: 'status_idx', type: IndexType.Key, attributes: ['status'] },

    // Notifications
    { collection: 'notifications', key: 'user_id_idx', type: IndexType.Key, attributes: ['user_id'] },

    // Digital Purchases
    { collection: 'digital_purchases', key: 'user_id_idx', type: IndexType.Key, attributes: ['user_id'] },
    { collection: 'digital_purchases', key: 'property_id_idx', type: IndexType.Key, attributes: ['property_id'] },
];

async function createIndex(def: IndexDef): Promise<boolean> {
    try {
        await databases.createIndex(DB_ID, def.collection, def.key, def.type, def.attributes);
        console.log(`✅ Created: ${def.collection}.${def.key}`);
        return true;
    } catch (e: any) {
        if (e.code === 409) {
            console.log(`⏭️  Exists: ${def.collection}.${def.key}`);
            return true;
        } else if (e.code === 404) {
            console.log(`⚠️  Collection not found: ${def.collection}`);
            return false;
        } else {
            console.log(`❌ Failed: ${def.collection}.${def.key} - ${e.message}`);
            return false;
        }
    }
}

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   CREATE DATABASE INDEXES             ║');
    console.log('╚═══════════════════════════════════════╝\n');

    let created = 0, existed = 0, failed = 0;

    for (const def of INDEXES) {
        const result = await createIndex(def);
        if (result) {
            created++;
        } else {
            failed++;
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n═══════════════════════════════════════');
    console.log(`Total: ${INDEXES.length}`);
    console.log(`✅ Success: ${created}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('═══════════════════════════════════════\n');

    console.log('💡 Note: Indexes are created asynchronously by Appwrite.');
    console.log('   Check console status in 1-2 minutes.');
}

main().catch(console.error);
