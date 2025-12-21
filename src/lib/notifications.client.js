'use client';

import { databases, account, Query, ID } from '@/appwrite';
import { DB_ID, COLLECTION_NOTIFICATIONS } from '@/appwrite/config';

/**
 * Fetch user's notifications
 */
export async function getNotifications(userId, limit = 20) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_NOTIFICATIONS,
            [
                Query.equal('user_id', userId),
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_NOTIFICATIONS,
            [
                Query.equal('user_id', userId),
                Query.equal('is_read', false)
            ]
        );
        return response.total;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId) {
    try {
        await databases.updateDocument(
            DB_ID,
            COLLECTION_NOTIFICATIONS,
            notificationId,
            { is_read: true }
        );
        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId) {
    try {
        const unread = await databases.listDocuments(
            DB_ID,
            COLLECTION_NOTIFICATIONS,
            [
                Query.equal('user_id', userId),
                Query.equal('is_read', false)
            ]
        );

        const promises = unread.documents.map(n =>
            databases.updateDocument(DB_ID, COLLECTION_NOTIFICATIONS, n.$id, { is_read: true })
        );

        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('Error marking all as read:', error);
        return false;
    }
}

/**
 * Create a notification
 */
export async function createNotification(userId, type, title, message, data = {}) {
    try {
        await databases.createDocument(
            DB_ID,
            COLLECTION_NOTIFICATIONS,
            ID.unique(),
            {
                user_id: userId,
                type,
                title,
                message,
                data: JSON.stringify(data),
                is_read: false
            }
        );
        return true;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId) {
    try {
        await databases.deleteDocument(DB_ID, COLLECTION_NOTIFICATIONS, notificationId);
        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        return false;
    }
}

/**
 * Notification types
 */
export const NotificationType = {
    OFFER_RECEIVED: 'offer_received',
    OFFER_ACCEPTED: 'offer_accepted',
    OFFER_REJECTED: 'offer_rejected',
    LISTING_APPROVED: 'listing_approved',
    LISTING_REJECTED: 'listing_rejected',
    MESSAGE_RECEIVED: 'message_received',
    PAYMENT_SUCCESS: 'payment_success',
    REVIEW_RECEIVED: 'review_received',
    KYC_APPROVED: 'kyc_approved',
    KYC_REJECTED: 'kyc_rejected'
};
