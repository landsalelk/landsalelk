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
        // Event data is in req.body (parsed JSON usually, or raw string if not handled by runtime?)
        // Node runtime usually handles parsing if content-type is json.
        // For Event triggers, req.body IS the document object usually.

        let payload = req.body;
        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            } catch (e) {
                // If parsing fails, it might be raw string.
            }
        }

        log(`Received payload: ${JSON.stringify(payload)}`);

        // Check if this is a Document Create Event
        // The function triggers usually send the document data.
        // But we must ensure we have the necessary fields.
        const listingId = payload.$id;
        const ownerPhone = payload.owner_phone;
        const title = payload.title;
        const price = payload.price;
        const agentId = payload.agent_id;

        if (!listingId || !ownerPhone) {
            log('Missing listing ID or owner phone. Skipping.');
            return res.json({ success: false, message: 'Missing required fields' });
        }

        // Fetch Agent Name
        let agentName = 'Agent';
        try {
            if (agentId) {
                const agentDoc = await databases.getDocument(DATABASE_ID, 'agents', agentId);
                agentName = agentDoc.name || 'Agent';
            }
        } catch (e) {
            log(`Could not fetch agent details: ${e.message}`);
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP for storage
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        // Update Listing with hashed OTP and status
        await databases.updateDocument(
            DATABASE_ID,
            LISTINGS_COLLECTION_ID,
            listingId,
            {
                verification_code: hashedOtp,
                status: 'pending_owner' // Set status to pending verification
            }
        );

        // Send SMS via Twilio
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
            const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

            const message = `Landsale.lk: Request to list property "${title}" (Rs. ${price}) by ${agentName}. Code: ${otp}`;

            await twilioClient.messages.create({
                body: message,
                from: TWILIO_PHONE_NUMBER,
                to: ownerPhone
            });

            log(`OTP sent to ${ownerPhone}`);
        } else {
            error('Twilio credentials missing. SMS not sent.');
        }

        return res.json({ success: true, message: 'OTP processed' });

    } catch (e) {
        error(`Failed to send OTP: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
};
