import { Client, Databases, Query, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const DATABASE_ID = 'landsalelkdb';
    const LISTINGS_COLLECTION_ID = 'listings';
    const BIDS_COLLECTION_ID = 'bids';

    if (req.method !== 'POST') {
        return res.json({ success: false, message: 'Method not allowed' }, 405);
    }

    try {
        const payload = JSON.parse(req.body);
        const { property_id, amount, user_id } = payload;

        if (!property_id || !amount || !user_id) {
            throw new Error('Missing required fields: property_id, amount, or user_id');
        }

        // 1. Get Property
        const property = await databases.getDocument(
            DATABASE_ID,
            LISTINGS_COLLECTION_ID,
            property_id
        );

        // 2. Get Highest Bid
        const highestBids = await databases.listDocuments(
            DATABASE_ID,
            BIDS_COLLECTION_ID,
            [
                Query.equal('property_id', property_id),
                Query.orderDesc('amount'),
                Query.limit(1)
            ]
        );

        const highestBid = highestBids.documents[0];
        const currentMax = highestBid ? highestBid.amount : (property.price || 0);

        // Validate bid amount (Must be strictly greater than current max)
        // In a real auction, we'd enforce increment steps (e.g., +1000)
        if (amount <= currentMax) {
            return res.json({
                success: false,
                message: `Bid must be higher than ${currentMax}`
            }, 400);
        }

        // 3. Place Bid
        const bid = await databases.createDocument(
            DATABASE_ID,
            BIDS_COLLECTION_ID,
            ID.unique(),
            {
                property_id,
                user_id,
                amount: parseFloat(amount),
                status: 'active',
                timestamp: new Date().toISOString()
            }
        );

        log(`New bid placed: ${amount} for property ${property_id} by ${user_id}`);

        return res.json({ success: true, bid });

    } catch (err) {
        error(err.message);
        return res.json({ success: false, message: err.message }, 500);
    }
};
