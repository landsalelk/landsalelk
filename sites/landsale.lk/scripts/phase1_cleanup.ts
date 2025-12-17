import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
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

// Unused duplicate collections to delete
const UNUSED_COLLECTIONS = [
    'provinces',
    'districts',
    'ds_divisions',
    'gn_divisions'
];

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   PHASE 1: DELETE UNUSED COLLECTIONS  ║');
    console.log('╚═══════════════════════════════════════╝\n');

    for (const colId of UNUSED_COLLECTIONS) {
        try {
            await databases.deleteCollection(DB_ID, colId);
            console.log(`✅ Deleted: ${colId}`);
        } catch (e: any) {
            if (e.code === 404) {
                console.log(`⏭️  Not found (already deleted): ${colId}`);
            } else {
                console.log(`❌ Failed to delete ${colId}: ${e.message}`);
            }
        }
    }

    console.log('\n✓ Phase 1 Complete: Schema cleaned up');
}

main().catch(console.error);
