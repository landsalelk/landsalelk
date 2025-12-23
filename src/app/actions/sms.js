'use server';

import { functions } from '@/lib/server/appwrite';

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
    try {
        if (!phone || !message) {
            throw new Error('Phone and message are required');
        }

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
                 return { success: false, error: 'SMS function execution failed' };
             }
             // For async functions, it might return 'processing'
             return { success: true, message: 'SMS queued for sending' };
        }

    } catch (error) {
        return { success: false, error: error.message };
    }
}
