import { Client, Databases } from 'node-appwrite';
import crypto from 'crypto';

// Environment Variables
const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'landsalelkdb';
const LISTINGS_COLLECTION_ID = 'listings';

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

        // Send SMS via text.lk
        const smsResult = await sendSMS(ownerPhone, messageBody, log, error);

        if (smsResult.success) {
            log(`Verification Link sent to ${ownerPhone}`);
            return res.json({ success: true, message: 'Link sent' });
        } else {
            error(`Failed to send SMS: ${JSON.stringify(smsResult.error)}`);
            return res.json({ success: false, error: 'SMS delivery failed' }, 500);
        }

    } catch (e) {
        error(`Failed to send Link: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
};
