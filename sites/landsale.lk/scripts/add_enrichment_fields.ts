import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DB_ID = 'landsalelkdb';

if (!PROJECT_ID || !API_KEY) {
    console.error('Missing config');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function addAttribute(colId: string, key: string, type: 'string' | 'integer' | 'float', size?: number) {
    try {
        if (type === 'string') {
            await databases.createStringAttribute(DB_ID, colId, key, size || 50, false);
        } else if (type === 'integer') {
            await databases.createIntegerAttribute(DB_ID, colId, key, false);
        } else if (type === 'float') {
            await databases.createFloatAttribute(DB_ID, colId, key, false);
        }
        console.log(`✓ Added ${key} (${type}) to ${colId}`);
        return true;
    } catch (e: any) {
        if (e.code === 409) {
            console.log(`- ${key} already exists in ${colId}`);
            return true;
        } else {
            console.log(`✗ Failed to add ${key} to ${colId}: ${e.message}`);
            return false;
        }
    }
}

async function main() {
    console.log('=== Adding Enrichment Fields to Schema ===\n');

    // Regions - add postal_code, latitude, longitude, population, elevation
    console.log('--- Regions Collection ---');
    await addAttribute('regions', 'postal_code', 'string', 10);
    await addAttribute('regions', 'latitude', 'float');
    await addAttribute('regions', 'longitude', 'float');
    await addAttribute('regions', 'population', 'integer');
    await addAttribute('regions', 'elevation', 'integer');

    // Cities - add postal_code, population, elevation, timezone
    console.log('\n--- Cities Collection ---');
    await addAttribute('cities', 'postal_code', 'string', 10);
    await addAttribute('cities', 'population', 'integer');
    await addAttribute('cities', 'elevation', 'integer');
    await addAttribute('cities', 'timezone', 'string', 50);

    // Areas - add postal_code (if needed)
    console.log('\n--- Areas Collection ---');
    await addAttribute('areas', 'postal_code', 'string', 10);

    console.log('\n=== Schema Update Complete ===');
    console.log('Note: Wait 30-60 seconds for Appwrite to process attribute creation before running enrichment.');
}

main().catch(console.error);
