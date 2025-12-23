'use server';

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import { generatePayHereHash } from '@/lib/payhere';
import logger from '@/lib/logger';

/**
 * Initializes the Appwrite Admin Client for server-side operations.
 * This client uses an API key with elevated permissions to perform actions
 * that regular client-side SDKs cannot, such as modifying user data or
 * bypassing security rules for administrative tasks.
 *
 * @returns {{getDatabases: function(): import('node-appwrite').Databases}} An object containing the Appwrite Databases service.
 */
const createAdminClient = () => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY); // Must have API Key with Write permissions

    return {
        getDatabases: () => new Databases(client)
    };
};

// The main database ID for the LandSale.lk application.
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';
// The collection ID for property listings.
const COLLECTION_LISTINGS = 'listings';

/**
 * Validates the listing token and performs the decline action.
 * @param {string} listingId The ID of the listing to decline.
 * @param {string} secret The verification token sent to the owner.
 * @returns {Promise<{success: boolean, error?: string}>} Object indicating success or failure.
 */
export async function declineListing(listingId, secret) {
    const { getDatabases } = createAdminClient();
    const databases = getDatabases();

    try {
        const listing = await databases.getDocument(DB_ID, COLLECTION_LISTINGS, listingId);

        if (listing.verification_code !== secret) {
            throw new Error("Invalid Token");
        }

        await databases.updateDocument(DB_ID, COLLECTION_LISTINGS, listingId, {
            status: 'rejected_by_owner',
            verification_code: null // Clear code
        });

        return { success: true };
    } catch (error) {
        logger.error("Decline Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Initiates the payment process for hiring the agent.
 * @param {string} listingId The ID of the listing.
 * @param {string} secret The verification token.
 * @param {number} amount The amount to be paid.
 * @returns {Promise<{success: boolean, error?: string, paymentParams?: object}>} Payment parameters or error.
 */
export async function initiateAgentHiring(listingId, secret, amount) {
    const { getDatabases } = createAdminClient();
    const databases = getDatabases();

    try {
        const listing = await databases.getDocument(DB_ID, COLLECTION_LISTINGS, listingId);

        if (listing.verification_code !== secret) {
            throw new Error("Invalid Token");
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
                email: "owner@example.com",
                phone: listing.owner_phone,
                address: "N/A",
                city: listing.location,
                country: "Sri Lanka"
            }
        };

    } catch (error) {
        logger.error("Hiring Init Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Claims the listing for the target user (Self-Service).
 * This function is critical for the "Do-It-Yourself" (DIY) owner verification flow.
 * When an agent creates a listing on behalf of an owner, a verification link containing
 * a secret token is sent to the owner. Clicking this link allows the owner to either
 * hire the agent or claim the listing themselves.
 *
 * This function handles the "claim" action. It verifies the secret token, reassigns
 * the listing to the new owner's `userId`, and awards a small point bonus to the
 * original agent for the successful referral (DIY claim).
 *
 * @param {string} listingId The ID of the listing to be claimed.
 * @param {string} secret The unique verification token sent to the owner.
 * @param {string} userId The Appwrite user ID of the new owner claiming the listing.
 * @returns {Promise<{success: boolean, error?: string}>} An object indicating success or failure.
 */
export async function claimListing(listingId, secret, userId) {
    // Index verification: The `verification_code` field in the `listings` collection
    // should be indexed to ensure efficient lookups.
    const { getDatabases } = createAdminClient();
    const databases = getDatabases();

    try {
        const listing = await databases.getDocument(DB_ID, COLLECTION_LISTINGS, listingId);

        if (listing.verification_code !== secret) {
            throw new Error("Invalid Token");
        }

        if (!userId) {
            throw new Error("User ID required to claim listing");
        }

        // Award points to agent who created the listing (DIY referral)
        const agentId = listing.agent_id;
        if (agentId) {
            try {
                const agent = await databases.getDocument(DB_ID, 'agents', agentId);
                await databases.updateDocument(DB_ID, 'agents', agentId, {
                    points: (agent.points || 0) + 1, // 1 point for DIY referral
                    listings_uploaded: (agent.listings_uploaded || 0) + 1
                });
            } catch (agentErr) {
                logger.warn('Could not update agent points:', agentErr.message);
            }
        }

        // Transfer Ownership Logic
        // 1. Update document data
        // 2. Update permissions so the new owner has write access

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
        logger.error("Claim Error:", error);
        return { success: false, error: error.message };
    }
}
