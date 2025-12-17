import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DB_ID = 'landsalelkdb';

if (!PROJECT_ID || !API_KEY) process.exit(1);

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function dumpSchema() {
    const output: string[] = [];
    const collections = ['countries', 'regions', 'cities', 'areas'];

    for (const colId of collections) {
        output.push(`\n=== ${colId.toUpperCase()} ===`);
        try {
            const attrs = await databases.listAttributes(DB_ID, colId);
            for (const attr of attrs.attributes as any[]) {
                output.push(`${attr.key}: type=${attr.type}, required=${attr.required}, default=${attr.default || 'none'}`);
            }
        } catch (e: any) {
            output.push(`Error: ${e.message}`);
        }
    }

    const result = output.join('\n');
    console.log(result);
    fs.writeFileSync('schema_dump.txt', result, 'utf8');
    console.log('\nSaved to schema_dump.txt');
}

dumpSchema().catch(console.error);
