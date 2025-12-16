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
    // Implementation placeholder for the Search Phase
    const queries = [Query.orderDesc('$createdAt')];

    if (filters.type) {
        queries.push(Query.search('listing_type', filters.type));
    }

    // Add more filters as needed

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
