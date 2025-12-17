
import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';

if (!PROJECT_ID || !API_KEY) {
    console.error('Error: APPWRITE_PROJECT_ID and APPWRITE_API_KEY are required.');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function main() {
    console.log('--- Appwrite Database Diagnostic ---');
    console.log(`Endpoint: ${ENDPOINT}`);
    console.log(`Project ID: ${PROJECT_ID}`);

    try {
        const dbs = await databases.list();
        console.log(`\nFound ${dbs.total} databases:`);
        dbs.databases.forEach(db => console.log(` - [${db.$id}] ${db.name}`));

        const targetDbId = 'osclass_landsale_db';
        const targetDb = dbs.databases.find(db => db.$id === targetDbId);

        if (targetDb) {
            console.log(`\nChecking collections in '${targetDbId}'...`);
            const collections = await databases.listCollections(targetDbId);
            console.log(`Found ${collections.total} collections:`);
            collections.collections.forEach(col => console.log(` - [${col.$id}] ${col.name}`));
        } else {
            console.error(`\n[ERROR] Target database '${targetDbId}' NOT FOUND.`);
        }

    } catch (error: any) {
        console.error('Error fetching databases:', error.message);
    }
}

main();
