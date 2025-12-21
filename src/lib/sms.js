/**
 * Text.lk SMS Utility Library
 * 
 * A reusable SMS service for sending messages via text.lk API.
 * Can be used in both server-side and Appwrite functions.
 * 
 * @example
 * import { sendSMS, sendBulkSMS } from '@/lib/sms';
 * 
 * // Send single SMS
 * const result = await sendSMS('+94771234567', 'Hello from LandSale.lk!');
 * 
 * // Send bulk SMS
 * const bulkResult = await sendBulkSMS(['+94771234567', '+94772345678'], 'Bulk message');
 */

const TEXT_LK_API_URL = 'https://app.text.lk/api/v3/sms/send';

/**
 * Get text.lk configuration from environment
 */
function getConfig() {
    const apiToken = process.env.TEXT_LK_API_TOKEN || process.env.NEXT_PUBLIC_TEXT_LK_API_TOKEN || '2539|lJGD67Ptu3Gj6297q3rgouE2qA9daa7BHjmyxjQz096de7dc';
    const senderId = process.env.TEXT_LK_SENDER_ID || process.env.NEXT_PUBLIC_TEXT_LK_SENDER_ID || 'LandSale';

    return { apiToken, senderId };
}

/**
 * Send a single SMS message
 * 
 * @param {string} recipient - Phone number with country code (e.g., +94771234567)
 * @param {string} message - SMS message content
 * @param {Object} options - Optional configuration
 * @param {string} options.senderId - Override default sender ID
 * @param {string} options.scheduleTime - Schedule message (RFC3339 format: Y-m-d H:i)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function sendSMS(recipient, message, options = {}) {
    const { apiToken, senderId } = getConfig();

    if (!apiToken) {
        console.error('TEXT_LK_API_TOKEN is not configured');
        return { success: false, error: 'SMS credentials missing' };
    }

    try {
        const payload = {
            recipient: recipient,
            sender_id: options.senderId || senderId,
            type: 'plain',
            message: message
        };

        // Add schedule time if provided
        if (options.scheduleTime) {
            payload.schedule_time = options.scheduleTime;
        }

        const response = await fetch(TEXT_LK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
            console.error('Text.lk API error:', data);
            return { success: false, error: data.message || 'SMS delivery failed' };
        }
    } catch (error) {
        console.error('Failed to send SMS:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send SMS to multiple recipients
 * 
 * @param {string[]} recipients - Array of phone numbers
 * @param {string} message - SMS message content
 * @param {Object} options - Optional configuration
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function sendBulkSMS(recipients, message, options = {}) {
    const { apiToken, senderId } = getConfig();

    if (!apiToken) {
        console.error('TEXT_LK_API_TOKEN is not configured');
        return { success: false, error: 'SMS credentials missing' };
    }

    try {
        // text.lk accepts comma-separated recipients
        const recipientList = Array.isArray(recipients) ? recipients.join(',') : recipients;

        const payload = {
            recipient: recipientList,
            sender_id: options.senderId || senderId,
            type: 'plain',
            message: message
        };

        if (options.scheduleTime) {
            payload.schedule_time = options.scheduleTime;
        }

        const response = await fetch(TEXT_LK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
            console.error('Text.lk API error:', data);
            return { success: false, error: data.message || 'Bulk SMS delivery failed' };
        }
    } catch (error) {
        console.error('Failed to send bulk SMS:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send OTP verification SMS
 * 
 * @param {string} recipient - Phone number
 * @param {string} otp - OTP code
 * @param {number} expiryMinutes - OTP expiry time in minutes (default: 10)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function sendOTP(recipient, otp, expiryMinutes = 10) {
    const message = `Your LandSale.lk verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
    return sendSMS(recipient, message);
}

/**
 * Send property verification link to owner
 * 
 * @param {string} recipient - Owner's phone number
 * @param {Object} listing - Listing details
 * @param {string} listing.title - Property title
 * @param {number} listing.price - Property price
 * @param {string} listing.agentName - Agent name
 * @param {string} listing.verificationLink - Verification URL
 * @param {number} listing.serviceFee - Optional service fee
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function sendVerificationLink(recipient, listing) {
    let message = `Landsale.lk: ${listing.agentName} has listed your property "${listing.title}" for Rs. ${listing.price}.`;

    if (listing.serviceFee && listing.serviceFee > 0) {
        message += ` Review proposal (Fee: LKR ${listing.serviceFee}): ${listing.verificationLink}`;
    } else {
        message += ` Review & Publish for FREE: ${listing.verificationLink}`;
    }

    return sendSMS(recipient, message);
}

const smsService = {
    sendSMS,
    sendBulkSMS,
    sendOTP,
    sendVerificationLink
};

export default smsService;
