'use server';

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import { generatePayHereHash } from '@/lib/payhere';

// Initialize Admin Client (Server-Side Only)
const createAdminClient = () => {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY); // Must have API Key with Write permissions

    return {
        getDatabases: () => new Databases(client)
    };
};

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';
const COLLECTION_LISTINGS = 'listings';

/**
 * Validates the listing token and performs the decline action.
 * @param {string} listingId - The listing ID.
 * @param {string} secret - The verification token.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function declineListing(listingId, secret) {
    if (!listingId || !secret) {
        return { success: false, error: "Missing required parameters" };
    }

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
        return { success: false, error: error.message };
    }
}

/**
 * Initiates the payment process for hiring the agent.
 * @param {string} listingId - The listing ID.
 * @param {string} secret - The verification token.
 * @param {number} amount - The amount to pay.
 * @returns {Promise<{success: boolean, paymentParams?: object, error?: string}>}
 */
export async function initiateAgentHiring(listingId, secret, amount) {
    if (!listingId || !secret || !amount) {
        return { success: false, error: "Missing required parameters" };
    }

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
        return { success: false, error: error.message };
    }
}

/**
 * Claims the listing for the target user (Self-Service).
 * @param {string} listingId - The ID of the listing document.
 * @param {string} secret - The verification token to validate ownership.
 * @param {string} userId - The ID of the user claiming the listing.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function claimListing(listingId, secret, userId) {
    if (!listingId || !secret || !userId) {
        return { success: false, error: "Missing required parameters" };
    }

    const { getDatabases } = createAdminClient();
    const databases = getDatabases();

    try {
        const listing = await databases.getDocument(DB_ID, COLLECTION_LISTINGS, listingId);

        if (listing.verification_code !== secret) {
            throw new Error("Invalid Token");
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
                // Failed to update agent points.
                // We ignore this to ensure the primary ownership transfer succeeds.
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
        return { success: false, error: error.message };
    }
}
