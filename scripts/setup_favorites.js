const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';
const COLLECTION_FAVORITES = 'favorites';

async function setupFavorites() {
    try {
        console.log('Checking Favorites Collection...');
        try {
            await databases.getCollection(DB_ID, COLLECTION_FAVORITES);
            console.log('Favorites collection already exists.');
        } catch (error) {
            console.log('Creating Favorites collection...');
            await databases.createCollection(
                DB_ID,
                COLLECTION_FAVORITES,
                'Favorites',
                [
                    Permission.create(Role.users()),
                    Permission.read(Role.users()),
                    Permission.delete(Role.users()),
                ]
            );

            console.log('Creating Attributes...');
            await databases.createStringAttribute(DB_ID, COLLECTION_FAVORITES, 'user_id', 100, true);
            await databases.createStringAttribute(DB_ID, COLLECTION_FAVORITES, 'property_id', 100, true);
            await databases.createDatetimeAttribute(DB_ID, COLLECTION_FAVORITES, 'saved_at', true);

            // Wait for attributes
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Creating Index...');
            await databases.createIndex(DB_ID, COLLECTION_FAVORITES, 'by_user', 'key', ['user_id']);

            console.log('Favorites collection setup complete.');
        }
    } catch (error) {
        console.error('Error setting up favorites:', error);
    }
}

setupFavorites();
