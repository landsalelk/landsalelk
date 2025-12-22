'use server';

import { Client, Functions } from "node-appwrite";

// Note: Server Actions run on the server, so we can use node-appwrite and process.env securely.
// But we need to initialize a new Client with API KEY to have permission to execute functions.

const createAdminClient = () => {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    return {
        get functions() {
            return new Functions(client);
        }
    };
};

/**
 * Send an SMS via the send-sms Appwrite Function
 *
 * @param {string} phone - Recipient phone number
 * @param {string} message - SMS message content
 * @param {string} relatedTo - ID of the related entity (listing, user, etc.)
 * @param {string} relatedType - Type of the related entity ('listing', 'user', 'system')
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function sendSMS(phone, message, relatedTo = null, relatedType = 'system') {
    if (!phone || !message) {
        return { success: false, error: 'Phone and message are required' };
    }

    try {
        const { functions } = createAdminClient();

        // Execute the send-sms function
        // Function ID is 'send-sms' based on appwrite.json
        const execution = await functions.createExecution(
            'send-sms',
            JSON.stringify({
                phone,
                message,
                related_to: relatedTo,
                related_type: relatedType
            })
        );

        if (execution.status === 'completed') {
            const responseBody = JSON.parse(execution.responseBody);
            if (responseBody.success) {
                return { success: true, message: 'SMS sent successfully' };
            } else {
                return { success: false, error: responseBody.error || 'SMS provider returned error' };
            }
        } else {
             // Status could be 'processing', 'failed', 'waiting'
             if (execution.status === 'failed') {
                 console.error("SMS Function Failed:", execution.stderr);
                 return { success: false, error: 'SMS function execution failed' };
             }
             // For async functions, it might return 'processing'
             return { success: true, message: 'SMS queued for sending' };
        }

    } catch (error) {
        console.error("SMS Send Error:", error);
        return { success: false, error: error.message };
    }
}
