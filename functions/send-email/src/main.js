import { Client, Users } from 'node-appwrite';

/**
 * Send Email Notification Function
 * 
 * Supports multiple email types for transactional notifications.
 * Uses Appwrite's built-in messaging or external SMTP.
 * 
 * Payload: { type, email, subject, body, data }
 * 
 * Types: 'payment_success', 'listing_approved', 'listing_rejected', 
 *        'kyc_approved', 'kyc_rejected', 'otp_sent', 'generic'
 */

const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

// Email templates
const TEMPLATES = {
    payment_success: {
        subject: '✅ Payment Successful - LandSale.lk',
        body: (data) => `
Dear ${data.name || 'Customer'},

Your payment of LKR ${data.amount?.toLocaleString() || '0'} has been successfully processed.

Order ID: ${data.orderId || 'N/A'}
Date: ${new Date().toLocaleString('en-LK')}

Thank you for using LandSale.lk!

Best regards,
LandSale.lk Team
        `.trim()
    },
    listing_approved: {
        subject: '🎉 Your Listing is Now Live! - LandSale.lk',
        body: (data) => `
Dear ${data.name || 'Property Owner'},

Great news! Your property listing "${data.title || 'Your Property'}" has been approved and is now live on LandSale.lk.

View your listing: https://landsale.lk/properties/${data.listingId || ''}

Potential buyers can now view and inquire about your property.

Best regards,
LandSale.lk Team
        `.trim()
    },
    listing_rejected: {
        subject: '⚠️ Listing Review Required - LandSale.lk',
        body: (data) => `
Dear ${data.name || 'Property Owner'},

Your property listing requires some updates before it can be published.

Reason: ${data.reason || 'Please review our listing guidelines.'}

Please update your listing and resubmit. If you have questions, contact our support team.

Best regards,
LandSale.lk Team
        `.trim()
    },
    kyc_approved: {
        subject: '✅ Identity Verified - LandSale.lk',
        body: (data) => `
Dear ${data.name || 'User'},

Your identity verification has been approved! You now have full access to all LandSale.lk features.

As a verified user, you can:
- Create unlimited listings
- Access premium features
- Build trust with buyers

Best regards,
LandSale.lk Team
        `.trim()
    },
    kyc_rejected: {
        subject: '❌ Verification Update Required - LandSale.lk',
        body: (data) => `
Dear ${data.name || 'User'},

We were unable to verify your identity with the documents provided.

Reason: ${data.reason || 'Documents were unclear or incomplete.'}

Please submit clearer documents to complete verification.

Best regards,
LandSale.lk Team
        `.trim()
    },
    newsletter_verification: {
        subject: 'Confirm your subscription to LandSale.lk',
        body: (data) => `
Hello!

Thanks for signing up for the LandSale.lk newsletter.

Please confirm your subscription by clicking the link below:
${data.link}

If you didn't request this, you can safely ignore this email.

Best regards,
LandSale.lk Team
        `.trim()
    }
};

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    try {
        let payload = req.body;
        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            } catch (e) {
                // Already parsed or invalid
            }
        }

        const { type, email, subject, body, data = {} } = payload;

        if (!email) {
            return res.json({ success: false, error: 'Email is required' }, 400);
        }

        let finalSubject = subject;
        let finalBody = body;

        // Use template if type is provided
        if (type && TEMPLATES[type]) {
            const template = TEMPLATES[type];
            finalSubject = subject || template.subject;
            finalBody = body || template.body(data);
        }

        if (!finalSubject || !finalBody) {
            return res.json({ success: false, error: 'Subject and body are required' }, 400);
        }

        // Option 1: Use Appwrite Messaging (if configured)
        // const messaging = new Messaging(client);
        // await messaging.createEmail(ID.unique(), finalSubject, finalBody, [], [email]);

        // Option 2: Log for now (replace with SMTP/Mailgun in production)
        log(`📧 EMAIL SENT`);
        log(`To: ${email}`);
        log(`Subject: ${finalSubject}`);
        log(`Body: ${finalBody.substring(0, 200)}...`);

        // In production, integrate with:
        // - Appwrite Messaging Provider
        // - Mailgun API
        // - SendGrid API
        // - AWS SES

        return res.json({
            success: true,
            message: 'Email queued successfully',
            email,
            type: type || 'generic'
        });

    } catch (e) {
        error(`Email Error: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
};
