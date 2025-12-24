// Send SMS Function using text.lk API with logging
// API Documentation: https://app.text.lk/developers/docs

import { Client, Databases, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
    try {
        const body = JSON.parse(req.body || '{}');
        const { phone, message, related_to, related_type } = body;

        if (!phone || !message) {
            return res.json({
                success: false,
                error: 'Phone number and message are required'
            }, 400);
        }

        // text.lk API credentials
        const API_TOKEN = process.env.TEXT_LK_API_TOKEN;
        const API_ENDPOINT = 'https://app.text.lk/api/v3/sms/send';

        if (!API_TOKEN) {
            error('TEXT_LK_API_TOKEN is not configured');
            return res.json({
                success: false,
                error: 'SMS configuration missing'
            }, 500);
        }

        // Format phone number (ensure it has country code)
        let formattedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '94' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('94') && !formattedPhone.startsWith('+94')) {
            formattedPhone = '94' + formattedPhone;
        }
        formattedPhone = formattedPhone.replace('+', '');

        log(`Sending SMS to: ${formattedPhone}`);

        // Initialize Appwrite for logging
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);
        const DATABASE_ID = process.env.DATABASE_ID || 'landsalelkdb';

        // Send SMS via text.lk API
        let smsResponse = null;
        let smsStatus = 'pending';
        let errorMessage = null;

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    recipient: formattedPhone,
                    sender_id: 'Landsale.lk',
                    message: message
                })
            });

            smsResponse = await response.json();
            log(`API Response: ${JSON.stringify(smsResponse)}`);

            if (response.ok && (smsResponse.status === 'success' || smsResponse.data)) {
                smsStatus = 'sent';
                log(`SMS sent successfully to ${formattedPhone}`);
            } else {
                smsStatus = 'failed';
                errorMessage = smsResponse.message || JSON.stringify(smsResponse);
                error(`SMS failed: ${errorMessage}`);
            }
        } catch (apiError) {
            smsStatus = 'failed';
            errorMessage = apiError.message;
            error(`SMS API error: ${errorMessage}`);
        }

        // Log SMS attempt to database
        try {
            await databases.createDocument(
                DATABASE_ID,
                'sms_logs',
                ID.unique(),
                {
                    phone: formattedPhone,
                    message: message.substring(0, 500),
                    status: smsStatus,
                    provider: 'textlk',
                    response_code: smsResponse?.status || null,
                    error_message: errorMessage,
                    related_to: related_to || null,
                    related_type: related_type || null
                }
            );
            log('SMS log recorded in database');
        } catch (logError) {
            error(`Failed to log SMS: ${logError.message}`);
        }

        // Log activity
        try {
            await databases.createDocument(
                DATABASE_ID,
                'activity_logs',
                ID.unique(),
                {
                    action: smsStatus === 'sent' ? 'sms_sent' : 'sms_failed',
                    entity_type: related_type || 'sms',
                    entity_id: related_to || null,
                    details: JSON.stringify({
                        phone: formattedPhone,
                        status: smsStatus,
                        error: errorMessage
                    })
                }
            );
        } catch (activityError) {
            error(`Failed to log activity: ${activityError.message}`);
        }

        if (smsStatus === 'sent') {
            return res.json({
                success: true,
                message: 'SMS sent successfully',
                message_id: smsResponse?.data?.id || null
            });
        } else {
            return res.json({
                success: false,
                error: errorMessage || 'Failed to send SMS'
            }, 500);
        }
    } catch (err) {
        error(`Send SMS error: ${err.message}`);
        return res.json({
            success: false,
            error: err.message
        }, 500);
    }
};
