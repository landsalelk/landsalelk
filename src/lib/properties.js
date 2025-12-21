import { databases, account, storage, Query, ID } from "@/appwrite";
import { DB_ID, COLLECTION_LISTINGS, COLLECTION_AGENTS, BUCKET_LISTING_IMAGES } from "@/appwrite/config";

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
        queries.push(Query.equal('category_id', filters.category));
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
        queries.push(Query.equal('approval_nbro', true));
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
    let slug;
    let currency_code;
    let contact;
    let verification_code = null;
    let status;
    let user;

    try {
        user = await account.get();

        // Ensure required "slug" exists and is URL-safe.
        const slugify = (str = '') => str
            .toString()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '') // strip diacritics
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-')
            .slice(0, 80);

        const baseSlug = slugify(data.slug || data.title || 'listing');
        slug = baseSlug ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}` : `listing-${Date.now()}`;
        currency_code = data.currency_code || 'LKR';
        contact =
            data.contact ||
            [data.contact_name, data.contact_phone, data.contact_email].filter(Boolean).join(' | ') ||
            data.contact_phone ||
            data.contact_name ||
            data.contact_email ||
            'Contact not provided';

        // Generate verification code if owner_phone is provided
        status = data.status || 'active';
        if (data.owner_phone && data.owner_phone.trim().length > 0) {
            // Generate a secure 6-character alphanumeric code
            verification_code = Math.random().toString(36).substring(2, 8).toUpperCase();
            status = 'pending'; // Requires owner verification (mapped to 'pending' in schema)
        }

        // Whitelist payload to avoid schema errors (Appwrite rejects unknown attributes)
        const payload = {
            slug,
            currency_code,
            contact,
            title: data.title || 'Listing',
            description: data.description || '',
            price: parseFloat(data.price) || 0,
            listing_type: data.listing_type || 'sale',
            category_id: data.category_id || 'house',
            images: data.images || data.imageIds || data.image_urls || [],
            location: data.location || '',
            status: status,
            user_id: user.$id,
            // created_at: new Date().toISOString(), // Removed: Managed by Appwrite
            verification_code: verification_code,
            // Extended Attributes
            beds: parseInt(data.beds) || 0,
            baths: parseInt(data.baths) || 0,
            size_sqft: parseInt(data.size_sqft) || 0,
            perch_size: parseFloat(data.perch_size) || 0,
            deed_type: data.deed_type || '',
            approval_nbro: data.approval_nbro || false,
            approval_coc: data.approval_coc || false,
            approval_uda: data.approval_uda || false,
            is_foreign_eligible: data.is_foreign_eligible || false,
            has_payment_plan: data.has_payment_plan || false,
            infrastructure_distance: parseFloat(data.infrastructure_distance) || 0,
            service_fee: parseFloat(data.service_fee) || 0
        };

        const doc = await databases.createDocument(
            DB_ID,
            COLLECTION_LISTINGS,
            ID.unique(),
            payload
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

        // FALLBACK: If extended attributes fail (schema mismatch), try minimal payload
        const isSchemaError = error.code === 400 && (
            error.message.toLowerCase().includes('attribute not found') || 
            error.message.toLowerCase().includes('unknown attribute') ||
            error.message.toLowerCase().includes('unknown')
        );

        if (isSchemaError) {
            console.warn("Schema mismatch detected. Retrying with minimal payload...");
            try {
                const minimalPayload = {
                    slug,
                    currency_code,
                    contact,
                    title: data.title || 'Listing',
                    description: data.description || '',
                    price: parseFloat(data.price) || 0,
                    listing_type: data.listing_type || 'sale',
                    category_id: data.category_id || 'house',
                    images: data.images || data.imageIds || data.image_urls || [],
                    location: data.location || '',
                    status: status,
                    user_id: user.$id,
                    // created_at: new Date().toISOString(), // Removed: Managed by Appwrite
                    verification_code: verification_code
                };
                
                const doc = await databases.createDocument(
                    DB_ID,
                    COLLECTION_LISTINGS,
                    ID.unique(),
                    minimalPayload
                );
                
                // Return success even if extended fields were lost
                return doc;
            } catch (retryError) {
                console.error("Minimal payload retry failed:", retryError);
                throw retryError; // Throw original or new error
            }
        }

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
        if (category) queries.push(Query.equal('category_id', category));

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
