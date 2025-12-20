import { Client, Databases, Query } from 'node-appwrite';

/**
 * Expire Listings Function
 * 
 * Runs as a scheduled cron job (daily).
 * Checks 'listings' collection for expired records where status is still 'active'.
 * Updates them to 'expired'.
 */

const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'landsalelkdb';
const COLLECTION_LISTINGS = 'listings';

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);

    try {
        const now = new Date().toISOString();
        log(`Checking for expired listings at ${now}`);

        // 1. Find active listings passed their expiration date
        const expiredListings = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_LISTINGS,
            [
                Query.lessThan('expires_at', now),
                Query.equal('status', 'active'),
                Query.limit(50)
            ]
        );

        // 1b. Find pending_owner listings passed their verification expiry
        const expiredUnverifiedListings = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_LISTINGS,
            [
                Query.lessThan('verification_expires_at', now),
                Query.equal('status', 'pending_owner'),
                Query.limit(50)
            ]
        );

        const allExpiredDocs = [...expiredListings.documents, ...expiredUnverifiedListings.documents];

        log(`Found ${expiredListings.documents.length} expired active listings and ${expiredUnverifiedListings.documents.length} expired unverified listings`);

        let expiredCount = 0;
        let errorCount = 0;

        for (const listing of allExpiredDocs) {
            try {
                // Determine new status based on current status
                let newStatus = 'expired';
                if (listing.status === 'pending_owner') {
                    newStatus = 'expired_unverified';
                }

                // 2. Mark as expired
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTION_LISTINGS,
                    listing.$id,
                    {
                        status: newStatus,
                        is_boosted: false, // Remove boost if any
                        is_premium: false  // Remove premium if any
                    }
                );
                expiredCount++;
            } catch (updateErr) {
                error(`Failed to expire listing ${listing.$id}: ${updateErr.message}`);
                errorCount++;
            }
        }

        log(`Expired: ${expiredCount}, Errors: ${errorCount}`);

        return res.json({
            success: true,
            checked_at: now,
            expired_found: expiredListings.documents.length,
            expired_processed: expiredCount,
            errors: errorCount
        });

    } catch (e) {
        error(`Expire Listings Error: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
};
