'use server';

import { ID, Query } from 'node-appwrite';
import { databases, functions } from '@/lib/server/appwrite';
import { DB_ID, COLLECTION_SUBSCRIBERS } from '@/appwrite/config';
import { headers } from 'next/headers';

export async function subscribeToNewsletter(rawEmail) {
  const email = rawEmail ? rawEmail.trim() : null;
  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email address' };
  }

  if (!databases || !functions) {
    return { success: false, error: 'Newsletter service is currently unavailable.' };
  }

  try {
    const existing = await databases.listDocuments(
      DB_ID,
      COLLECTION_SUBSCRIBERS,
      [Query.equal('email', email)]
    );

    if (existing.total > 0) {
      const doc = existing.documents[0];
      if (doc.status === 'active') {
        return { success: true, message: 'You are already subscribed.' };
      } else {
        // To prevent user enumeration, we don't reveal if the email is in a pending state.
        // We can re-trigger the verification email here if desired, but for now, we'll return a generic message.
        return { success: true, message: 'Please check your email to confirm your subscription.' };
      }
    }

    const verificationToken = ID.unique() + ID.unique();

    await databases.createDocument(
      DB_ID,
      COLLECTION_SUBSCRIBERS,
      ID.unique(),
      {
        email,
        status: 'pending',
        verification_token: verificationToken,
        subscribed_at: new Date().toISOString(),
      }
    );

    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://landsale.lk'}/newsletter/verify?token=${verificationToken}`;

    // Asynchronously trigger the email function
    functions.createExecution(
      'send-email',
      JSON.stringify({
        type: 'newsletter_verification',
        email: email,
        data: { link: verificationLink }
      }),
      true
    ).catch(emailError => {
      // High-priority: Failed to trigger newsletter verification email.
      // A monitoring service or cron job should be in place to detect and retry these failures.
      // For now, the user is in the database as 'pending', so the subscription is not lost.
    });

    return { success: true, message: 'Subscription successful! Please check your email to confirm.' };
  } catch (error) {
    // Generic error to avoid leaking implementation details
    // console.error('Newsletter subscription error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
