
/**
 * Notification Utilities
 * 
 * Provides email and push notification capabilities by calling Appwrite Functions.
 */

import { account, functions } from '@/lib/appwrite';

const FUNCTION_SEND_EMAIL = 'send-email';

/**
 * Send transactional email via Appwrite Function
 * @param {string} type - Template type: 'payment_success', 'listing_approved', 'listing_rejected', 'kyc_approved', 'kyc_rejected'
 * @param {string} email - Recipient email
 * @param {Object} data - Template data (e.g., { name, amount, orderId, title, listingId, reason })
 */
export async function sendNotification(type, email, data = {}) {
    try {
        const result = await functions.createExecution(
            FUNCTION_SEND_EMAIL,
            JSON.stringify({ type, email, data }),
            false, // async
            '/',
            'POST',
            { 'Content-Type': 'application/json' }
        );
        // Notification sent successfully
        return { success: true, executionId: result.$id };
    } catch (error) {
        console.error('Notification Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send payment success notification
 */
export async function notifyPaymentSuccess(email, name, amount, orderId) {
    return sendNotification('payment_success', email, { name, amount, orderId });
}

/**
 * Send listing approval notification
 */
export async function notifyListingApproved(email, name, title, listingId) {
    return sendNotification('listing_approved', email, { name, title, listingId });
}

/**
 * Send listing rejection notification
 */
export async function notifyListingRejected(email, name, reason) {
    return sendNotification('listing_rejected', email, { name, reason });
}

/**
 * Send KYC approval notification
 */
export async function notifyKYCApproved(email, name) {
    return sendNotification('kyc_approved', email, { name });
}

/**
 * Send KYC rejection notification
 */
export async function notifyKYCRejected(email, name, reason) {
    return sendNotification('kyc_rejected', email, { name, reason });
}

/**
 * Request permission and subscribe to Push Notifications (Placeholder)
 */
export async function subscribeToPush() {
    try {
        if (!("Notification" in window)) {
            // Browser does not support notifications
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn("Notification permission denied");
            return false;
        }

        // TODO: Integrate with Appwrite Push Messaging
        // TODO: Integrate with Appwrite Push Messaging when ready
        return true;

    } catch (error) {
        console.error("Push Subscription Error:", error);
        return false;
    }
}
