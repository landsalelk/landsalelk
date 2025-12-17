import { Client, Databases, Query } from 'node-appwrite';
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

interface PostalData {
    postalCode: string;
    placeName: string;
    province: string;
    district: string;
    latitude: number;
    longitude: number;
}

interface GeoData {
    name: string;
    latitude: number;
    longitude: number;
    population: number;
    elevation: number;
    timezone: string;
}

// Parse postal codes file
function parsePostalCodes(): Map<string, PostalData[]> {
    const filePath = path.join(process.cwd(), 'docs/LK_postcodes/LK.txt');
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n').filter(l => l.trim());

    const byDistrict = new Map<string, PostalData[]>();

    for (const line of lines) {
        const fields = line.split('\t');
        const district = fields[5]?.trim();
        if (!district) continue;

        const postal: PostalData = {
            postalCode: fields[1]?.trim() || '',
            placeName: fields[2]?.trim() || '',
            province: fields[3]?.trim() || '',
            district: district,
            latitude: parseFloat(fields[9]) || 0,
            longitude: parseFloat(fields[10]) || 0
        };

        if (!byDistrict.has(district)) {
            byDistrict.set(district, []);
        }
        byDistrict.get(district)!.push(postal);
    }

    return byDistrict;
}

// Parse full geonames file
function parseGeoNames(): Map<string, GeoData> {
    const filePath = path.join(process.cwd(), 'docs/LK_geonames/LK.txt');
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n').filter(l => l.trim());

    const byName = new Map<string, GeoData>();

    for (const line of lines) {
        const fields = line.split('\t');
        const name = fields[1]?.trim();
        if (!name) continue;

        const geo: GeoData = {
            name: name,
            latitude: parseFloat(fields[4]) || 0,
            longitude: parseFloat(fields[5]) || 0,
            population: parseInt(fields[14]) || 0,
            elevation: parseInt(fields[15]) || 0,
            timezone: fields[17]?.trim() || 'Asia/Colombo'
        };

        byName.set(name.toLowerCase(), geo);
    }

    return byName;
}

// Find best postal code match for a city
function findPostalCode(cityName: string, districtName: string, postalsByDistrict: Map<string, PostalData[]>): string | null {
    const districtPostals = postalsByDistrict.get(districtName);
    if (!districtPostals) return null;

    // Exact match
    const exactMatch = districtPostals.find(p =>
        p.placeName.toLowerCase() === cityName.toLowerCase()
    );
    if (exactMatch) return exactMatch.postalCode;

    // Partial match
    const partialMatch = districtPostals.find(p =>
        p.placeName.toLowerCase().includes(cityName.toLowerCase()) ||
        cityName.toLowerCase().includes(p.placeName.toLowerCase())
    );
    if (partialMatch) return partialMatch.postalCode;

    // Return first postal code for district
    return districtPostals[0]?.postalCode || null;
}

async function main() {
    console.log('=== Location Data Enrichment ===\n');

    console.log('Loading GeoNames data...');
    const postalsByDistrict = parsePostalCodes();
    const geoByName = parseGeoNames();
    console.log(`✓ Loaded ${postalsByDistrict.size} districts with postal codes`);
    console.log(`✓ Loaded ${geoByName.size} geographic places\n`);

    // Enrich Regions (Districts)
    console.log('--- Enriching Regions ---');
    const regions = await databases.listDocuments(DB_ID, 'regions', [
        Query.limit(100)
    ]);

    let regionUpdates = 0;
    for (const region of regions.documents) {
        const regionName = region.name;
        const updates: any = {};

        // Try to find postal code
        const postalCode = findPostalCode(regionName, regionName, postalsByDistrict);
        if (postalCode && !region.postal_code) {
            updates.postal_code = postalCode;
        }

        // Try to find additional geo data
        const geoData = geoByName.get(regionName.toLowerCase());
        if (geoData) {
            if (!region.latitude) updates.latitude = geoData.latitude;
            if (!region.longitude) updates.longitude = geoData.longitude;
            if (!region.population) updates.population = geoData.population;
        }

        // Update if we have new data
        if (Object.keys(updates).length > 0) {
            try {
                await databases.updateDocument(DB_ID, 'regions', region.$id, updates);
                console.log(`✓ Updated ${regionName}: ${Object.keys(updates).join(', ')}`);
                regionUpdates++;
            } catch (e: any) {
                console.log(`✗ Failed ${regionName}: ${e.message}`);
            }
        }
    }

    console.log(`\nRegions: ${regionUpdates} updated\n`);

    // Enrich Cities (DS Divisions)
    console.log('--- Enriching Cities ---');
    const cities = await databases.listDocuments(DB_ID, 'cities', [
        Query.limit(500)
    ]);

    let cityUpdates = 0;
    for (const city of cities.documents) {
        const cityName = city.name;

        // Get parent region to find district
        let districtName = '';
        try {
            const region = await databases.getDocument(DB_ID, 'regions', city.region_id);
            districtName = region.name;
        } catch {
            // Skip if can't find parent
            continue;
        }

        const updates: any = {};

        // Try to find postal code
        const postalCode = findPostalCode(cityName, districtName, postalsByDistrict);
        if (postalCode && !city.postal_code) {
            updates.postal_code = postalCode;
        }

        // Try to find additional geo data
        const geoData = geoByName.get(cityName.toLowerCase());
        if (geoData) {
            if (!city.population) updates.population = geoData.population;
            if (!city.elevation) updates.elevation = geoData.elevation;
        }

        // Update if we have new data
        if (Object.keys(updates).length > 0) {
            try {
                await databases.updateDocument(DB_ID, 'cities', city.$id, updates);
                process.stdout.write('+');
                cityUpdates++;

                if (cityUpdates % 50 === 0) {
                    console.log(` ${cityUpdates} updated`);
                }
            } catch (e: any) {
                process.stdout.write('X');
            }
        }
    }

    console.log(`\n\nCities: ${cityUpdates} updated\n`);

    console.log('=== Enrichment Complete ===');
    console.log(`Total updates: ${regionUpdates + cityUpdates}`);
}

main().catch(console.error);
