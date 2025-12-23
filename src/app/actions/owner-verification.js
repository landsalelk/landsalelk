'use server';

import { Permission, Role } from 'node-appwrite';
import { databases } from '@/lib/server/appwrite';
import { DB_ID, COLLECTION_LISTINGS } from '@/appwrite/config';
import { generatePayHereHash } from '@/lib/payhere';

/**
 * Validates the listing token and performs the decline action.
 */
export async function declineListing(listingId, secret) {
    if (!databases) {
        return { success: false, error: 'Database service is not configured.' };
    }

    try {
        const listing = await databases.getDocument(DB_ID, COLLECTION_LISTINGS, listingId);

        if (listing.verification_code !== secret) {
            return { success: false, error: 'Invalid verification token.' };
        }

        await databases.updateDocument(DB_ID, COLLECTION_LISTINGS, listingId, {
            status: 'rejected_by_owner',
            verification_code: null // Clear code
        });

        return { success: true };
    } catch (error) {
        // Log the error for server-side inspection
        // console.error("Decline Listing Error:", error);

        // Return a generic error to the client
        if (error.code === 404) {
             return { success: false, error: 'Listing not found.' };
        }
        return { success: false, error: 'An unexpected error occurred. Please try again later.' };
    }
}

/**
 * Initiates the payment process for hiring the agent.
 */
export async function initiateAgentHiring(listingId, secret, amount) {
    if (!databases) {
        return { success: false, error: 'Database service is not configured.' };
    }

    try {
        const listing = await databases.getDocument(DB_ID, COLLECTION_LISTINGS, listingId);

        if (listing.verification_code !== secret) {
             return { success: false, error: 'Invalid verification token.' };
        }

        // Generate PayHere Params
        const orderId = `HIRE_${listingId}_${Date.now()}`;
        const currency = 'LKR';
        const hash = generatePayHereHash(orderId, amount, currency);

        return {
            success: true,
            paymentParams: {
                sandbox: process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true', // Check environment
                merchant_id: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID,
                return_url: `${process.env.SITE_URL}/verify-owner/${listingId}/success`,
                cancel_url: `${process.env.SITE_URL}/verify-owner/${listingId}?secret=${secret}`,
                notify_url: `${process.env.SITE_URL}/api/payhere/notify`, // Webhook
                order_id: orderId,
                items: `Agent Service Fee for ${listing.title}`,
                amount: amount,
                currency: currency,
                hash: hash,
                first_name: "Owner",
                last_name: "Verification",
                email: "owner@example.com", // This should be updated if we have owner email
                phone: listing.owner_phone,
                address: "N/A",
                city: listing.location,
                country: "Sri Lanka"
            }
        };

    } catch (error) {
        // console.error("Hiring Init Error:", error);
         if (error.code === 404) {
             return { success: false, error: 'Listing not found.' };
        }
        return { success: false, error: 'An unexpected error occurred while preparing payment.' };
    }
}

/**
 * Claims the listing for the target user (Self-Service).
 * @param {string} listingId
 * @param {string} secret
 * @param {string} userId - The ID of the user claiming the listing (must be verified by caller or session)
 */
export async function claimListing(listingId, secret, userId) {
    if (!databases) {
        return { success: false, error: 'Database service is not configured.' };
    }
    if (!userId) {
        return { success: false, error: 'User is not authenticated.' };
    }


    try {
        const listing = await databases.getDocument(DB_ID, COLLECTION_LISTINGS, listingId);

        if (listing.verification_code !== secret) {
            return { success: false, error: 'Invalid verification token.' };
        }

        // Award points to agent who created the listing (DIY referral)
        const agentId = listing.agent_id;
        if (agentId) {
            try {
                const agent = await databases.getDocument(DB_ID, 'agents', agentId);
                await databases.updateDocument(DB_ID, 'agents', agentId, {
                    points: (agent.points || 0) + 1, // 1 point for DIY referral
                });
            } catch (agentErr) {
                // Non-critical error, just log it. The claiming process should not fail.
                console.warn(`Could not update agent points for agent ${agentId}:`, agentErr.message);
            }
        }

        // Transfer Ownership Logic: Update document data and permissions
        await databases.updateDocument(
            DB_ID,
            COLLECTION_LISTINGS,
            listingId,
            {
                user_id: userId,          // Set new owner ID
                agent_id: null,           // Remove agent (already awarded points)
                status: 'active',         // Activate
                verification_code: null,  // Clear token
                is_claimed: true          // Flag as claimed
            },
            [
                Permission.read(Role.any()),                // Public can read
                Permission.update(Role.user(userId)),       // New Owner can update
                Permission.delete(Role.user(userId)),       // New Owner can delete
                Permission.read(Role.user(userId))          // New Owner can read
            ]
        );

        return { success: true };

    } catch (error) {
        // console.error("Claim Listing Error:", error);
        if (error.code === 404) {
             return { success: false, error: 'Listing not found.' };
        }
        return { success: false, error: 'An unexpected error occurred while claiming the listing.' };
    }
}
