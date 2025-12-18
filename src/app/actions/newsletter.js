'use server';

import { Client, Databases, ID, Query } from 'node-appwrite';
import { DB_ID, COLLECTION_SUBSCRIBERS } from '@/lib/constants';

const createAdminClient = () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  return {
    getDatabases: () => new Databases(client),
  };
};

export async function subscribeToNewsletter(email) {
  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email address' };
  }

  try {
    const { getDatabases } = createAdminClient();
    const databases = getDatabases();

    // Check if email already exists
    const existing = await databases.listDocuments(
      DB_ID,
      COLLECTION_SUBSCRIBERS,
      [Query.equal('email', email)]
    );

    if (existing.total > 0) {
        // If already subscribed but inactive, we could reactivate it.
        // For now, we'll just return success to avoid leaking info or just say "Already subscribed"
        // But typically for newsletters, idempotency is good.
      return { success: true, message: 'Already subscribed' };
    }

    await databases.createDocument(
      DB_ID,
      COLLECTION_SUBSCRIBERS,
      ID.unique(),
      {
        email,
        is_active: true,
        subscribed_at: new Date().toISOString(),
      }
    );

    return { success: true, message: 'Successfully subscribed!' };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    // Determine if it's a "collection not found" error or something else
    if (error.code === 404) {
        return { success: false, error: 'Service unavailable (Collection not found). Please contact support.' };
    }
    return { success: false, error: 'Failed to subscribe. Please try again later.' };
  }
}
