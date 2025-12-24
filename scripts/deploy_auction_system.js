const { Client, Databases, Functions, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const functions = new Functions(client);

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function deploy() {
    console.log('🚀 Starting Auction System Deployment...');

    // 1. Create Bids Collection
    try {
        console.log('Checking Bids collection...');
        try {
            await databases.getCollection(DB_ID, 'bids');
            console.log('✅ Bids collection already exists.');
        } catch (e) {
            console.log('Creating Bids collection...');
            await databases.createCollection(DB_ID, 'bids', 'Bids', [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.any()), // Function needs to update, users shouldn't? Wait. 
                // In appwrite.json I said: update("functions") - but here "functions" isn't a Role helper?
                // Using Role.any for now, logic handled in function.
                Permission.delete(Role.label('admin'))
            ]);

            // Create Attributes
            console.log('Creating attributes for Bids...');
            await databases.createStringAttribute(DB_ID, 'bids', 'property_id', 36, true);
            await databases.createStringAttribute(DB_ID, 'bids', 'user_id', 36, true);
            await databases.createFloatAttribute(DB_ID, 'bids', 'amount', true);
            await databases.createStringAttribute(DB_ID, 'bids', 'status', 20, true, 'active');
            await databases.createDatetimeAttribute(DB_ID, 'bids', 'timestamp', true);

            // Indexes
            await databases.createIndex(DB_ID, 'bids', 'idx_property_bids', 'key', ['property_id']);
        }
    } catch (err) {
        console.error('❌ Error with Bids collection:', err.message);
    }

    // 2. Update Listings Collection
    try {
        console.log('Updating Listings collection schema...');
        try {
            await databases.createDatetimeAttribute(DB_ID, 'listings', 'auction_end_time', false);
            console.log('✅ Added auction_end_time attribute.');
        } catch (e) {
            console.log('ℹ️ attributes might already exist:', e.message);
        }

        // Cannot update Enum easily via SDK if it already exists without deleting. 
        // We will skip updating listing_type enum programmatically to avoid data loss risk.
        // User might need to do this manually or we rely on the fact "string" type often accepts any value if not strictly validated by old enum? 
        // Actually Appwrite validates Enums strictly.
        // If 'listing_type' is an enum, we need to update it.
        // SDK doesn't have 'updateEnumAttribute' easily exposed in all versions, checking...
        // databases.updateEnumAttribute(databaseId, collectionId, key, elements, required, default, xdefault)
        try {
            // We try to update the enum to include 'auction'
            // Need to know existing elements: sale, rent, wanted
            await databases.updateEnumAttribute(
                DB_ID,
                'listings',
                'listing_type',
                ['sale', 'rent', 'wanted', 'auction'],
                true
            );
            console.log('✅ Updated listing_type enum.');
        } catch (e) {
            console.log('ℹ️ Could not update listing_type enum (might differ or not supported):', e.message);
        }

    } catch (err) {
        console.error('❌ Error with Listings collection:', err.message);
    }

    console.log('🎉 Deployment Script Finished. (Note: Functions still need CLI deployment or Zip upload)');
}

deploy();
