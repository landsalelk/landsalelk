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

async function addAttribute(colId: string, key: string, type: 'string' | 'integer', size?: number) {
    try {
        if (type === 'string') {
            await databases.createStringAttribute(DB_ID, colId, key, size || 200, false);
        } else {
            await databases.createIntegerAttribute(DB_ID, colId, key, false, 0);
        }
        console.log(`✓ Added ${key} to ${colId}`);
        return true;
    } catch (e: any) {
        if (e.code === 409) {
            console.log(`- ${key} already exists in ${colId}`);
            return true;
        } else {
            console.log(`✗ Failed: ${e.message}`);
            return false;
        }
    }
}

async function main() {
    console.log('=== Adding Amenity Fields ===\n');

    // Add amenity count fields to cities
    console.log('--- Cities Collection ---');
    await addAttribute('cities', 'schools_nearby', 'integer');
    await addAttribute('cities', 'hospitals_nearby', 'integer');
    await addAttribute('cities', 'banks_nearby', 'integer');
    await addAttribute('cities', 'places_of_worship_nearby', 'integer');
    await addAttribute('cities', 'nearest_school', 'string', 200);
    await addAttribute('cities', 'nearest_hospital', 'string', 200);

    console.log('\n✓ Amenity fields added');
    console.log('Wait 30 seconds before running calculate_amenities.ts');
}

main().catch(console.error);
