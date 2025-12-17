import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';
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

function createSlug(name: string, id: string): string {
    return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${id}`.substring(0, 100).toLowerCase();
}

function sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9\.\-_]/g, '_').substring(0, 36);
}

async function upsert(colId: string, docId: string, data: any): Promise<boolean> {
    const cleanId = sanitizeId(docId);
    try {
        await databases.createDocument(DB_ID, colId, cleanId, data);
        process.stdout.write('+');
        return true;
    } catch (e: any) {
        if (e.code === 409) {
            try {
                await databases.updateDocument(DB_ID, colId, cleanId, data);
                process.stdout.write('.');
                return true;
            } catch {
                process.stdout.write('!');
                return false;
            }
        } else {
            process.stdout.write('X');
            return false;
        }
    }
}

async function main() {
    console.log('=== Complete Location Seed ===');
    console.log(`Database: ${DB_ID}`);

    // ========== REGIONS (Districts) ==========
    console.log('\n--- Seeding Regions (Districts) ---');
    const regionsPath = path.join(process.cwd(), 'docs/lka_admin_boundaries.geojson/lka_admin2.geojson');
    const regionsData = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
    console.log(`Loaded ${regionsData.features.length} regions`);

    let regionSuccess = 0;
    for (const feature of regionsData.features) {
        const props = feature.properties;
        const id = props.adm2_pcode;
        const name = props.adm2_name;
        if (!id || !name) continue;

        const result = await upsert('regions', id, {
            name: name,
            country_id: 'LK',
            country_code: 'LK',
            slug: createSlug(name, id),
            is_active: true
        });
        if (result) regionSuccess++;
    }
    console.log(`\nRegions: ${regionSuccess} success`);

    // ========== CITIES (DS Divisions) ==========
    console.log('\n--- Seeding Cities (DS Divisions) ---');
    const citiesPath = path.join(process.cwd(), 'docs/lka_admin_boundaries.geojson/lka_admin3.geojson');
    const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
    console.log(`Loaded ${citiesData.features.length} cities`);

    let citySuccess = 0;
    for (const feature of citiesData.features) {
        const props = feature.properties;
        const id = props.adm3_pcode;
        const name = props.adm3_name;
        const parentId = props.adm2_pcode;
        if (!id || !name || !parentId) continue;

        const result = await upsert('cities', id, {
            name: name,
            region_id: sanitizeId(parentId),
            country_id: 'LK',
            slug: createSlug(name, id),
            is_active: true
        });
        if (result) citySuccess++;
    }
    console.log(`\nCities: ${citySuccess} success`);

    // ========== AREAS (GN Divisions) ==========
    console.log('\n--- Seeding Areas (GN Divisions) ---');
    const areasPath = path.join(process.cwd(), 'docs/lka_admin_boundaries.geojson/lka_admin4.geojson');
    console.log('Loading areas (large file)...');
    const areasData = JSON.parse(fs.readFileSync(areasPath, 'utf8'));
    console.log(`Loaded ${areasData.features.length} areas`);

    let areaSuccess = 0, count = 0;
    const total = areasData.features.length;
    for (const feature of areasData.features) {
        const props = feature.properties;
        const id = props.adm4_pcode;
        const name = props.adm4_name;
        const parentId = props.adm3_pcode;
        if (!id || !name || !parentId) continue;

        const result = await upsert('areas', id, {
            name: name,
            city_id: sanitizeId(parentId),
            slug: createSlug(name, id),
            is_active: true
        });
        if (result) areaSuccess++;

        count++;
        if (count % 1000 === 0) {
            console.log(`\nProgress: ${count}/${total}`);
        }
    }
    console.log(`\nAreas: ${areaSuccess} success`);

    // ========== VERIFICATION ==========
    console.log('\n=== Final Counts ===');
    const r = await databases.listDocuments(DB_ID, 'regions', []);
    const c = await databases.listDocuments(DB_ID, 'cities', []);
    const a = await databases.listDocuments(DB_ID, 'areas', []);
    console.log(`Regions: ${r.total}`);
    console.log(`Cities: ${c.total}`);
    console.log(`Areas: ${a.total}`);

    console.log('\n=== DONE ===');
}

main().catch(console.error);
