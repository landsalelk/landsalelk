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

interface Feature {
    properties: any;
    geometry: { coordinates: number[][][] };
}

// Extract centroid from polygon coordinates
function getCentroid(coordinates: number[][][]): { lat: number; lng: number } {
    let totalLat = 0, totalLng = 0, count = 0;

    for (const ring of coordinates) {
        for (const point of ring) {
            totalLng += point[0];
            totalLat += point[1];
            count++;
        }
    }

    return {
        lat: totalLat / count,
        lng: totalLng / count
    };
}

async function enrichCitiesCoordinates() {
    console.log('--- Enriching Cities with Coordinates ---');

    // Load GeoJSON
    const geoPath = path.join(process.cwd(), 'docs/lka_admin_boundaries.geojson/lka_admin3.geojson');
    const geoData = JSON.parse(fs.readFileSync(geoPath, 'utf8'));

    console.log(`Loaded ${geoData.features.length} DS divisions from GeoJSON`);

    // Create lookup map
    const coordsMap = new Map<string, { lat: number; lng: number; area: number }>();

    for (const feature of geoData.features as Feature[]) {
        const props = feature.properties;
        const cityId = props.adm3_pcode;

        if (!cityId) continue;

        // Get center from properties if available, otherwise calculate
        let lat = parseFloat(props.center_lat);
        let lng = parseFloat(props.center_lon);

        if (!lat || !lng) {
            const centroid = getCentroid(feature.geometry.coordinates);
            lat = centroid.lat;
            lng = centroid.lng;
        }

        coordsMap.set(cityId, {
            lat,
            lng,
            area: parseFloat(props.area_sqkm) || 0
        });
    }

    console.log(`Prepared ${coordsMap.size} coordinate mappings`);

    // Update cities
    let updated = 0, failed = 0;
    const cities = await databases.listDocuments(DB_ID, 'cities', [Query.limit(500)]);

    for (const city of cities.documents) {
        const coords = coordsMap.get(city.$id);

        if (coords && (!city.latitude || !city.longitude)) {
            try {
                await databases.updateDocument(DB_ID, 'cities', city.$id, {
                    latitude: coords.lat,
                    longitude: coords.lng
                });
                updated++;
                process.stdout.write('+');
            } catch (e) {
                failed++;
                process.stdout.write('X');
            }
        }
    }

    console.log(`\n✅ Cities coordinates: ${updated} updated, ${failed} failed`);
    return updated;
}

async function enrichNativeNames() {
    console.log('\n--- Enriching Native Names ---');

    // Load regions GeoJSON
    const regionsPath = path.join(process.cwd(), 'docs/lka_admin_boundaries.geojson/lka_admin2.geojson');
    const regionsData = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));

    let regionsUpdated = 0;

    for (const feature of regionsData.features) {
        const props = feature.properties;
        const regionId = props.adm2_pcode;
        const nativeName = props.adm2_name1 || props.adm2_name2 || ''; // Sinhala or Tamil

        if (regionId && nativeName) {
            try {
                // Check if region exists and update
                const region = await databases.getDocument(DB_ID, 'regions', regionId);
                if (!region.native_name) {
                    await databases.updateDocument(DB_ID, 'regions', regionId, {
                        native_name: nativeName
                    });
                    regionsUpdated++;
                }
            } catch (e) {
                // Skip if not found
            }
        }
    }

    console.log(`✅ Regions native names: ${regionsUpdated} updated`);

    // Load cities GeoJSON  
    const citiesPath = path.join(process.cwd(), 'docs/lka_admin_boundaries.geojson/lka_admin3.geojson');
    const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

    let citiesUpdated = 0;

    for (const feature of citiesData.features) {
        const props = feature.properties;
        const cityId = props.adm3_pcode;
        const nativeName = props.adm3_name1 || props.adm3_name2 || '';

        if (cityId && nativeName) {
            try {
                const city = await databases.getDocument(DB_ID, 'cities', cityId);
                if (!city.native_name) {
                    await databases.updateDocument(DB_ID, 'cities', cityId, {
                        native_name: nativeName
                    });
                    citiesUpdated++;
                    process.stdout.write('.');
                }
            } catch (e) {
                // Skip
            }
        }
    }

    console.log(`\n✅ Cities native names: ${citiesUpdated} updated`);
    return regionsUpdated + citiesUpdated;
}

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   PHASE 3: COMPLETE ENRICHMENT        ║');
    console.log('╚═══════════════════════════════════════╝\n');

    const coordsUpdated = await enrichCitiesCoordinates();
    const namesUpdated = await enrichNativeNames();

    console.log('\n✓ Phase 3 Complete');
    console.log(`Total updates: ${coordsUpdated + namesUpdated}`);
}

main().catch(console.error);
