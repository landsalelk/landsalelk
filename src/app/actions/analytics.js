'use server';

import { databases } from '@/lib/server/appwrite';
import { DB_ID, COLLECTION_LISTINGS } from '@/appwrite/config';

/**
 * Increments the view count for a given listing.
 * @param {string} listingId The ID of the listing to increment the view count for.
 * @returns {Promise<{success: boolean, views?: number, error?: string}>}
 */
export async function incrementViewCount(listingId) {
  try {
    if (!listingId) {
      throw new Error('Listing ID is required');
    }

    // 1. Get current document to know current count
    const listing = await databases.getDocument(
      DB_ID,
      COLLECTION_LISTINGS,
      listingId
    );

    const currentViews = listing.views_count || 0;

    // 2. Update with incremented count
    // Note: This is a "best-effort" increment. In high concurrency scenarios (multiple users viewing the same listing at the same time),
    // this read-modify-write pattern can lead to a race condition where some views are not counted.
    // For 100% accuracy, a more robust solution like a dedicated Appwrite Function with atomic operations would be required.
    await databases.updateDocument(
      DB_ID,
      COLLECTION_LISTINGS,
      listingId,
      {
        views_count: currentViews + 1
      }
    );

    return { success: true, views: currentViews + 1 };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
