import { Client, Databases, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DB_ID = 'landsalelkdb';

if (!PROJECT_ID || !API_KEY) {
    console.error('Error: APPWRITE_PROJECT_ID and APPWRITE_API_KEY are required.');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

const COLLECTIONS = {
    COUNTRIES: 'countries',
    REGIONS: 'regions',
    CITIES: 'cities',
    AREAS: 'areas',
};

// Helper to sanitize IDs
function sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9\.\-_]/g, '_').substring(0, 36);
}

// Helper to create slug
function createSlug(name: string, id: string): string {
    return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${id}`.substring(0, 100).toLowerCase();
}

// Helper to handle upsert with detailed error logging
async function upsertDocument(collectionId: string, documentId: string, data: any): Promise<boolean> {
    const cleanId = sanitizeId(documentId);
    try {
        await databases.createDocument(DB_ID, collectionId, cleanId, data);
        process.stdout.write('+');
        return true;
    } catch (error: any) {
        if (error.code === 409) {
            try {
                await databases.updateDocument(DB_ID, collectionId, cleanId, data);
                process.stdout.write('.');
                return true;
            } catch (updateError: any) {
                console.error(`\nUpdate ${collectionId}/${cleanId} failed: ${updateError.message}`);
                return false;
            }
        } else {
            // Log full error for first few failures to debug
            console.error(`\nCreate ${collectionId}/${cleanId} failed: ${error.message}`);
            return false;
        }
    }
}

async function main() {
    console.log('Starting Location Seeding (Fixed Schema)...');
    console.log(`Database: ${DB_ID}`);

    let successCount = 0;
    let failCount = 0;

    // 1. Ensure Sri Lanka Country
    // Schema: code, name, slug, is_active (and possibly phone_code, currency_code)
    console.log('\n--- Ensuring Country: Sri Lanka ---');
    const countrySuccess = await upsertDocument(COLLECTIONS.COUNTRIES, 'LK', {
        code: 'LK',
        name: 'Sri Lanka',
        slug: 'sri-lanka',
        is_active: true
    });
    console.log(countrySuccess ? ' OK' : ' FAILED');

    // 2. Process Regions (districts)
    // Schema based on check: name, native_name, iso_code, is_active, sort_order, slug
    console.log('\n--- Processing Regions (Districts) ---');
    const regionsPath = path.join(process.cwd(), 'docs/lka_admin_boundaries.geojson/lka_admin2.geojson');
    if (fs.existsSync(regionsPath)) {
        const regionsData = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
        console.log(`Found ${regionsData.features.length} regions.`);

        let idx = 0;
        for (const feature of regionsData.features) {
            const props = feature.properties;
            const regionId = props.adm2_pcode; // e.g., LK11
            const regionName = props.adm2_name;
            const nativeName = props.adm2_name1 || props.adm2_name2 || ''; // Sinhala/Tamil name

            if (!regionId || !regionName) continue;

            // Match actual schema: name, native_name, iso_code, is_active, sort_order, slug
            const result = await upsertDocument(COLLECTIONS.REGIONS, regionId, {
                name: regionName,
                native_name: nativeName,
                iso_code: regionId, // Using pcode as iso_code
                is_active: true,
                sort_order: idx,
                slug: createSlug(regionName, regionId)
            });
            if (result) successCount++; else failCount++;
            idx++;
        }
        console.log(`\nRegions: ${successCount} success, ${failCount} failed`);
    } else {
        console.error(`File not found: ${regionsPath}`);
    }

    // 3. Process Cities (DS Divisions)
    // Schema likely: region_id, name, slug, is_active (plus latitude, longitude)
    console.log('\n--- Processing Cities (DS Divisions) ---');
    successCount = 0; failCount = 0;
    const citiesPath = path.join(process.cwd(), 'docs/lka_admin_boundaries.geojson/lka_admin3.geojson');
    if (fs.existsSync(citiesPath)) {
        const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
        console.log(`Found ${citiesData.features.length} cities.`);

        for (const feature of citiesData.features) {
            const props = feature.properties;
            const cityId = props.adm3_pcode;
            const cityName = props.adm3_name;
            const parentRegionId = props.adm2_pcode;
            const lat = props.center_lat;
            const lon = props.center_lon;

            if (!cityId || !cityName || !parentRegionId) continue;

            const result = await upsertDocument(COLLECTIONS.CITIES, cityId, {
                region_id: sanitizeId(parentRegionId),
                name: cityName,
                slug: createSlug(cityName, cityId),
                latitude: lat ? parseFloat(lat) : null,
                longitude: lon ? parseFloat(lon) : null,
                is_active: true
            });
            if (result) successCount++; else failCount++;
        }
        console.log(`\nCities: ${successCount} success, ${failCount} failed`);
    }

    // 4. Process Areas (GN Divisions)
    console.log('\n--- Processing Areas (GN Divisions) ---');
    successCount = 0; failCount = 0;
    const areasPath = path.join(process.cwd(), 'docs/lka_admin_boundaries.geojson/lka_admin4.geojson');
    if (fs.existsSync(areasPath)) {
        console.log('Reading Areas file (large, please wait)...');
        try {
            const areasData = JSON.parse(fs.readFileSync(areasPath, 'utf8'));
            const total = areasData.features.length;
            console.log(`Found ${total} areas.`);

            let count = 0;
            for (const feature of areasData.features) {
                const props = feature.properties;
                const areaId = props.adm4_pcode;
                const areaName = props.adm4_name;
                const parentCityId = props.adm3_pcode;

                if (!areaId || !areaName || !parentCityId) continue;

                const result = await upsertDocument(COLLECTIONS.AREAS, areaId, {
                    city_id: sanitizeId(parentCityId),
                    name: areaName,
                    slug: createSlug(areaName, areaId),
                    is_active: true
                });
                if (result) successCount++; else failCount++;

                count++;
                if (count % 500 === 0) {
                    console.log(`\nProgress: ${count}/${total}`);
                }
            }
            console.log(`\nAreas: ${successCount} success, ${failCount} failed`);
        } catch (e: any) {
            console.error(`Error processing Areas: ${e.message}`);
        }
    }

    console.log('\n=== Seeding Complete ===');
}

main().catch(console.error);
