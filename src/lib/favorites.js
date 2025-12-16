import { databases, account } from "./appwrite";
import { ID, Query } from "appwrite";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';
const COLLECTION_FAVORITES = 'favorites';

/**
 * Add a property to user's favorites
 */
export async function addFavorite(propertyId) {
    const user = await account.get();

    // Check if already saved
    const existing = await databases.listDocuments(
        DB_ID,
        COLLECTION_FAVORITES,
        [
            Query.equal('user_id', user.$id),
            Query.equal('property_id', propertyId),
            Query.limit(1)
        ]
    );

    if (existing.documents.length > 0) {
        return existing.documents[0]; // Already favorited
    }

    return await databases.createDocument(
        DB_ID,
        COLLECTION_FAVORITES,
        ID.unique(),
        {
            user_id: user.$id,
            property_id: propertyId,
            saved_at: new Date().toISOString()
        }
    );
}

/**
 * Remove a property from user's favorites
 */
export async function removeFavorite(propertyId) {
    const user = await account.get();

    const existing = await databases.listDocuments(
        DB_ID,
        COLLECTION_FAVORITES,
        [
            Query.equal('user_id', user.$id),
            Query.equal('property_id', propertyId),
            Query.limit(1)
        ]
    );

    if (existing.documents.length > 0) {
        await databases.deleteDocument(DB_ID, COLLECTION_FAVORITES, existing.documents[0].$id);
        return true;
    }
    return false;
}

/**
 * Check if a property is saved by the current user
 */
export async function isFavorite(propertyId) {
    try {
        const user = await account.get();
        const existing = await databases.listDocuments(
            DB_ID,
            COLLECTION_FAVORITES,
            [
                Query.equal('user_id', user.$id),
                Query.equal('property_id', propertyId),
                Query.limit(1)
            ]
        );
        return existing.documents.length > 0;
    } catch (e) {
        return false; // Not logged in or error
    }
}

/**
 * Get all favorites for the current user
 */
export async function getUserFavorites() {
    const user = await account.get();
    const result = await databases.listDocuments(
        DB_ID,
        COLLECTION_FAVORITES,
        [
            Query.equal('user_id', user.$id),
            Query.orderDesc('$createdAt'),
            Query.limit(50)
        ]
    );
    return result.documents;
}
