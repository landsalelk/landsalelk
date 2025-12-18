import { databases, account, storage } from "./appwrite";
import { Query, ID } from "appwrite";
import { DB_ID, COLLECTION_LISTINGS, COLLECTION_AGENTS, BUCKET_LISTING_IMAGES } from "./constants";

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
        const type = filters.type.toLowerCase();
        if (type === 'land') {
            // Special handling for 'Land' type: Fetch 'sale' query tokens
            // We use client-side filtering later to avoid SDK limits/errors
            queries.push(Query.equal('listing_type', 'sale'));
            queries.push(Query.limit(100)); // Fetch more to enable effective post-filtering
        } else {
            queries.push(Query.equal('listing_type', type));
        }
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

    if (filters.foreignEligible) {
        queries.push(Query.equal('is_foreign_eligible', true));
    }

    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_LISTINGS,
            queries
        );

        let documents = result.documents;

        // Post-filter for Land
        if (filters.type && filters.type.toLowerCase() === 'land') {
            documents = documents.filter(doc =>
                (doc.title || '').toLowerCase().includes('land') ||
                (doc.title || '').toLowerCase().includes('plot') ||
                (doc.title || '').toLowerCase().includes('acre') ||
                (doc.title || '').toLowerCase().includes('perch')
            );
        }

        return documents;
    } catch (error) {
        console.error("Error searching properties:", error);
        throw error; // Propagate error to UI
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
        const doc = await databases.createDocument(
            DB_ID,
            COLLECTION_LISTINGS,
            ID.unique(),
            {
                ...data,
                user_id: user.$id,
                created_at: new Date().toISOString(),
                status: 'active'
            }
        );

        // Phase 1 Gamification: Award 10 points for new listing
        try {
            // Check if user has an agent profile. We try to update 'agents' collection.
            // If the user is just a regular user, this might fail or we update 'users_extended'.
            // For now, assuming 'agents' collection maps to user.$id or we search.
            // Usually agents have a document with ID == User ID or similar.
            // Let's try to fetch agent doc by user_id

            const agentList = await databases.listDocuments(DB_ID, COLLECTION_AGENTS, [
                Query.equal('user_id', user.$id)
            ]);

            if (agentList.documents.length > 0) {
                const agent = agentList.documents[0];
                const newPoints = (agent.points || 0) + 10;
                await databases.updateDocument(DB_ID, COLLECTION_AGENTS, agent.$id, {
                    points: newPoints
                });
            }
        } catch (pointError) {
            console.warn("Failed to award points:", pointError);
            // Don't block listing creation
        }

        return doc;
    } catch (error) {
        console.error("Create Listing Error:", error);
        throw error;
    }
}

/**
 * Update an existing property listing.
 * @param {string} id - Property document ID
 * @param {Object} data - Updated data
 */
export async function updateProperty(id, data) {
    try {
        return await databases.updateDocument(
            DB_ID,
            COLLECTION_LISTINGS,
            id,
            {
                ...data,
                updated_at: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error("Update Listing Error:", error);
        throw error;
    }
}

/**
 * Delete a property listing and its associated images.
 * @param {string} id - Property document ID
 */
export async function deleteProperty(id) {
    try {
        // 1. Fetch the listing to get image IDs
        const listing = await databases.getDocument(DB_ID, COLLECTION_LISTINGS, id);

        // 2. Delete associated images from storage
        if (listing.images && Array.isArray(listing.images)) {
            const deletePromises = listing.images.map(async (imageId) => {
                try {
                    await storage.deleteFile(BUCKET_LISTING_IMAGES, imageId);
                } catch (err) {
                    console.warn(`Failed to delete image ${imageId}:`, err.message);
                }
            });
            await Promise.all(deletePromises);
        }

        // 3. Delete the listing document
        await databases.deleteDocument(DB_ID, COLLECTION_LISTINGS, id);
        return true;
    } catch (error) {
        console.error("Delete Listing Error:", error);
        throw error;
    }
}

/**
 * Renew a property listing (bumps created_at).
 * @param {string} id - Property document ID
 */
export async function renewProperty(id) {
    try {
        return await databases.updateDocument(
            DB_ID,
            COLLECTION_LISTINGS,
            id,
            {
                created_at: new Date().toISOString(),
                status: 'active'
            }
        );
    } catch (error) {
        console.error("Renew Listing Error:", error);
        throw error;
    }
}

/**
 * Fetch related properties based on type and category.
 * @param {string} currentId - ID of current property to exclude
 * @param {string} type - listing_type (sale/rent)
 * @param {string} category - land_type (house/apartment/land)
 * @param {number} limit
 */
export async function getRelatedProperties(currentId, type, category, limit = 3) {
    try {
        const queries = [
            Query.notEqual('$id', currentId),
            Query.limit(limit),
            Query.orderDesc('$createdAt')
        ];

        if (type) queries.push(Query.equal('listing_type', type));
        if (category) queries.push(Query.equal('land_type', category));

        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_LISTINGS,
            queries
        );
        return result.documents;
    } catch (error) {
        console.error("Error fetching related properties:", error);
        return [];
    }
}

/**
 * Get all available filter options (could be fetched from DB aggregations in future)
 */
export function getFilterOptions() {
    return {
        types: ['Sale', 'Rent', 'Land'],
        categories: ['House', 'Apartment', 'Commercial', 'Bare Land', 'Coconut Land', 'Tea Estate'],
        deedTypes: [
            { id: 'sinnakkara', label: 'Sinnakkara (Freehold)' },
            { id: 'bim_saviya', label: 'Bim Saviya' },
            { id: 'jayabhoomi', label: 'Jayabhoomi' },
            { id: 'condominium', label: 'Condominium' }
        ],
    };
}
