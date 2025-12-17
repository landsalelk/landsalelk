import { Client, Databases, Query } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.DATABASE_ID;
const COLLECTIONS = {
    LISTINGS: 'listings'
};

// Default expiry: 60 days
const EXPIRY_DAYS = parseInt(process.env.LISTING_EXPIRY_DAYS || '60');

/**
 * Listing Expiry Check Function
 * Runs daily to mark old listings as expired/inactive
 */
export default async function main({ req, res, log, error }) {
    log('Starting listing expiry check...');

    try {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() - EXPIRY_DAYS);

        // Find active listings older than expiry threshold
        const expiredListings = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [
                Query.equal('status', 'active'),
                Query.lessThan('$createdAt', expiryDate.toISOString()),
                Query.limit(100)
            ]
        );

        log(`Found ${expiredListings.documents.length} listings to expire`);

        let expiredCount = 0;

        for (const listing of expiredListings.documents) {
            try {
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.LISTINGS,
                    listing.$id,
                    {
                        status: 'expired',
                        expired_at: new Date().toISOString()
                    }
                );
                expiredCount++;
                log(`Expired listing: ${listing.$id} - ${listing.title}`);
            } catch (e) {
                error(`Failed to expire listing ${listing.$id}: ${e.message}`);
            }
        }

        return res.json({
            success: true,
            checked: expiredListings.documents.length,
            expired: expiredCount,
            threshold_days: EXPIRY_DAYS,
            timestamp: new Date().toISOString()
        });

    } catch (e) {
        error(`Fatal error: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
}
