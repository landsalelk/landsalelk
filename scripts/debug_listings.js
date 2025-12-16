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
        console.log('Connecting to Appwrite:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
        console.log('Database ID:', DB_ID);

        const response = await databases.listDocuments(DB_ID, COLLECTION_LISTINGS); // Default limit is 25
        console.log(`Found ${response.total} documents.`);

        response.documents.forEach(doc => {
            console.log(`ID: ${doc.$id}`);
            console.log(`Title:`, doc.title);
            console.log(`Location:`, doc.location);
            console.log(`Images:`, doc.images);
            console.log('---');
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
}

main();
