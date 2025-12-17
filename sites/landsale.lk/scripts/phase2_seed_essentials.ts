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

async function seedCountry() {
    console.log('--- Seeding Sri Lanka Country ---');

    const countryData = {
        name: 'Sri Lanka',
        native_name: 'ශ්‍රී ලංකා',
        iso_code: 'LK',
        iso3_code: 'LKA',
        phone_code: 94,
        capital: 'Sri Jayawardenepura Kotte',
        currency: 'LKR',
        currency_symbol: 'Rs',
        is_active: true,
        sort_order: 1,
        code: 'LK',
        slug: 'sri-lanka'
    };

    try {
        await databases.createDocument(DB_ID, 'countries', 'LK', countryData);
        console.log('✅ Sri Lanka country created');
    } catch (e: any) {
        if (e.code === 409) {
            await databases.updateDocument(DB_ID, 'countries', 'LK', countryData);
            console.log('✅ Sri Lanka country updated');
        } else {
            console.log(`❌ Failed: ${e.message}`);
        }
    }
}

async function seedCategories() {
    console.log('\n--- Seeding Property Categories ---');

    const categories = [
        { id: 'land-sale', name: 'Land for Sale', description: 'Vacant land and plots for sale', icon: 'terrain', color: '#4CAF50', sort_order: 1, slug: 'land-for-sale' },
        { id: 'house-sale', name: 'House for Sale', description: 'Residential houses and villas', icon: 'home', color: '#2196F3', sort_order: 2, slug: 'house-for-sale' },
        { id: 'apartment-sale', name: 'Apartment for Sale', description: 'Flats and condominiums for sale', icon: 'apartment', color: '#9C27B0', sort_order: 3, slug: 'apartment-for-sale' },
        { id: 'apartment-rent', name: 'Apartment for Rent', description: 'Rental apartments and flats', icon: 'business', color: '#FF9800', sort_order: 4, slug: 'apartment-for-rent' },
        { id: 'house-rent', name: 'House for Rent', description: 'Rental houses and villas', icon: 'cottage', color: '#00BCD4', sort_order: 5, slug: 'house-for-rent' },
        { id: 'commercial', name: 'Commercial Property', description: 'Shops, offices, warehouses', icon: 'store', color: '#795548', sort_order: 6, slug: 'commercial-property' },
        { id: 'land-rent', name: 'Land for Rent', description: 'Land and plots for lease', icon: 'grass', color: '#8BC34A', sort_order: 7, slug: 'land-for-rent' },
        { id: 'agricultural', name: 'Agricultural Land', description: 'Farming and plantation land', icon: 'agriculture', color: '#689F38', sort_order: 8, slug: 'agricultural-land' },
        { id: 'room-rent', name: 'Rooms for Rent', description: 'Single rooms and annexes', icon: 'bed', color: '#E91E63', sort_order: 9, slug: 'rooms-for-rent' },
        { id: 'industrial', name: 'Industrial Property', description: 'Factories and industrial zones', icon: 'factory', color: '#607D8B', sort_order: 10, slug: 'industrial-property' }
    ];

    let created = 0, updated = 0;

    for (const cat of categories) {
        const data = {
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            color: cat.color,
            parent_id: 0,
            sort_order: cat.sort_order,
            is_active: true,
            slug: cat.slug
        };

        try {
            await databases.createDocument(DB_ID, 'categories', cat.id, data);
            created++;
        } catch (e: any) {
            if (e.code === 409) {
                await databases.updateDocument(DB_ID, 'categories', cat.id, data);
                updated++;
            }
        }
    }

    console.log(`✅ Categories: ${created} created, ${updated} updated`);
}

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   PHASE 2: SEED ESSENTIAL DATA        ║');
    console.log('╚═══════════════════════════════════════╝\n');

    await seedCountry();
    await seedCategories();

    console.log('\n✓ Phase 2 Complete: Essential data seeded');
}

main().catch(console.error);
