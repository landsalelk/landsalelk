import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DB_ID = 'landsalelkdb';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID!)
    .setKey(API_KEY!);

const databases = new Databases(client);

function sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9\.\-_]/g, '_').substring(0, 36);
}

function createSlug(name: string, id: string): string {
    return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${id}`.substring(0, 100).toLowerCase();
}

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   RESUME SEEDING REMAINING AREAS      ║');
    console.log('╚═══════════════════════════════════════╝\n');

    // Get existing area IDs
    console.log('Checking existing areas...');
    const existingIds = new Set<string>();
    let offset = 0;

    while (true) {
        const batch = await databases.listDocuments(DB_ID, 'areas', [
            Query.limit(100),
            Query.offset(offset)
        ]);

        for (const doc of batch.documents) {
            existingIds.add(doc.$id);
        }

        if (batch.documents.length < 100) break;
        offset += 100;
    }

    console.log(`Found ${existingIds.size} existing areas\n`);

    // Load GeoJSON
    const areasPath = path.join(process.cwd(), 'docs/lka_admin_boundaries.geojson/lka_admin4.geojson');
    console.log('Loading GeoJSON...');
    const areasData = JSON.parse(fs.readFileSync(areasPath, 'utf8'));
    console.log(`Loaded ${areasData.features.length} total areas from GeoJSON\n`);

    // Find missing areas
    const missing: any[] = [];
    for (const feature of areasData.features) {
        const props = feature.properties;
        const areaId = sanitizeId(props.adm4_pcode || '');

        if (areaId && !existingIds.has(areaId)) {
            missing.push({
                id: areaId,
                name: props.adm4_name,
                cityId: sanitizeId(props.adm3_pcode || '')
            });
        }
    }

    console.log(`Missing areas to add: ${missing.length}\n`);

    if (missing.length === 0) {
        console.log('✓ All areas already seeded!');
        return;
    }

    // Seed missing areas
    let created = 0, failed = 0;

    for (let i = 0; i < missing.length; i++) {
        const area = missing[i];

        try {
            await databases.createDocument(DB_ID, 'areas', area.id, {
                name: area.name,
                city_id: area.cityId,
                slug: createSlug(area.name, area.id),
                is_active: true
            });

            created++;
            process.stdout.write('+');

            if (created % 100 === 0) {
                console.log(` ${created}/${missing.length}`);
            }
        } catch (e: any) {
            failed++;
            process.stdout.write('X');
        }

        // Small delay to avoid rate limiting
        if (i % 50 === 0) {
            await new Promise(r => setTimeout(r, 100));
        }
    }

    console.log(`\n\n✓ Complete: ${created} created, ${failed} failed`);

    // Final count
    const final = await databases.listDocuments(DB_ID, 'areas', [Query.limit(1)]);
    console.log(`Total areas now: ${final.total}`);
}

main().catch(console.error);
