
import { Client, Databases, Functions, ID, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
    try {
        const body = JSON.parse(req.body || '{}');
        const { phone } = body;

        if (!phone) {
            return res.json({ success: false, error: 'Phone number is required' }, 400);
        }

        // Initialize Clients
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);
        const functions = new Functions(client);
        const DATABASE_ID = 'main';
        const COLLECTION_ID = 'phone_verifications';

        // Format phone (simple check)
        let formattedPhone = phone.replace(/\s+/g, '').replace(/-/g, '').replace('+', '');
        // Assuming user sends full number or local. Consistency handled in send-sms, but here we need consistency for DB.
        // Let's assume frontend sends formatted or we basic format.

        // Generate 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins

        // Store OTP
        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                phone: formattedPhone,
                code: code,
                expires_at: expiresAt,
                attempts: 0
            }
        );

        log(`OTP generated for ${formattedPhone}: ${code}`);

        // Trigger SMS Function
        try {
            await functions.createExecution(
                'send-sms',
                JSON.stringify({
                    phone: formattedPhone,
                    message: `Your Landsale.lk verification code is: ${code}`,
                    related_to: doc.$id,
                    related_type: 'otp_verification'
                }),
                true // Async trigger
            );
        } catch (smsError) {
            error(`Failed to trigger SMS: ${smsError.message}`);
            // Don't fail the request, users can click resend if sms fails.
        }

        return res.json({
            success: true,
            message: 'OTP sent',
            verificationId: doc.$id
        });

    } catch (err) {
        error(err.message);
        return res.json({ success: false, error: err.message }, 500);
    }
};
