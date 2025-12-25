
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

if (process.env.APPWRITE_API_KEY) {
    console.log("Using API Key from environment.");
    client.setKey(process.env.APPWRITE_API_KEY);
} else {
    console.log("No APPWRITE_API_KEY found in environment.");
}

const databases = new sdk.Databases(client);

async function main() {
    try {
        console.log(`Fetching agent ${agentId}...`);
        const doc = await databases.getDocument(databaseId, collectionId, agentId);

        let perms = doc.$permissions || [];
        console.log('Current Permissions:', perms);

        if (!perms.includes('read("any")')) {
            console.log('Adding read("any") permission...');
            perms.push('read("any")');

            const result = await databases.updateDocument(
                databaseId,
                collectionId,
                agentId,
                {}, // No data update, just permissions if allowed, but updateDocument requires data? No, can be empty or we pass perms separately?
                // Wait, updateDocument doesn't verify permissions argument in 3rd param?
                // In SDK, permissions are passed as a separate argument usually.
                // databases.updateDocument(databaseId, collectionId, documentId, data, permissions)
                perms // Permissions argument
            );
            console.log('Successfully updated permissions!');
            console.log('New Permissions:', result.$permissions);
        } else {
            console.log('Agent already has read("any") permission.');
        }

    } catch (error) {
        console.error('Error updating agent:', error.message);
        console.log('You might need to update this manually in the Appwrite Console.');
    }
}

main();
