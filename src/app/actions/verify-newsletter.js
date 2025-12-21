'use server';

import { Client, Databases, Query } from 'node-appwrite';
import { DB_ID, COLLECTION_SUBSCRIBERS } from '@/appwrite/config';

const createAdminClient = () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  return {
    getDatabases: () => new Databases(client),
  };
};

export async function verifySubscription(token) {
  if (!token) {
    return { success: false, error: 'Token is required' };
  }

  try {
    const { getDatabases } = createAdminClient();
    const databases = getDatabases();

    // Find the pending subscription with this token
    const result = await databases.listDocuments(
      DB_ID,
      COLLECTION_SUBSCRIBERS,
      [
        Query.equal('verification_token', token),
        Query.equal('status', 'pending') // Only pending ones
      ]
    );

    if (result.total === 0) {
      // Maybe it's already verified? Check without status
       const checkAll = await databases.listDocuments(
        DB_ID,
        COLLECTION_SUBSCRIBERS,
        [Query.equal('verification_token', token)]
      );

      if (checkAll.total > 0 && checkAll.documents[0].status === 'active') {
          return { success: true, message: 'Already verified' };
      }

      return { success: false, error: 'Invalid or expired token.' };
    }

    const doc = result.documents[0];

    // Update status to active
    await databases.updateDocument(
      DB_ID,
      COLLECTION_SUBSCRIBERS,
      doc.$id,
      {
        status: 'active',
        // verification_token: null // Optional: clear it, or keep for record
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Verification error:', error);
    return { success: false, error: 'Internal server error.' };
  }
}
