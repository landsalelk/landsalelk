'use server';

import { databases, ID, Query } from '@/appwrite';
import { DB_ID, COLLECTION_AGENT_LEADS } from '@/appwrite/config';
import { sendOTP, sendSMS } from '@/lib/sms';
import { cookies } from 'next/headers';

// Temporary OTP storage (in production, use Redis or a dedicated collection)
const otpStore = new Map();

/**
 * Check if the user has a valid verification cookie
 */
export async function checkVerificationCookie() {
    try {
        const cookieStore = await cookies();
        return { verified: cookieStore.has('landsale_guest_verified') };
    } catch (error) {
        console.error('Error checking verification cookie:', error);
        return { verified: false };
    }
}

/**
 * Generate and send OTP to buyer's phone
 */
export async function sendLeadOTP(phone) {
    try {
        // Normalize phone number
        const normalizedPhone = normalizePhone(phone);

        if (!normalizedPhone) {
            return { success: false, error: 'Invalid phone number' };
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with expiry (10 minutes)
        otpStore.set(normalizedPhone, {
            otp,
            expires: Date.now() + 10 * 60 * 1000, // 10 minutes
            attempts: 0
        });

        // Send OTP via SMS
        const result = await sendOTP(normalizedPhone, otp);

        if (result.success) {
            return { success: true, message: 'OTP sent successfully' };
        } else {
            return { success: false, error: result.error || 'Failed to send OTP' };
        }
    } catch (error) {
        console.error('Error sending lead OTP:', error);
        return { success: false, error: 'Failed to send OTP' };
    }
}

/**
 * Verify OTP and create lead
 */
export async function verifyLeadOTP(phone, otp, listingId, listingTitle, sellerPhone, sellerName) {
    try {
        const normalizedPhone = normalizePhone(phone);

        if (!normalizedPhone) {
            return { success: false, error: 'Invalid phone number' };
        }

        // Get stored OTP
        const stored = otpStore.get(normalizedPhone);

        if (!stored) {
            return { success: false, error: 'OTP expired. Please request a new one.' };
        }

        // Check attempts
        if (stored.attempts >= 3) {
            otpStore.delete(normalizedPhone);
            return { success: false, error: 'Too many attempts. Please request a new OTP.' };
        }

        // Check expiry
        if (Date.now() > stored.expires) {
            otpStore.delete(normalizedPhone);
            return { success: false, error: 'OTP expired. Please request a new one.' };
        }

        // Verify OTP
        if (stored.otp !== otp) {
            stored.attempts++;
            return { success: false, error: 'Invalid OTP. Please try again.' };
        }

        // OTP verified - clear it
        otpStore.delete(normalizedPhone);

        // Fetch listing to get agent ID (user_id)
        let agentId = '';
        try {
            const listing = await databases.getDocument(
                DB_ID,
                'listings', // We need to import COLLECTION_LISTINGS if not available, or use literal
                listingId
            );
            agentId = listing.user_id;
        } catch (err) {
            console.error('Error fetching listing for lead generation:', err);
        }

        // Save lead to database
        try {
            await databases.createDocument(
                DB_ID,
                COLLECTION_AGENT_LEADS,
                ID.unique(),
                {
                    buyer_phone: normalizedPhone,
                    listing_id: listingId,
                    listing_title: listingTitle || 'Property Inquiry',
                    seller_phone: sellerPhone || '',
                    seller_name: sellerName || 'Seller',
                    status: 'new',
                    source: 'property_page',
                    agent_id: agentId, // Crucial for dashboard visibility
                    created_at: new Date().toISOString()
                }
            );
        } catch (dbError) {
            console.error('Error saving lead:', dbError);
            // Continue anyway - lead saving failure shouldn't block the user
        }

        // Notify seller via SMS
        if (sellerPhone) {
            try {
                const sellerMessage = `LandSale.lk: New lead! A buyer (${normalizedPhone}) is interested in your property "${listingTitle || 'your listing'}". Contact them soon!`;
                await sendSMS(sellerPhone, sellerMessage);
            } catch (smsError) {
                console.error('Error notifying seller:', smsError);
                // Continue anyway - notification failure shouldn't block the user
            }
        }

        // Set 30-day cookie
        try {
            const cookieStore = await cookies();
            cookieStore.set('landsale_guest_verified', 'true', {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: 'lax',
                path: '/'
            });
        } catch (cookieError) {
            console.error('Error setting verification cookie:', cookieError);
        }

        return {
            success: true,
            message: 'Phone verified successfully',
            verified: true
        };
    } catch (error) {
        console.error('Error verifying lead OTP:', error);
        return { success: false, error: 'Verification failed' };
    }
}

/**
 * Check if a phone was recently verified (within last 24 hours)
 * This uses localStorage on client side, this is just a helper
 */
export async function checkRecentVerification(phone) {
    // This will be handled client-side using localStorage
    return { verified: false };
}

/**
 * Normalize phone number to international format
 */
function normalizePhone(phone) {
    if (!phone) return null;

    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Handle Sri Lankan numbers
    if (cleaned.startsWith('0')) {
        cleaned = '+94' + cleaned.slice(1);
    } else if (cleaned.startsWith('94') && !cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+94' + cleaned;
    }

    // Validate length (Sri Lankan mobile: +94 7X XXX XXXX = 12 digits)
    if (cleaned.length < 10 || cleaned.length > 15) {
        return null;
    }

    return cleaned;
}
