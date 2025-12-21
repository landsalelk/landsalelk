'use server';

import { Client, Databases } from 'node-appwrite';
import { DB_ID, COLLECTION_LISTINGS } from '@/appwrite/config';

// Fallback values for build time - should be overridden by env vars in production
const FALLBACK_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const FALLBACK_PROJECT_ID = 'landsalelkproject';

const createAdminClient = () => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || FALLBACK_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || FALLBACK_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  // If no API key, return null to skip the operation gracefully
  if (!apiKey) {
    console.warn('[Analytics] APPWRITE_API_KEY is not set. View count will not be tracked.');
    return null;
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return {
    getDatabases: () => new Databases(client),
  };
};

export async function incrementViewCount(listingId) {
  if (!listingId) return { success: false, error: 'Listing ID is required' };

  try {
    const adminClient = createAdminClient();

    // If admin client is not available (missing API key), skip gracefully
    if (!adminClient) {
      return { success: false, error: 'Analytics not configured' };
    }

    const { getDatabases } = adminClient;
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
