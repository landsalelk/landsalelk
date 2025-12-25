const sdk = require('node-appwrite');

console.log('SDK Keys:', Object.keys(sdk));

try {
    const InputFile = require('node-appwrite/file');
    console.log('Found node-appwrite/file');
} catch (e) {
    console.log('node-appwrite/file not found');
}

try {
    const InputFile = require('node-appwrite/dist/inputFile');
    console.log('Found node-appwrite/dist/inputFile');
} catch (e) {
    console.log('node-appwrite/dist/inputFile failed:', e.message);
}

// Check if Storage has any static methods or if we can infer
console.log('Storage prototype:', Object.getOwnPropertyNames(sdk.Storage.prototype));

// Fetch schema
require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject('landsalelkproject')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function inspectCollection() {
    try {
        const col = await databases.getCollection('landsalelkdb', 'blog_posts');
        console.log('Collection Attributes:', JSON.stringify(col.attributes, null, 2));
    } catch (e) {
        console.error('Error fetching collection:', e);
    }
}

inspectCollection();
