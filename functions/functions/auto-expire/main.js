// Auto-Expire Listings Function
// Runs daily via CRON to expire old listings

export default async ({ req, res, log, error }) => {
    try {
        const { Client, Databases, Query } = await import('node-appwrite');

        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);
        const DATABASE_ID = 'main';
        const COLLECTIONS = { PROPERTIES: 'properties' };

        // Get listings older than 30 days that are still published
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const expiredListings = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PROPERTIES,
            [
                Query.equal('status', 'published'),
                Query.lessThan('$createdAt', thirtyDaysAgo.toISOString()),
                Query.limit(100)
            ]
        );

        log(`Found ${expiredListings.total} listings to expire`);

        let expiredCount = 0;
        for (const listing of expiredListings.documents) {
            try {
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.PROPERTIES,
                    listing.$id,
                    { status: 'expired' }
                );
                expiredCount++;
                log(`Expired listing: ${listing.$id} - ${listing.title}`);
            } catch (err) {
                error(`Failed to expire ${listing.$id}: ${err.message}`);
            }
        }

        return res.json({
            success: true,
            message: `Expired ${expiredCount} listings`,
            total_checked: expiredListings.total
        });
    } catch (err) {
        error(`Auto-expire function error: ${err.message}`);
        return res.json({ success: false, error: err.message }, 500);
    }
};
