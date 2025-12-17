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

async function main() {
    console.log('=== Seed Regions Only (Verbose) ===');
    console.log(`Database: ${DB_ID}`);

    const regionsPath = path.join(process.cwd(), 'docs/lka_admin_boundaries.geojson/lka_admin2.geojson');
    if (!fs.existsSync(regionsPath)) {
        console.error('File not found:', regionsPath);
        process.exit(1);
    }

    const regionsData = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
    console.log(`Loaded ${regionsData.features.length} regions`);

    let success = 0, failed = 0;

    for (let i = 0; i < regionsData.features.length; i++) {
        const feature = regionsData.features[i];
        const props = feature.properties;
        const regionId = props.adm2_pcode;
        const regionName = props.adm2_name;
        const nativeName = props.adm2_name1 || '';

        if (!regionId || !regionName) {
            console.log(`Skip ${i}: missing id or name`);
            continue;
        }

        const data = {
            name: regionName,
            native_name: nativeName,
            iso_code: regionId,
            country_id: 'LK',  // Required field!
            country_code: 'LK',  // Also required!
            slug: createSlug(regionName, regionId),
            is_active: true,
            sort_order: i
        };

        try {
            await databases.createDocument(DB_ID, 'regions', regionId, data);
            console.log(`[${i}] Created: ${regionName} (${regionId})`);
            success++;
        } catch (e: any) {
            if (e.code === 409) {
                try {
                    await databases.updateDocument(DB_ID, 'regions', regionId, data);
                    console.log(`[${i}] Updated: ${regionName} (${regionId})`);
                    success++;
                } catch (ue: any) {
                    console.log(`[${i}] Update failed: ${ue.message}`);
                    failed++;
                }
            } else {
                console.log(`[${i}] Create failed: ${e.message}`);
                failed++;
            }
        }
    }

    console.log(`\n=== Done: ${success} success, ${failed} failed ===`);

    // Verify
    const docs = await databases.listDocuments(DB_ID, 'regions', []);
    console.log(`Regions in DB: ${docs.total}`);
}

main().catch(console.error);
