
const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Collection IDs from env or config defaults
const COLLECTIONS = {
    listings: process.env.NEXT_PUBLIC_APPWRITE_LISTINGS_COLLECTION_ID || 'listings',
    agents: 'agents', // Assuming default ID if not in env
    transactions: process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions',
    agent_leads: 'agent_leads',
    notifications: 'notifications',
    users_extended: process.env.NEXT_PUBLIC_APPWRITE_USERS_EXTENDED_COLLECTION_ID || 'users_extended',
    land_offices: 'land_offices',
    favorites: process.env.NEXT_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID || 'favorites',
    kyc_requests: process.env.NEXT_PUBLIC_APPWRITE_KYC_COLLECTION_ID || 'kyc_requests',
    categories: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID || 'categories',
    cms_pages: process.env.NEXT_PUBLIC_APPWRITE_CMS_PAGES_COLLECTION_ID || 'cms_pages',
    blog_posts: process.env.NEXT_PUBLIC_APPWRITE_BLOG_POSTS_COLLECTION_ID || 'blog_posts',
    faqs: process.env.NEXT_PUBLIC_APPWRITE_FAQS_COLLECTION_ID || 'faqs',
    settings: process.env.NEXT_PUBLIC_APPWRITE_SETTINGS_COLLECTION_ID || 'settings',
    listing_offers: process.env.NEXT_PUBLIC_APPWRITE_LISTING_OFFERS_COLLECTION_ID || 'listing_offers',
    reviews: process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID || 'reviews'
};

const SCHEMAS = {
    listings: [
        { key: 'beds', type: 'integer', required: false, min: 0, max: 100 },
        { key: 'baths', type: 'integer', required: false, min: 0, max: 100 },
        { key: 'size_sqft', type: 'integer', required: false, min: 0 },
        { key: 'perch_size', type: 'double', required: false, min: 0 },
        { key: 'infrastructure_distance', type: 'double', required: false, min: 0 },
        { key: 'service_fee', type: 'double', required: false, min: 0 },
        { key: 'deed_type', type: 'string', size: 100, required: false },
        { key: 'category_id', type: 'string', size: 50, required: false },
        { key: 'listing_type', type: 'string', size: 50, required: false },
        { key: 'approval_nbro', type: 'boolean', required: false, default: false },
        { key: 'approval_coc', type: 'boolean', required: false, default: false },
        { key: 'approval_uda', type: 'boolean', required: false, default: false },
        { key: 'is_foreign_eligible', type: 'boolean', required: false, default: false },
        { key: 'has_payment_plan', type: 'boolean', required: false, default: false },
        { key: 'status', type: 'string', size: 20, required: false, default: 'active' },
        { key: 'verification_code', type: 'string', size: 50, required: false },
        { key: 'user_id', type: 'string', size: 50, required: true },
        { key: 'slug', type: 'string', size: 200, required: true },
        { key: 'currency_code', type: 'string', size: 10, required: false, default: 'LKR' },
        { key: 'contact', type: 'string', size: 500, required: false },
        { key: 'title', type: 'string', size: 200, required: true },
        { key: 'description', type: 'string', size: 5000, required: false },
        { key: 'price', type: 'double', required: true, default: 0 },
        { key: 'location', type: 'string', size: 500, required: false },
        { key: 'images', type: 'string', size: 1000, required: false, array: true }, // Array of URLs
    ],
    agents: [
        { key: 'user_id', type: 'string', size: 50, required: true },
        { key: 'name', type: 'string', size: 100, required: true },
        { key: 'email', type: 'string', size: 100, required: true },
        { key: 'phone', type: 'string', size: 20, required: true },
        { key: 'bio', type: 'string', size: 5000, required: false },
        { key: 'avatar', type: 'string', size: 1000, required: false },
        { key: 'service_areas', type: 'string', size: 100, required: false, array: true },
        { key: 'specializations', type: 'string', size: 100, required: false, array: true },
        { key: 'specialization', type: 'string', size: 100, required: false, array: true }, // Legacy/Alternate
        { key: 'license_number', type: 'string', size: 50, required: false },
        { key: 'social_links', type: 'string', size: 500, required: false, array: true },
        { key: 'is_verified', type: 'boolean', required: false, default: false },
        { key: 'rating', type: 'double', required: false, default: 0 },
        { key: 'listings', type: 'integer', required: false, default: 0 },
        { key: 'points', type: 'integer', required: false, default: 0 },
    ],
    transactions: [
        { key: 'user_id', type: 'string', size: 50, required: true },
        { key: 'amount', type: 'double', required: true },
        { key: 'status', type: 'string', size: 20, required: true },
        { key: 'reference_id', type: 'string', size: 100, required: true },
        { key: 'type', type: 'string', size: 50, required: true },
        { key: 'timestamp', type: 'string', size: 50, required: false },
    ],
    agent_leads: [
        { key: 'agent_id', type: 'string', size: 50, required: true },
        { key: 'status', type: 'string', size: 20, required: true },
        { key: 'notes', type: 'string', size: 5000, required: false },
    ],
    notifications: [
        { key: 'user_id', type: 'string', size: 50, required: true },
        { key: 'type', type: 'string', size: 50, required: true },
        { key: 'title', type: 'string', size: 100, required: true },
        { key: 'message', type: 'string', size: 1000, required: true },
        { key: 'data', type: 'string', size: 5000, required: false },
        { key: 'is_read', type: 'boolean', required: false, default: false },
    ],
    users_extended: [
        { key: 'user_id', type: 'string', size: 50, required: true },
        { key: 'role', type: 'string', size: 20, required: true },
        { key: 'phone', type: 'string', size: 20, required: false },
        { key: 'points', type: 'integer', required: false, default: 0 },
        { key: 'is_verified', type: 'boolean', required: false, default: false },
    ],
    land_offices: [
        { key: 'name', type: 'string', size: 200, required: true },
        { key: 'region_id', type: 'string', size: 50, required: true },
    ],
    favorites: [
        { key: 'user_id', type: 'string', size: 50, required: true },
        { key: 'property_id', type: 'string', size: 50, required: true },
        { key: 'saved_at', type: 'string', size: 50, required: false },
    ],
    kyc_requests: [
        { key: 'user_id', type: 'string', size: 50, required: true },
        { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
        { key: 'nic_front_id', type: 'string', size: 50, required: true },
        { key: 'nic_back_id', type: 'string', size: 50, required: true },
        { key: 'request_type', type: 'string', size: 50, required: false, default: 'verify_identity' },
        { key: 'submitted_at', type: 'string', size: 50, required: true },
        { key: 'reviewed_at', type: 'string', size: 50, required: false },
    ],
    categories: [
        { key: 'name', type: 'string', size: 100, required: true },
        { key: 'slug', type: 'string', size: 100, required: true },
        { key: 'is_active', type: 'boolean', required: false, default: true },
        { key: 'sort_order', type: 'integer', required: false, default: 0 },
        { key: 'parent_id', type: 'string', size: 50, required: false },
    ],
    cms_pages: [
        { key: 'slug', type: 'string', size: 100, required: true },
        { key: 'title', type: 'string', size: 200, required: true },
        { key: 'content', type: 'string', size: 1000000, required: true }, // Large content
        { key: 'meta_title', type: 'string', size: 200, required: false },
        { key: 'meta_description', type: 'string', size: 500, required: false },
    ],
    blog_posts: [
        { key: 'slug', type: 'string', size: 100, required: true },
        { key: 'title', type: 'string', size: 200, required: true },
        { key: 'content', type: 'string', size: 1000000, required: true },
        { key: 'excerpt', type: 'string', size: 500, required: false },
        { key: 'cover_image', type: 'string', size: 1000, required: false },
        { key: 'author_id', type: 'string', size: 50, required: false },
        { key: 'published_at', type: 'string', size: 50, required: false },
    ],
    faqs: [
        { key: 'question', type: 'string', size: 500, required: true },
        { key: 'answer', type: 'string', size: 5000, required: true },
        { key: 'category', type: 'string', size: 50, required: false },
        { key: 'sort_order', type: 'integer', required: false, default: 0 },
    ],
    settings: [
        { key: 'key', type: 'string', size: 100, required: true },
        { key: 'value', type: 'string', size: 5000, required: true },
    ],
    listing_offers: [
        { key: 'listing_id', type: 'string', size: 50, required: true },
        { key: 'user_id', type: 'string', size: 50, required: true },
        { key: 'offer_amount', type: 'double', required: true },
        { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
        { key: 'message', type: 'string', size: 1000, required: false },
    ],
    reviews: [
        { key: 'listing_id', type: 'string', size: 50, required: true },
        { key: 'user_id', type: 'string', size: 50, required: true },
        { key: 'rating', type: 'integer', required: true, min: 1, max: 5 },
        { key: 'comment', type: 'string', size: 1000, required: false },
        { key: 'created_at', type: 'string', size: 50, required: false },
    ]
};

async function createCollectionIfNotExists(collId) {
    try {
        await databases.getCollection(dbId, collId);
        console.log(`✅ Collection exists: ${collId}`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`Creating collection: ${collId}...`);
            await databases.createCollection(dbId, collId, collId);
            console.log(`✅ Created collection: ${collId}`);
        } else {
            console.error(`Error checking collection ${collId}:`, error.message);
        }
    }
}

async function updateSchema() {
    console.log('🚀 Starting Comprehensive Schema Update...');
    console.log(`Database ID: ${dbId}`);

    for (const [collName, collId] of Object.entries(COLLECTIONS)) {
        console.log(`\n📂 Processing Collection: ${collName} (${collId})`);
        
        await createCollectionIfNotExists(collId);

        const attributes = SCHEMAS[collName];
        if (!attributes) {
            console.log(`No schema defined for ${collName}, skipping attributes.`);
            continue;
        }

        for (const attr of attributes) {
            try {
                // console.log(`   Checking attribute: ${attr.key}...`);
                if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(dbId, collId, attr.key, attr.required, attr.min, attr.max, attr.default);
                } else if (attr.type === 'double') {
                    await databases.createFloatAttribute(dbId, collId, attr.key, attr.required, attr.min, attr.max, attr.default);
                } else if (attr.type === 'string') {
                    if (attr.array) {
                         await databases.createStringAttribute(dbId, collId, attr.key, attr.size, attr.required, attr.default, true);
                    } else {
                         await databases.createStringAttribute(dbId, collId, attr.key, attr.size, attr.required, attr.default);
                    }
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(dbId, collId, attr.key, attr.required, attr.default);
                }
                console.log(`   ✅ Created attribute: ${attr.key}`);
                await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit buffer
            } catch (error) {
                if (error.code === 409) {
                    // console.log(`   ℹ️ Attribute ${attr.key} already exists.`);
                } else {
                    console.error(`   ❌ Failed to create ${attr.key}:`, error.message);
                }
            }
        }
    }
    
    console.log('\n🎉 All schemas updated successfully!');
}

updateSchema();
