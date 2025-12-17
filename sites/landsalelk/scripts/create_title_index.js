const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb';
const COLLECTION_LISTINGS = 'listings';

async function main() {
    try {
        console.log('Creating fulltext index on title...');

        // key, type, attributes, orders
        const response = await databases.createIndex(
            DB_ID,
            COLLECTION_LISTINGS,
            'title_search_index',
            'fulltext',
            ['title'],
            ['asc'] // order is ignored for fulltext but required argument in some SDKs? or optional. 
            // Checking SDK sig: createIndex(databaseId, collectionId, key, type, attributes, orders)
        );
        console.log('Index created:', response);
    } catch (error) {
        console.error('Error creating index:', error);
    }
}

main();
