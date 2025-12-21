import { Client, Databases, Functions } from 'node-appwrite';
import crypto from 'crypto';

// Environment Variables
const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'landsalelkdb';
const LISTINGS_COLLECTION_ID = 'listings';
const SEND_SMS_FUNCTION_ID = 'send-sms'; // Function ID for the send-sms function

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);
    const functions = new Functions(client);

    try {
        let payload = req.body;
        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            } catch (e) {
                // If parsing fails, it might be raw string.
            }
        }

        log(`Received payload: ${JSON.stringify(payload)}`);

        const listingId = payload.$id;
        const ownerPhone = payload.owner_phone;
        const title = payload.title;
        const price = payload.price;
        const agentId = payload.agent_id;
        const serviceFee = payload.service_fee || 0;

        if (!listingId || !ownerPhone) {
            log('Missing listing ID or owner phone. Skipping.');
            return res.json({ success: false, message: 'Missing required fields' });
        }

        // Fetch Agent Name
        let agentName = 'Our Agent';
        try {
            if (agentId) {
                const agentDoc = await databases.getDocument(DATABASE_ID, 'agents', agentId);
                agentName = agentDoc.name || 'Our Agent';
            }
        } catch (e) {
            log(`Could not fetch agent details: ${e.message}`);
        }

        // Generate Secure Token (UUID v4 or random hex)
        const token = crypto.randomBytes(16).toString('hex');

        // Calculate expiry (72 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 72);

        // Update Listing with token and expiry
        await databases.updateDocument(
            DATABASE_ID,
            LISTINGS_COLLECTION_ID,
            listingId,
            {
                verification_code: token,
                status: 'pending_owner',
                verification_expires_at: expiresAt.toISOString()
            }
        );

        // Construct Link
        const siteUrl = process.env.SITE_URL || 'https://landsale.lk';
        const link = `${siteUrl}/verify-owner/${listingId}?secret=${token}`;

        // Build SMS message
        let messageBody = `Landsale.lk: ${agentName} has listed your property "${title}" for Rs. ${price}.`;
        if (serviceFee > 0) {
            messageBody += ` Review proposal (Fee: LKR ${serviceFee}): ${link}`;
        } else {
            messageBody += ` Review & Publish for FREE: ${link}`;
        }

        // Send SMS via 'send-sms' function execution
        try {
            log(`Triggering send-sms for ${ownerPhone}`);
            const execution = await functions.createExecution(
                SEND_SMS_FUNCTION_ID,
                JSON.stringify({
                    phone: ownerPhone,
                    message: messageBody,
                    related_to: listingId,
                    related_type: 'listing_verification'
                }),
                false // Async execution to avoid timeout issues waiting for external API
            );

            log(`SMS function execution triggered: ${execution.$id}`);
            return res.json({ success: true, message: 'Verification link sent', executionId: execution.$id });

        } catch (smsError) {
            error(`Failed to trigger SMS function: ${smsError.message}`);
            // Even if SMS notification fails, the token is generated, so we might return success or partial success.
            // But for user feedback, maybe 500 is better if it's critical.
            return res.json({ success: false, error: 'Failed to send SMS notification' }, 500);
        }

    } catch (e) {
        error(`Failed to send Link: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
};
