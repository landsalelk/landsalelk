'use server';

import { databases, functions, Query } from '@/lib/server/appwrite';
import { DB_ID, COLLECTION_SUBSCRIBERS } from '@/appwrite/config';
import { headers } from 'next/headers';
import { z } from 'zod';

const emailSchema = z.string().email();

export async function subscribeToNewsletter(email) {
  try {
    const validatedEmail = emailSchema.parse(email);

    // Rate Limiting (Simple IP based)
    const headersList = await headers();
    // Depending on deployment, IP might be in different headers
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    // Note: For a real production app, use Redis or a dedicated rate-limit table.
    // Here we'll just proceed but in a real scenario we'd check a 'rate_limits' collection.

    // Check if email already exists
    const existing = await databases.listDocuments(
      DB_ID,
      COLLECTION_SUBSCRIBERS,
      [Query.equal('email', validatedEmail)]
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

    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await databases.createDocument(
      DB_ID,
      COLLECTION_SUBSCRIBERS,
      'unique()',
      {
        email: validatedEmail,
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
                email: validatedEmail,
                data: {
                    link: verificationLink
                }
            }),
            true // Async
        );
    } catch (error) {
        return { success: false, error: "Notification email failed to send" };
    }

    return { success: true, message: 'Please check your email to confirm subscription.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
        return { success: false, error: 'Invalid email address' };
    }
    if (error.code === 404) {
        return { success: false, error: 'Service unavailable. Please try again later.' };
    }
    return { success: false, error: 'Failed to subscribe. Please try again later.' };
  }
}
