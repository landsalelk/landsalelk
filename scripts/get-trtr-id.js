
const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new sdk.Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb';
// Correct collection ID from config.js
const collectionId = 'agents';

client
    .setEndpoint(endpoint)
    .setProject(projectId);
// Key is needed if permissions are restrictive, but usually read is public for agents.
// If it fails, I'll ask user for key or try to assume public read.

const databases = new sdk.Databases(client);

async function main() {
    try {
        console.log(`Fetching agents from DB: ${databaseId}, Collection: ${collectionId}`);
        const response = await databases.listDocuments(
            databaseId,
            collectionId,
            [
                sdk.Query.limit(100)
            ]
        );

        const agents = response.documents;
        console.log(`Found ${agents.length} agents.`);

        const trtr = agents.find(a => a.name && (a.name.toLowerCase().includes('trtr') || a.name.toLowerCase().includes('t r t r')));

        if (trtr) {
            console.log('Found agent "trtr":');
            console.log('ID:', trtr.$id);
            console.log('Name:', trtr.name);
            console.log('All Data:', JSON.stringify(trtr, null, 2));
        } else {
            console.log('Agent "trtr" not found. Listing all agents:');
            agents.forEach(a => console.log(`- ${a.name} (${a.$id})`));
        }

    } catch (error) {
        console.error('Error fetching agents:', error);
    }
}

main();
