import { Client, Account, Databases, Storage, Functions } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

if (!process.env.APPWRITE_API_KEY) {
    throw new Error('Server not configured: APPWRITE_API_KEY is missing.');
}
client.setKey(process.env.APPWRITE_API_KEY);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

export { client, account, databases, storage, functions };
