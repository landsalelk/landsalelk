'use server';

import { databases } from '@/lib/server/appwrite';
import { DB_ID, COLLECTION_LISTINGS } from '@/appwrite/config';

/**
 * Increments the view count for a specific listing.
 * @param {string} listingId - The ID of the listing to update.
 * @returns {Promise<{success: boolean, views?: number, error?: string}>}
 */
export async function incrementViewCount(listingId) {
  if (!listingId) return { success: false, error: 'Listing ID is required' };

  try {
    // If databases client is not available (missing API key), skip gracefully
    if (!databases) {
      return { success: false, error: 'Analytics not configured' };
    }

    let currentViews = 0;
    try {
        const listing = await databases.getDocument(
            DB_ID,
            COLLECTION_LISTINGS,
            listingId
        );
        currentViews = listing.views_count || 0;
    } catch (error) {
        if (error.code !== 404) {
            return { success: false, error: error.message };
        }
    }

    // Update with incremented count
    try {
        await databases.updateDocument(
            DB_ID,
            COLLECTION_LISTINGS,
            listingId,
            {
                views_count: currentViews + 1
            }
        );
    } catch (error) {
        return { success: false, error: "Failed to update views" };
    }

    return { success: true, views: currentViews + 1 };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
