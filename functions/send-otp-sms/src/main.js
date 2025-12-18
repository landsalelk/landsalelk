import { Client, Databases } from 'node-appwrite';
import twilio from 'twilio';
import crypto from 'crypto';

// Environment Variables
const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'landsalelk';
const LISTINGS_COLLECTION_ID = 'listings';

// Twilio Config
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
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

        // Update Listing with token
        await databases.updateDocument(
            DATABASE_ID,
            LISTINGS_COLLECTION_ID,
            listingId,
            {
                verification_code: token, // Reusing this field for the token
                status: 'pending_owner'
            }
        );

        // Construct Link
        // Assuming the site is hosted at https://landsale.lk (or use ENV if available)
        const siteUrl = process.env.SITE_URL || 'https://landsale.lk';
        const link = `${siteUrl}/verify-owner/${listingId}?secret=${token}`;

        // Send SMS via Twilio
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
            const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

            let messageBody = `Landsale.lk: ${agentName} has listed your property "${title}" for Rs. ${price}.`;
            if (serviceFee > 0) {
                messageBody += ` Review proposal (Fee: LKR ${serviceFee}): ${link}`;
            } else {
                messageBody += ` Review & Publish for FREE: ${link}`;
            }

            await twilioClient.messages.create({
                body: messageBody,
                from: TWILIO_PHONE_NUMBER,
                to: ownerPhone
            });

            log(`Verification Link sent to ${ownerPhone}`);
        } else {
            error('Twilio credentials missing. SMS not sent.');
        }

        return res.json({ success: true, message: 'Link sent' });

    } catch (e) {
        error(`Failed to send Link: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
};
