'use server';

import { ID, Query } from 'node-appwrite';
import { databases, functions } from '@/lib/server/appwrite';
import { DB_ID, COLLECTION_USERS_EXTENDED } from '@/appwrite/config';
import { headers } from 'next/headers';


/**
 * Subscribes a user to the newsletter.
 * This function handles email validation, checks for existing subscribers,
 * creates a new subscriber record in a 'pending' state, and triggers a verification email.
 *
 * @param {string | null} rawEmail The email address to subscribe. It will be trimmed.
 * @returns {Promise<{success: boolean, message?: string, error?: string}>} An object indicating success or failure.
 */
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
      COLLECTION_USERS_EXTENDED,
      [Query.equal('email', email)]
    );

    if (existing.total > 0) {
        // To prevent user enumeration and for a consistent UX, always return the same message.
        // This handles cases where the user is already subscribed or pending verification.
        return { success: true, message: 'Thank you for subscribing! Please check your email to confirm.' };
    }

    const verificationToken = ID.unique() + ID.unique();

    await databases.createDocument(
      DB_ID,
      COLLECTION_USERS_EXTENDED,
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

    return { success: true, message: 'Thank you for subscribing! Please check your email to confirm.' };
  } catch (error) {
    // Generic error to avoid leaking implementation details.
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
