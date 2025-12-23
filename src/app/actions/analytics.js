'use server';

import { databases } from '@/lib/server/appwrite';
import { DB_ID, COLLECTION_LISTINGS } from '@/appwrite/config';

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
    // Note: In high concurrency, this simple read-modify-write might miss counts.
    // For exact analytics, an Appwrite Function or specific atomic operator would be better,
    // but this suffices for general view counters.
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
