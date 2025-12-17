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

async function testCreate(colId: string, docId: string, data: any) {
    console.log(`\n--- Testing ${colId} ---`);
    console.log('Data:', JSON.stringify(data, null, 2));
    try {
        const doc = await databases.createDocument(DB_ID, colId, docId, data);
        console.log(`SUCCESS: Created ${doc.$id}`);
        // Clean up
        await databases.deleteDocument(DB_ID, colId, doc.$id);
        console.log('Cleaned up test document');
        return true;
    } catch (e: any) {
        console.log(`FAILED: ${e.message}`);
        if (e.response) {
            console.log('Details:', JSON.stringify(e.response, null, 2));
        }
        return false;
    }
}

async function main() {
    console.log('=== Minimal Seed Test ===');
    console.log(`Database: ${DB_ID}`);

    // Test Regions with minimal data matching schema check
    await testCreate('regions', 'test_region_1', {
        name: 'Test Region',
        slug: 'test-region-1',
        is_active: true
    });

    // Test Regions with iso_code, native_name, sort_order
    await testCreate('regions', 'test_region_2', {
        name: 'Test Region 2',
        native_name: 'පරීක්ෂණ ප්‍රදේශය',
        iso_code: 'LK99',
        slug: 'test-region-2',
        is_active: true,
        sort_order: 99
    });

    // Test Cities
    await testCreate('cities', 'test_city_1', {
        region_id: 'test_region_1',
        name: 'Test City',
        slug: 'test-city-1',
        is_active: true
    });

    // Test Cities with country_id (if required)
    await testCreate('cities', 'test_city_2', {
        region_id: 'test_region_1',
        country_id: 'LK',
        name: 'Test City 2',
        slug: 'test-city-2',
        is_active: true
    });

    // Test Areas
    await testCreate('areas', 'test_area_1', {
        city_id: 'test_city_1',
        name: 'Test Area',
        slug: 'test-area-1',
        is_active: true
    });

    console.log('\n=== Test Complete ===');
}

main().catch(console.error);
