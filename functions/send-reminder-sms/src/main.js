import { Client, Databases, Query } from 'node-appwrite';

// Environment Variables
const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'landsalelkdb';
const COLLECTION_LISTINGS = 'listings';

// Text.lk Config
const TEXT_LK_API_TOKEN = process.env.TEXT_LK_API_TOKEN;

if (!TEXT_LK_API_TOKEN) {
    console.error("Critical Error: TEXT_LK_API_TOKEN is missing.");
    throw new Error("API Token missing");
}
const TEXT_LK_SENDER_ID = process.env.TEXT_LK_SENDER_ID || 'LandSale';
const TEXT_LK_API_URL = 'https://app.text.lk/api/v3/sms/send';

/**
 * Send SMS via text.lk API
 */
async function sendSMS(recipient, message, log, error) {
    if (!TEXT_LK_API_TOKEN) {
        error('TEXT_LK_API_TOKEN is not configured');
        return { success: false, error: 'SMS credentials missing' };
    }

    try {
        const response = await fetch(TEXT_LK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TEXT_LK_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                recipient: recipient,
                sender_id: TEXT_LK_SENDER_ID,
                type: 'plain',
                message: message
            })
        });

        const data = await response.json();

        if (response.ok) {
            log(`SMS sent successfully to ${recipient}`);
            return { success: true, data };
        } else {
            error(`Text.lk API error: ${JSON.stringify(data)}`);
            return { success: false, error: data };
        }
    } catch (e) {
        error(`Failed to send SMS: ${e.message}`);
        return { success: false, error: e.message };
    }
}

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);

    try {
        const now = new Date();

        // Calculate window for 3 days from now
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(now.getDate() + 3);

        const threeDaysStart = threeDaysFromNow.toISOString();

        // Window end: 3 days + 24 hours (so we capture everything expiring on that specific 3rd day)
        const threeDaysEnd = new Date(threeDaysFromNow);
        threeDaysEnd.setHours(threeDaysEnd.getHours() + 24);
        const threeDaysEndIso = threeDaysEnd.toISOString();

        log(`Checking for listings expiring between ${threeDaysStart} and ${threeDaysEndIso}`);

        // Find listings expiring in exactly 3 days
        const expiringListings = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_LISTINGS,
            [
                Query.greaterThanEqual('expires_at', threeDaysStart),
                Query.lessThan('expires_at', threeDaysEndIso),
                Query.equal('status', 'active'),
                Query.limit(50) // Batch size
            ]
        );

        log(`Found ${expiringListings.documents.length} listings expiring soon.`);

        let sentCount = 0;
        let failCount = 0;

        for (const listing of expiringListings.documents) {
            if (!listing.owner_phone) {
                log(`Listing ${listing.$id} has no owner phone. Skipping.`);
                continue;
            }

            const title = listing.title;
            const expiryDate = new Date(listing.expires_at).toLocaleDateString('en-GB'); // DD/MM/YYYY
            const message = `Landsale.lk Alert: Your ad "${title}" expires on ${expiryDate}. Renew now to keep it active!`;

            const result = await sendSMS(listing.owner_phone, message, log, error);

            if (result.success) {
                sentCount++;
                // Optional: Mark as notified if we have a field for it
            } else {
                failCount++;
            }
        }

        return res.json({
            success: true,
            processed: expiringListings.documents.length,
            sent: sentCount,
            failed: failCount
        });

    } catch (e) {
        error(`Send Reminder SMS Error: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
};
