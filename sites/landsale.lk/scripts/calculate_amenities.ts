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

interface POI {
    name: string;
    category: string;
    latitude: number;
    longitude: number;
}

interface NearbyAmenities {
    schools_count: number;
    hospitals_count: number;
    banks_count: number;
    places_of_worship_count: number;
    nearest_school?: string;
    nearest_hospital?: string;
    nearest_bank?: string;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Load POIs
function loadPOIs(): Map<string, POI[]> {
    const poisDir = path.join(process.cwd(), 'docs/pois');
    const categories = ['education', 'healthcare', 'commercial', 'religious'];
    const pois = new Map<string, POI[]>();

    for (const category of categories) {
        const filename = `${category}_pois.json`;
        const filePath = path.join(poisDir, filename);

        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            pois.set(category, data);
        }
    }

    return pois;
}

// Calculate nearby amenities for a location
function calculateNearbyAmenities(
    lat: number,
    lng: number,
    pois: Map<string, POI[]>,
    radiusKm: number = 5
): NearbyAmenities {
    const result: NearbyAmenities = {
        schools_count: 0,
        hospitals_count: 0,
        banks_count: 0,
        places_of_worship_count: 0
    };

    // Find nearby schools
    const schools = pois.get('education') || [];
    const nearbySchools = schools.filter(poi =>
        calculateDistance(lat, lng, poi.latitude, poi.longitude) <= radiusKm
    );
    result.schools_count = nearbySchools.length;
    if (nearbySchools.length > 0) {
        result.nearest_school = nearbySchools
            .sort((a, b) =>
                calculateDistance(lat, lng, a.latitude, a.longitude) -
                calculateDistance(lat, lng, b.latitude, b.longitude)
            )[0].name;
    }

    // Find nearby hospitals
    const hospitals = pois.get('healthcare') || [];
    const nearbyHospitals = hospitals.filter(poi =>
        calculateDistance(lat, lng, poi.latitude, poi.longitude) <= radiusKm
    );
    result.hospitals_count = nearbyHospitals.length;
    if (nearbyHospitals.length > 0) {
        result.nearest_hospital = nearbyHospitals
            .sort((a, b) =>
                calculateDistance(lat, lng, a.latitude, a.longitude) -
                calculateDistance(lat, lng, b.latitude, b.longitude)
            )[0].name;
    }

    // Find nearby banks
    const commercial = pois.get('commercial') || [];
    const nearbyBanks = commercial.filter(poi =>
        poi.name.toLowerCase().includes('bank') &&
        calculateDistance(lat, lng, poi.latitude, poi.longitude) <= radiusKm
    );
    result.banks_count = nearbyBanks.length;
    if (nearbyBanks.length > 0) {
        result.nearest_bank = nearbyBanks
            .sort((a, b) =>
                calculateDistance(lat, lng, a.latitude, a.longitude) -
                calculateDistance(lat, lng, b.latitude, b.longitude)
            )[0].name;
    }

    // Find nearby places of worship
    const religious = pois.get('religious') || [];
    const nearbyReligious = religious.filter(poi =>
        calculateDistance(lat, lng, poi.latitude, poi.longitude) <= radiusKm
    );
    result.places_of_worship_count = nearbyReligious.length;

    return result;
}

async function main() {
    console.log('=== Calculating Nearby Amenities ===\n');

    console.log('Loading POIs...');
    const pois = loadPOIs();
    console.log(`Loaded ${pois.size} POI categories\n`);

    // Get cities with coordinates
    console.log('Fetching cities...');
    const cities = await databases.listDocuments(DB_ID, 'cities', [
        Query.limit(500)
    ]);

    console.log(`Processing ${cities.documents.length} cities...\n`);

    let updated = 0;
    let skipped = 0;

    for (const city of cities.documents) {
        // Skip if no coordinates
        if (!city.latitude || !city.longitude) {
            skipped++;
            continue;
        }

        const amenities = calculateNearbyAmenities(
            city.latitude,
            city.longitude,
            pois,
            5 // 5km radius
        );

        // Update city with amenity data
        try {
            await databases.updateDocument(DB_ID, 'cities', city.$id, {
                schools_nearby: amenities.schools_count,
                hospitals_nearby: amenities.hospitals_count,
                banks_nearby: amenities.banks_count,
                places_of_worship_nearby: amenities.places_of_worship_count,
                nearest_school: amenities.nearest_school,
                nearest_hospital: amenities.nearest_hospital
            });

            process.stdout.write('+');
            updated++;

            if (updated % 50 === 0) {
                console.log(` ${updated} updated`);
            }
        } catch (e: any) {
            process.stdout.write('X');
        }
    }

    console.log(`\n\n=== Complete ===`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped (no coordinates): ${skipped}`);
}

main().catch(console.error);
