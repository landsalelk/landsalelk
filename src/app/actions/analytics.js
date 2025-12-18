'use server';

import { Client, Databases } from 'node-appwrite';
import { DB_ID, COLLECTION_LISTINGS } from '@/lib/constants';

const createAdminClient = () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  return {
    getDatabases: () => new Databases(client),
  };
};

export async function incrementViewCount(listingId) {
  if (!listingId) return { success: false, error: 'Listing ID is required' };

  try {
    const { getDatabases } = createAdminClient();
    const databases = getDatabases();

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
    console.error('Error incrementing view count:', error);
    return { success: false, error: error.message };
  }
}
