'use server';

import { Client, Databases, ID, Permission, Role, Account } from 'node-appwrite';
import { generatePayHereHash } from '@/lib/payhere';

// Initialize Admin Client (Server Side Only)
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
        console.error("Decline Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Initiates the payment process for hiring the agent.
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
        console.error("Hiring Init Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Claims the listing for the target user (Self-Service).
 * @param {string} listingId
 * @param {string} secret
 * @param {string} jwt - The JWT for the user session (required for security)
 */
export async function claimListing(listingId, secret, jwt) {
    const { getDatabases } = createAdminClient();
    const databases = getDatabases();

    try {
        // Verify User Identity using JWT
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
                console.log(`Awarded 1 point to agent ${agentId} for DIY claim`);
            } catch (agentErr) {
                console.warn('Could not update agent points:', agentErr.message);
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
        console.error("Claim Error:", error);
        return { success: false, error: error.message };
    }
}
