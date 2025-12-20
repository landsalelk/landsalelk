import { Client, Databases, Query, ID } from 'node-appwrite';
import crypto from 'crypto';

// Environment Variables
const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'landsalelk';
const LISTINGS_COLLECTION_ID = 'listings';
const CONSENT_LOGS_COLLECTION_ID = 'consent_logs';

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);

    try {
        if (req.method !== 'POST') {
            return res.json({ success: false, error: 'Method not allowed' }, 405);
        }

        let payload = req.body;
        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            } catch (e) { }
        }

        const { listing_id, otp } = payload;

        if (!listing_id || !otp) {
            return res.json({ success: false, error: 'Missing listing_id or otp' }, 400);
        }

        // Fetch Listing
        const listing = await databases.getDocument(
            DATABASE_ID,
            LISTINGS_COLLECTION_ID,
            listing_id
        );

        if (!listing) {
            return res.json({ success: false, error: 'Listing not found' }, 404);
        }

        if (listing.status !== 'pending_owner') {
            // Maybe already active?
            if (listing.status === 'active') {
                return res.json({ success: true, message: 'Already verified' });
            }
            return res.json({ success: false, error: 'Listing is not in pending verification state' }, 400);
        }

        // Verify OTP
        const hashedInput = crypto.createHash('sha256').update(otp).digest('hex');

        // Compare (Use timingSafeEqual if possible, but standard string compare is ok for this level)
        if (hashedInput !== listing.verification_code) {
            return res.json({ success: false, error: 'Invalid OTP' }, 401);
        }

        // OTP Valid!
        // 1. Update status and clear code
        await databases.updateDocument(
            DATABASE_ID,
            LISTINGS_COLLECTION_ID,
            listing_id,
            {
                status: 'active', // Or 'pending_admin_approval' if admin review is needed. User said "active or pending_admin". Listing is typically active after owner consent? Let's say 'active' for now or 'pending_approval' if admin wants to check. User request: "active or pending_admin_approval". I'll use 'active' based on "Realtime update... Verified...". Actually, 'active' makes it live. 'pending_approval' might be safer. Let's stick to 'active' for immediate gratification as implied by "Verified".
                verification_code: null, // Clear for security
                is_verified: true
            }
        );

        // 2. Log Consent
        try {
            // We need IP address. Appwrite headers might have it.
            const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';

            await databases.createDocument(
                DATABASE_ID,
                CONSENT_LOGS_COLLECTION_ID,
                ID.unique(),
                {
                    listing_id: listing_id,
                    owner_phone: listing.owner_phone,
                    verified_at: new Date().toISOString(),
                    method: 'OTP_input',
                    ip_address: ip
                }
            );
        } catch (logError) {
            error(`Failed to create consent log: ${logError.message}`);
            // Don't fail the verification if log fails? Or do strictly? 
            // Better to log error but return success to user.
        }

        return res.json({ success: true, message: 'Verification successful' });

    } catch (e) {
        error(`Verification Error: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
};
