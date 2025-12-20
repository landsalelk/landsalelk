'use server';

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
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
 * @param {string} userId - The ID of the user claiming the listing (must be verified by caller or session)
 */
export async function claimListing(listingId, secret, userId) {
    // #region agent log
    try { const fs = require('fs'); const logPath = 'c:\\Users\\prabh\\Videos\\site-new\\.cursor\\debug.log'; fs.appendFileSync(logPath, JSON.stringify({location:'owner-verification.js:101',message:'claimListing entry',data:{listingId,secret:secret?'***':'null',userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n'); } catch(e){}
    // #endregion
    const { getDatabases } = createAdminClient();
    const databases = getDatabases();

    try {
        // #region agent log
        try { const fs2 = require('fs'); const logPath2 = 'c:\\Users\\prabh\\Videos\\site-new\\.cursor\\debug.log'; fs2.appendFileSync(logPath2, JSON.stringify({location:'owner-verification.js:106',message:'fetching listing',data:{listingId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n'); } catch(e){}
        // #endregion
        const listing = await databases.getDocument(DB_ID, COLLECTION_LISTINGS, listingId);
        // #region agent log
        try { const fs3 = require('fs'); const logPath3 = 'c:\\Users\\prabh\\Videos\\site-new\\.cursor\\debug.log'; fs3.appendFileSync(logPath3, JSON.stringify({location:'owner-verification.js:108',message:'listing fetched',data:{listingExists:!!listing,verificationCodeMatch:listing?.verification_code===secret},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n'); } catch(e){}
        // #endregion

        if (listing.verification_code !== secret) {
            // #region agent log
            try { const fs4 = require('fs'); const logPath4 = 'c:\\Users\\prabh\\Videos\\site-new\\.cursor\\debug.log'; fs4.appendFileSync(logPath4, JSON.stringify({location:'owner-verification.js:111',message:'verification code mismatch',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n'); } catch(e){}
            // #endregion
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
                console.log(`Awarded 1 point to agent ${agentId} for DIY claim`);
            } catch (agentErr) {
                console.warn('Could not update agent points:', agentErr.message);
            }
        }

        // Transfer Ownership Logic
        // 1. Update document data
        // 2. Update permissions so the new owner has write access

        // #region agent log
        try { const fs5 = require('fs'); const logPath5 = 'c:\\Users\\prabh\\Videos\\site-new\\.cursor\\debug.log'; fs5.appendFileSync(logPath5, JSON.stringify({location:'owner-verification.js:135',message:'updating listing',data:{listingId,userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n'); } catch(e){}
        // #endregion
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
        // #region agent log
        try { const fs6 = require('fs'); const logPath6 = 'c:\\Users\\prabh\\Videos\\site-new\\.cursor\\debug.log'; fs6.appendFileSync(logPath6, JSON.stringify({location:'owner-verification.js:152',message:'listing updated successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n'); } catch(e){}
        // #endregion

        return { success: true };

    } catch (error) {
        // #region agent log
        try { const fs7 = require('fs'); const logPath7 = 'c:\\Users\\prabh\\Videos\\site-new\\.cursor\\debug.log'; fs7.appendFileSync(logPath7, JSON.stringify({location:'owner-verification.js:157',message:'claimListing error',data:{error:error?.message,stack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n'); } catch(e){}
        // #endregion
        console.error("Claim Error:", error);
        return { success: false, error: error.message };
    }
}
