
import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DB_ID = 'landsalelkdb';
const DB_NAME = 'LandSale OSClass Migration';

if (!PROJECT_ID || !API_KEY) {
    console.error('Error: APPWRITE_PROJECT_ID and APPWRITE_API_KEY are required.');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function createDatabase() {
    try {
        await databases.get(DB_ID);
        console.log(`Database '${DB_NAME}' (${DB_ID}) already exists.`);
    } catch (error: any) {
        if (error.code === 404) {
            console.log(`Creating database '${DB_NAME}'...`);
            await databases.create(DB_ID, DB_NAME);
            console.log('Database created.');
        } else {
            throw error;
        }
    }
}

async function createCollection(colId: string, colName: string) {
    try {
        await databases.getCollection(DB_ID, colId);
        console.log(`Collection '${colName}' (${colId}) already exists.`);
    } catch (error: any) {
        if (error.code === 404) {
            console.log(`Creating collection '${colName}'...`);
            await databases.createCollection(DB_ID, colId, colName);
            console.log('Collection created.');
        } else {
            throw error;
        }
    }
}

async function createStringAttribute(colId: string, key: string, size: number, required: boolean, xdefault?: string) {
    try {
        await databases.createStringAttribute(DB_ID, colId, key, size, required, xdefault);
        console.log(`Attribute '${key}' created in '${colId}'.`);
    } catch (error: any) {
        if (error.code === 409) {
            // Attribute exists, ignore
        } else {
            console.error(`Error creating attribute '${key}' in '${colId}':`, error.message);
        }
    }
}

async function createBooleanAttribute(colId: string, key: string, required: boolean, xdefault?: boolean) {
    try {
        await databases.createBooleanAttribute(DB_ID, colId, key, required, xdefault);
        console.log(`Attribute '${key}' created in '${colId}'.`);
    } catch (error: any) {
        if (error.code === 409) {
            // Attribute exists
        } else {
            console.error(`Error creating attribute '${key}' in '${colId}':`, error.message);
        }
    }
}


async function main() {
    console.log('--- Setting up Location Schema ---');
    await createDatabase();

    // 1. Countries
    const COL_COUNTRIES = 'countries';
    await createCollection(COL_COUNTRIES, 'Countries');
    await createStringAttribute(COL_COUNTRIES, 'code', 2, true);
    await createStringAttribute(COL_COUNTRIES, 'name', 1000, true);
    await createStringAttribute(COL_COUNTRIES, 'slug', 100, true);
    await createBooleanAttribute(COL_COUNTRIES, 'is_active', true, true);

    // 2. Regions
    const COL_REGIONS = 'regions';
    await createCollection(COL_REGIONS, 'Regions');
    await createStringAttribute(COL_REGIONS, 'country_code', 2, true);
    await createStringAttribute(COL_REGIONS, 'name', 1000, true);
    await createStringAttribute(COL_REGIONS, 'slug', 100, true);
    await createBooleanAttribute(COL_REGIONS, 'is_active', true, true);

    // 3. Cities
    const COL_CITIES = 'cities';
    await createCollection(COL_CITIES, 'Cities');
    await createStringAttribute(COL_CITIES, 'region_id', 36, true);
    await createStringAttribute(COL_CITIES, 'name', 1000, true);
    await createStringAttribute(COL_CITIES, 'slug', 100, true);
    await createBooleanAttribute(COL_CITIES, 'is_active', true, true);

    // 4. Areas
    const COL_AREAS = 'areas';
    await createCollection(COL_AREAS, 'Areas');
    await createStringAttribute(COL_AREAS, 'city_id', 36, true);
    await createStringAttribute(COL_AREAS, 'name', 1000, true);
    await createStringAttribute(COL_AREAS, 'slug', 100, true);
    await createBooleanAttribute(COL_AREAS, 'is_active', true, true);

    console.log('--- Schema Setup Complete ---');
    console.log('Note: Indexes are not created by this script to keep it simple, please add if needed via Console or extend script.');
}

main().catch(console.error);
