const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
// .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb';
const COLLECTION_LISTINGS = 'listings';

async function main() {
    try {
        console.log('Checking indexes... (Skipped for client test)');
        // const indexes = await databases.listIndexes(DB_ID, COLLECTION_LISTINGS);
        // const searchIndex = indexes.indexes.find(i => i.key === 'title_search_index');
        // console.log('Index Status:', searchIndex ? searchIndex.status : 'Not Found');
        
        const searchIndex = { status: 'available' }; // Mock for test

        if (searchIndex && searchIndex.status === 'available') {
            console.log('Testing Search Query...');
            const response = await databases.listDocuments(
                DB_ID,
                COLLECTION_LISTINGS,
                [
                    Query.equal('listing_type', 'sale'),
                    Query.search('title', 'land')
                ]
            );
            console.log(`Query found ${response.total} documents.`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
