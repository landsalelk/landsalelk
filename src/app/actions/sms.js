'use server';

import { sendSMS as sendSMSService } from "@/lib/sms";

/**
 * Send an SMS via Server Action
 *
 * @param {string} phone - Recipient phone number
 * @param {string} message - SMS message content
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function sendSMS(phone, message) {
    if (!phone || !message) {
        return { success: false, error: 'Phone and message are required' };
    }

    try {
        return await sendSMSService(phone, message);
    } catch (error) {
        console.error("SMS Send Error:", error);
        return { success: false, error: error.message };
    }
}
