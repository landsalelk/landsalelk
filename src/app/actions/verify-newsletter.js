'use server';

import { Query } from 'node-appwrite';
import { databases } from '@/lib/server/appwrite';
import { DB_ID, COLLECTION_SUBSCRIBERS } from '@/appwrite/config';

export async function verifySubscription(token) {
  if (!process.env.APPWRITE_API_KEY) {
    console.error('APPWRITE_API_KEY is not set');
    return { success: false, error: 'Server not configured' };
  }
  if (!token) {
    return { success: false, error: 'Token is required' };
  }

  try {
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
