
const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new sdk.Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb';
const collectionId = 'agents';
const agentId = '694c394000361b00a437';

client
    .setEndpoint(endpoint)
    .setProject(projectId);

const databases = new sdk.Databases(client);

async function main() {
    try {
        console.log(`Fetching agent ${agentId} from DB: ${databaseId}...`);
        const doc = await databases.getDocument(
            databaseId,
            collectionId,
            agentId
        );
        console.log('Success! Agent found:', doc.name);
        console.log('Permissions:', doc.$permissions);
    } catch (error) {
        console.error('Error fetching agent:', error.code, error.message);
        if (error.code === 404) {
            console.log("Document not found. This might be due to permissions if the ID exists.");
        }
    }
}

main();
