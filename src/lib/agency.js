import { databases, Query } from '@/lib/appwrite';
import { DB_ID, COLLECTION_AGENCIES } from '@/appwrite/config';

/**
 * Check if the current user manages an agency.
 * @param {string} userId
 * @returns {Promise<Object|null>} The agency document if found, null otherwise.
 */
export async function getAgencyByOwner(userId) {
    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENCIES,
            [
                Query.equal('owner_id', userId),
                Query.limit(1)
            ]
        );
        return result.documents.length > 0 ? result.documents[0] : null;
    } catch (error) {
        console.error("Error fetching agency by owner:", error);
        return null;
    }
}

/**
 * Get agency details by slug (Public Profile).
 * @param {string} slug
 */
export async function getAgencyBySlug(slug) {
    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENCIES,
            [
                Query.equal('slug', slug),
                Query.limit(1)
            ]
        );
        return result.documents.length > 0 ? result.documents[0] : null;
    } catch (error) {
        console.error("Error fetching agency by slug:", error);
        return null;
    }
}

/**
 * Check if an agency slug is available.
 * @param {string} slug
 */
export async function isSlugAvailable(slug) {
    const agency = await getAgencyBySlug(slug);
    return agency === null;
}
