import { databases } from "./appwrite"; // Using the client-side/shared instance for now
import { Query } from "appwrite";

// We should use Environment Variables for ID references to maintain "Configuration Management"
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk'; // Fallback for safety
const COLLECTION_LISTINGS = 'listings';
const COLLECTION_AGENTS = 'agents';

/**
 * Fetch a single property by its ID.
 * @param {string} id - The document ID of the property.
 * @returns {Promise<Object>} - The property document or throws error.
 */
export async function getPropertyById(id) {
    try {
        const doc = await databases.getDocument(
            DB_ID,
            COLLECTION_LISTINGS,
            id
        );
        return doc;
    } catch (error) {
        console.error(`Error fetching property ${id}:`, error);
        // Throwing error allows the UI to handle it (e.g. show 404 or Error Boundary)
        throw new Error("Failed to fetch property details.");
    }
}

/**
 * Fetch featured properties for the homepage.
 * @param {number} limit - Number of properties to fetch.
 * @returns {Promise<Array>} - Array of property documents.
 */
export async function getFeaturedProperties(limit = 4) {
    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_LISTINGS,
            [
                Query.limit(limit),
                Query.orderDesc('$createdAt'),
                // Query.equal('is_premium', true) // Uncomment when we have data
            ]
        );
        return result.documents;
    } catch (error) {
        console.error("Error fetching featured properties:", error);
        return []; // Return empty array to prevent UI crash (Robustness)
    }
}

/**
 * Search properties with filters.
 * @param {Object} filters - Filter criteria (type, price range, etc.)
 * @returns {Promise<Array>}
 */
export async function searchProperties(filters = {}) {
    const queries = [Query.orderDesc('$createdAt')];

    // 1. Keyword Search
    if (filters.search) {
        queries.push(Query.search('title', filters.search));
    }

    // 2. Property Type (Sale/Rent/Land)
    if (filters.type && filters.type !== 'all') {
        queries.push(Query.equal('listing_type', filters.type));
    }

    // 3. Category (House, Apartment, Land)
    if (filters.category && filters.category !== 'all') {
        queries.push(Query.equal('land_type', filters.category));
        // Note: Mapping 'category' UI filter to 'land_type' attribute for now
    }

    // 4. Price Range
    if (filters.minPrice) {
        queries.push(Query.greaterThanEqual('price', parseInt(filters.minPrice)));
    }
    if (filters.maxPrice) {
        queries.push(Query.lessThanEqual('price', parseInt(filters.maxPrice)));
    }

    // 5. Attributes (Bads/Baths)
    if (filters.beds && filters.beds !== 'any') {
        queries.push(Query.greaterThanEqual('beds', parseInt(filters.beds)));
    }

    // 6. Sri Lankan Specifics
    if (filters.deedType && filters.deedType !== 'any') {
        queries.push(Query.equal('deed_type', filters.deedType));
    }

    if (filters.nbro && filters.nbro === true) {
        queries.push(Query.equal('nbro_approval', true));
    }

    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_LISTINGS,
            queries
        );
        return result.documents;
    } catch (error) {
        console.error("Error searching properties:", error);
        return [];
    }
}

/**
 * Fetch listings created by a specific user.
 * @param {string} userId
 */
export async function getUserListings(userId) {
    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_LISTINGS,
            [
                Query.equal('user_id', userId),
                Query.orderDesc('$createdAt')
            ]
        );
        return result.documents;
    } catch (error) {
        console.error("Error fetching user listings:", error);
        return [];
    }
}

/**
 * Create a new property listing.
 * @param {Object} data 
 */
export async function createProperty(data) {
    try {
        const user = await account.get();
        // Upload images first (if any) - logic handled in component usually, passing IDs here
        // But for simplicity, we assume data.images contains File objects we need to upload
        // or URLs/ID strings.

        // This function assumes `data` is the JSON payload for the document.

        return await databases.createDocument(
            DB_ID,
            COLLECTION_LISTINGS,
            ID.unique(),
            {
                ...data,
                user_id: user.$id,
                created_at: new Date().toISOString(),
                status: 'active' // or 'pending'
            }
        );
    } catch (error) {
        console.error("Create Listing Error:", error);
        throw error;
    }
}

/**
 * Get all available filter options (could be fetched from DB aggregations in future)
 */
export function getFilterOptions() {
    return {
        types: ['Sale', 'Rent', 'Land'],
        categories: ['House', 'Apartment', 'Commercial', 'Bare Land', 'Coconut Land', 'Tea Estate'],
        deedTypes: ['Sinnakkara (Freehold)', 'Bim Saviya', 'Jayabhoomi', 'Swarnabhoomi'],
    };
}
