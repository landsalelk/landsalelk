'use server';

import { headers } from 'next/headers';
import { Client, Databases, Permission, Role, Account } from 'node-appwrite';
import { generatePayHereHash } from '@/lib/payhere';

// Initialize Admin Client (Server Side Only)
const createAdminClient = () => {
    // Check Env Vars
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
        throw new Error("Missing Appwrite Environment Variables");
    }

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
 *
 * @param {string} listingId - The listing ID.
 * @param {string} secret - The verification token.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function declineListing(listingId, secret) {
    if (!listingId || !secret) {
        return { success: false, error: "Missing required parameters" };
    }

    try {
        const { getDatabases } = createAdminClient();
        const databases = getDatabases();

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
        return { success: false, error: error.message || "Failed to decline" };
    }
}

/**
 * Initiates the payment process for hiring the agent.
 *
 * @param {string} listingId - The listing ID.
 * @param {string} secret - The verification token.
 * @param {number} amount - The service fee amount.
 * @returns {Promise<{success: boolean, paymentParams?: object, error?: string}>}
 */
export async function initiateAgentHiring(listingId, secret, amount) {
    if (!listingId || !secret || !amount) {
        return { success: false, error: "Missing required parameters" };
    }

    try {
        const { getDatabases } = createAdminClient();
        const databases = getDatabases();

        const headersList = await headers();
        const host = headersList.get('host');
        const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
        const protocol = isDev ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

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
                return_url: `${baseUrl}/verify-owner/${listingId}/success`,
                cancel_url: `${baseUrl}/verify-owner/${listingId}?secret=${secret}`,
                notify_url: `${baseUrl}/api/payhere/notify`, // Webhook
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
        return { success: false, error: error.message || "Failed to initiate hiring" };
    }
}

/**
 * Claims the listing for the target user (Self-Service).
 *
 * Verifies the listing token and the user's identity via JWT before transferring ownership.
 *
 * @param {string} listingId - The unique ID of the listing document.
 * @param {string} secret - The verification token (verification_code) sent to the owner.
 * @param {string} jwt - The Appwrite JWT for the current user session (required to verify identity).
 * @returns {Promise<{success: boolean, error?: string}>} Result of the claim operation.
 */
export async function claimListing(listingId, secret, jwt) {
    if (!listingId || !secret) {
        return { success: false, error: "Missing required parameters" };
    }

    try {
        const { getDatabases } = createAdminClient();
        const databases = getDatabases();

        // 1. Verify Listing Token First
        const listing = await databases.getDocument(DB_ID, COLLECTION_LISTINGS, listingId);

        if (listing.verification_code !== secret) {
            throw new Error("Invalid Token");
        }

        // 2. Verify User Identity using JWT
        if (!jwt) {
            throw new Error("User authentication required (missing JWT)");
        }

        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
            .setJWT(jwt);

        const account = new Account(client);
        const user = await account.get();
        const userId = user.$id;

        if (!userId) {
            throw new Error("Failed to verify user identity");
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
                // Silently fail for gamification updates to avoid blocking the main flow
            }
        }

        // Transfer Ownership Logic
        await databases.updateDocument(
            DB_ID,
            COLLECTION_LISTINGS,
            listingId,
            {
                user_id: userId,          // Set new owner ID (Schema requires user_id)
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
        // Handle Appwrite Errors explicitly
        if (error.code === 404) return { success: false, error: "Listing not found" };
        if (error.code === 401) return { success: false, error: "Unauthorized" };
        return { success: false, error: error.message || "Unknown error" };
    }
}
