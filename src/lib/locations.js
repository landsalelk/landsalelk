'use client';

import { databases } from '@/lib/appwrite';
import {
    DB_ID,
    COLLECTION_COUNTRIES,
    COLLECTION_REGIONS,
    COLLECTION_CITIES,
    COLLECTION_AREAS
} from './constants';
import { Query } from 'appwrite';

/**
 * Fetch all countries (defaults to Sri Lanka)
 */
export async function getCountries() {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_COUNTRIES,
            [Query.orderAsc('name')]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching countries:', error);
        // Fallback for Sri Lanka
        return [{ $id: 'sri-lanka', name: 'Sri Lanka', code: 'LK' }];
    }
}

/**
 * Fetch regions/provinces by country
 */
export async function getRegions(countryId = 'sri-lanka') {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_REGIONS,
            [
                Query.equal('country_id', countryId),
                Query.orderAsc('name')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching regions:', error);
        return [];
    }
}

/**
 * Fetch cities by region
 */
export async function getCities(regionId) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_CITIES,
            [
                Query.equal('region_id', regionId),
                Query.orderAsc('name')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching cities:', error);
        return [];
    }
}

/**
 * Fetch areas by city
 */
export async function getAreas(cityId) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_AREAS,
            [
                Query.equal('city_id', cityId),
                Query.orderAsc('name')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching areas:', error);
        return [];
    }
}

/**
 * Get full location path (Region > City > Area)
 */
export async function getLocationPath(areaId) {
    try {
        const area = await databases.getDocument(DB_ID, COLLECTION_AREAS, areaId);
        const city = await databases.getDocument(DB_ID, COLLECTION_CITIES, area.city_id);
        const region = await databases.getDocument(DB_ID, COLLECTION_REGIONS, city.region_id);

        return {
            area: area.name,
            city: city.name,
            region: region.name,
            fullPath: `${area.name}, ${city.name}, ${region.name}`
        };
    } catch (error) {
        console.error('Error getting location path:', error);
        return null;
    }
}

/**
 * Search locations by name
 */
export async function searchLocations(query) {
    try {
        // Search cities
        const citiesResponse = await databases.listDocuments(
            DB_ID,
            COLLECTION_CITIES,
            [Query.search('name', query), Query.limit(10)]
        );

        // Search areas
        const areasResponse = await databases.listDocuments(
            DB_ID,
            COLLECTION_AREAS,
            [Query.search('name', query), Query.limit(10)]
        );

        return {
            cities: citiesResponse.documents,
            areas: areasResponse.documents
        };
    } catch (error) {
        console.error('Error searching locations:', error);
        return { cities: [], areas: [] };
    }
}

/**
 * Get location options for dropdown (formatted)
 */
export async function getRegionOptions() {
    const regions = await getRegions();
    return regions.map(r => ({
        value: r.$id,
        label: r.name
    }));
}

export async function getCityOptions(regionId) {
    const cities = await getCities(regionId);
    return cities.map(c => ({
        value: c.$id,
        label: c.name
    }));
}

export async function getAreaOptions(cityId) {
    const areas = await getAreas(cityId);
    return areas.map(a => ({
        value: a.$id,
        label: a.name
    }));
}
