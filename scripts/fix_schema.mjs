/**
 * Schema Fix Script - Adds missing indexes to Appwrite collections
 * Run with: node scripts/fix_schema.mjs
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
        // Try UTF-16LE first (common on Windows PowerShell created files)
        content = fs.readFileSync(envPath, 'utf16le');
        if (!content.includes('APPWRITE_API_KEY')) {
            throw new Error('Not UTF-16LE or key missing');
        }
    } catch {
        // Fallback to UTF-8
        try {
            content = fs.readFileSync(envPath, 'utf8');
        } catch (e) {
            console.error('Failed to read .env.local:', e);
            return {};
        }
    }

    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
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

if (!PROJECT_ID || !API_KEY) {
    console.error('❌ Missing environment variables.');
    console.error('PROJECT_ID found:', !!PROJECT_ID);
    console.error('API_KEY found:', !!API_KEY);
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function createIndexIfNotExists(collectionId, indexKey, attributeKeys, indexType = 'key') {
    try {
        console.log(`⏳ Creating index '${indexKey}' on collection '${collectionId}'...`);
        await databases.createIndex(
            DB_ID,
            collectionId,
            indexKey,
            indexType,
            attributeKeys
        );
        console.log(`✅ Index '${indexKey}' created successfully on '${collectionId}'`);
    } catch (error) {
        if (error.code === 409) {
            console.log(`ℹ️  Index '${indexKey}' already exists on '${collectionId}', skipping.`);
        } else {
            console.error(`❌ Failed to create index '${indexKey}' on '${collectionId}':`, error.message);
        }
    }
}

async function main() {
    console.log('\n🔧 Appwrite Schema Fix Script\n');
    console.log(`📡 Endpoint: ${ENDPOINT}`);
    console.log(`📂 Project: ${PROJECT_ID}`);
    console.log(`🗄️  Database: ${DB_ID}\n`);

    // Fix Notifications collection - add is_read index
    await createIndexIfNotExists('notifications', 'user_is_read_idx', ['user_id', 'is_read']);

    // Fix Messages collection - add is_read index  
    await createIndexIfNotExists('messages', 'is_read_idx', ['is_read']);

    console.log('\n🎉 Schema fix complete!\n');
}

main().catch(console.error);
