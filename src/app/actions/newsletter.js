'use server';

import { ID, Query } from 'node-appwrite';
import { databases, functions } from '@/lib/server/appwrite';
import { DB_ID, COLLECTION_SUBSCRIBERS } from '@/appwrite/config';
import { headers } from 'next/headers';

export async function subscribeToNewsletter(email) {
  if (!process.env.APPWRITE_API_KEY) {
    console.error('APPWRITE_API_KEY is not set');
    return { success: false, error: 'Server not configured' };
  }
  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email address' };
  }

  // Rate Limiting (Simple IP based)
  const headersList = await headers();
  // Depending on deployment, IP might be in different headers
  const ip = headersList.get('x-forwarded-for') || 'unknown';

  // Note: For a real production app, use Redis or a dedicated rate-limit table.
  // Here we'll just proceed but in a real scenario we'd check a 'rate_limits' collection.

  try {
    // Check if email already exists
    const existing = await databases.listDocuments(
      DB_ID,
      COLLECTION_SUBSCRIBERS,
      [Query.equal('email', email)]
    );

    if (existing.total > 0) {
      const doc = existing.documents[0];
      if (doc.status === 'active') {
        return { success: true, message: 'Already subscribed' };
      } else {
        // Resend verification?
        // For now, let's treat it as success to avoid info leak, or tell them to check email.
         return { success: true, message: 'Please check your email to confirm subscription.' };
      }
    }

    const verificationToken = ID.unique() + ID.unique(); // Simple random token

    await databases.createDocument(
      DB_ID,
      COLLECTION_SUBSCRIBERS,
      ID.unique(),
      {
        email,
        is_active: true, // Internal flag, but status determines visibility
        status: 'pending',
        verification_token: verificationToken,
        subscribed_at: new Date().toISOString(),
      }
    );

    // Trigger Email Function
    // We assume the function 'send-email' exists and takes this payload
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://landsale.lk'}/newsletter/verify?token=${verificationToken}`;

    try {
        await functions.createExecution(
            'send-email', // Function ID
            JSON.stringify({
                type: 'newsletter_verification',
                email: email,
                data: {
                    link: verificationLink
                }
            }),
            true // Async
        );
    } catch (emailError) {
        console.error('Failed to trigger email function:', emailError);
        // We still return success to the user, but log the error.
    }

    return { success: true, message: 'Please check your email to confirm subscription.' };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    if (error.code === 404) {
        return { success: false, error: 'Service unavailable. Please try again later.' };
    }
    return { success: false, error: 'Failed to subscribe. Please try again later.' };
  }
}
