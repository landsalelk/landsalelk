/**
 * Schema Check Script - Verifies indexes on Appwrite collections
 * Run with: node scripts/check_schema.mjs
 */
import { Client, Databases } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

// Robust Env Loader
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return {};

    let content;
    try {
        content = fs.readFileSync(envPath, 'utf16le');
        if (!content.includes('APPWRITE_API_KEY')) {
            throw new Error('Not UTF-16LE');
        }
    } catch {
        try {
            content = fs.readFileSync(envPath, 'utf8');
        } catch (e) {
            return {};
        }
    }

    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            env[key] = value;
        }
    });
    return env;
}

const env = loadEnv();
const PROJECT_ID = env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;
const ENDPOINT = env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DB_ID = 'landsalelkdb';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function checkCollection(collectionId) {
    try {
        console.log(`\n🔍 Checking Collection: ${collectionId}`);
        const result = await databases.getCollection(DB_ID, collectionId);

        const indexes = result.indexes;
        console.log(`   Found ${indexes.length} indexes.`);
        indexes.forEach(idx => {
            console.log(`   - [${idx.status}] ${idx.key} (${idx.type}) on [${idx.attributes.join(', ')}]`);
        });

        const isReadIdx = indexes.find(i => i.attributes.includes('is_read'));
        if (isReadIdx) {
            console.log(`   ✅ 'is_read' index found: ${isReadIdx.key} (${isReadIdx.status})`);
        } else {
            console.log(`   ❌ 'is_read' index MISSING!`);
        }

    } catch (error) {
        console.error(`   ❌ Error fetching collection ${collectionId}:`, error.message);
    }
}

async function main() {
    console.log('🕵️‍♀️ Verifying Appwrite Schema Indexes...');
    await checkCollection('notifications');
    await checkCollection('messages');
    console.log('\nDone.');
}

main().catch(console.error);
