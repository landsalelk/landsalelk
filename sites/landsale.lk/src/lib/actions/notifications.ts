"use server"

import { sendSMS, sendEmail } from "@/lib/actions/messaging"
import { createAdminClient, getCurrentUser, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { Query, ID } from "node-appwrite"

// Types
export type NotificationType =
    | "inquiry"
    | "favorite"
    | "price_drop"
    | "new_listing"
    | "message"
    | "review"
    | "system"
    | "saved_search"

export interface Notification {
    id: string
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
    isRead: boolean
    createdAt: string
    metadata?: Record<string, any>
}

export interface CreateNotificationData {
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
    metadata?: Record<string, any>
}

/**
 * Create an in-app notification for a user
 */
export async function createNotification(data: CreateNotificationData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const { databases } = await createAdminClient()

        // Note: We're using saved_searches collection temporarily
        // In production, create a dedicated COLLECTIONS.NOTIFICATIONS collection
        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS, // Assumes a COLLECTIONS.NOTIFICATIONS collection exists
            ID.unique(),
            {
                user_id: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link || "",
                is_read: false,
                metadata: JSON.stringify(data.metadata || {})
            }
        )

        return { success: true, id: doc.$id }
    } catch (error: any) {
        // If notifications collection doesn't exist, log and continue
        console.error("Error creating notification:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Get notifications for current user
 */
export async function getUserNotifications(limit: number = 20): Promise<Notification[]> {
    try {
        const user = await getCurrentUser()
        if (!user) return []

        const { databases } = await createAdminClient()

        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            [
                Query.equal("user_id", user.$id),
                Query.orderDesc("$createdAt"),
                Query.limit(limit)
            ]
        )

        return result.documents.map(doc => ({
            id: doc.$id,
            userId: doc.user_id,
            type: doc.type as NotificationType,
            title: doc.title,
            message: doc.message,
            link: doc.link,
            isRead: doc.is_read,
            createdAt: doc.$createdAt,
            metadata: doc.metadata ? JSON.parse(doc.metadata) : {}
        }))
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return []
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
    try {
        const user = await getCurrentUser()
        if (!user) return 0

        const { databases } = await createAdminClient()

        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            [
                Query.equal("user_id", user.$id),
                Query.equal("is_read", false),
                Query.limit(100)
            ]
        )

        return result.total
    } catch (error) {
        console.error("Error getting unread count:", error)
        return 0
    }
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false }

        const { databases } = await createAdminClient()

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            notificationId,
            { is_read: true }
        )

        return { success: true }
    } catch (error) {
        console.error("Error marking notification read:", error)
        return { success: false }
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<{ success: boolean; count: number }> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, count: 0 }

        const { databases } = await createAdminClient()

        const unread = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            [
                Query.equal("user_id", user.$id),
                Query.equal("is_read", false),
                Query.limit(100)
            ]
        )

        // Update each document
        await Promise.all(
            unread.documents.map(doc =>
                databases.updateDocument(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, doc.$id, { is_read: true })
            )
        )

        return { success: true, count: unread.documents.length }
    } catch (error) {
        console.error("Error marking all notifications read:", error)
        return { success: false, count: 0 }
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<{ success: boolean }> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false }

        const { databases } = await createAdminClient()
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, notificationId)

        return { success: true }
    } catch (error) {
        console.error("Error deleting notification:", error)
        return { success: false }
    }
}

/**
 * Notifies the seller that a potential buyer is interested.
 * Triggered when a buyer clicks "Call", "WhatsApp", or "Chat".
 */
export async function notifySellerOfInterest({
    sellerId,
    propertyTitle,
    propertyId,
    actionType // 'call' | 'whatsapp' | 'favorite'
}: {
    sellerId: string,
    propertyTitle: string,
    propertyId: string,
    actionType: 'call' | 'whatsapp' | 'favorite'
}) {
    if (!sellerId) return { success: false, error: "No seller ID" }

    try {
        const { users } = await createAdminClient()
        const seller = await users.get(sellerId)

        let message = ""
        let title = ""

        switch (actionType) {
            case 'call':
                title = "New Call Lead!"
                message = `A buyer just clicked to CALL you about "${propertyTitle}". Be ready!`
                break;
            case 'whatsapp':
                title = "WhatsApp Contact!"
                message = `A buyer is contacting you via WhatsApp about "${propertyTitle}".`
                break;
            case 'favorite':
                title = "Property Favorited!"
                message = `Someone just added your property "${propertyTitle}" to their favorites.`
                break;
        }

        // Create in-app notification
        await createNotification({
            userId: sellerId,
            type: actionType === 'favorite' ? 'favorite' : 'inquiry',
            title,
            message,
            link: `/properties/${propertyId}`,
            metadata: { propertyId, propertyTitle, actionType }
        })

        // Try SMS for high urgency actions
        if (seller.phone && ['call', 'whatsapp'].includes(actionType)) {
            const res = await sendSMS({ content: `LandSale: ${message}`, to: [sellerId] })
            if (res.success) return { success: true, method: 'sms' }
        }

        // Fallback to Email
        if (seller.email) {
            const subject = `New Interest in ${propertyTitle}`
            const htmlContent = `
                <div style="font-family: sans-serif; color: #333;">
                    <h2 style="color: #059669;">${title}</h2>
                    <p>${message}</p>
                    <p>View your listing analytics <a href="https://landsale.lk/dashboard/my-ads">here</a>.</p>
                </div>
            `
            const res = await sendEmail({ subject, content: htmlContent, to: [sellerId] })
            return res
        }

        return { success: true, method: 'in-app' }

    } catch (error: any) {
        console.error("Error notifying seller:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Send price drop notification to users who favorited a property
 */
export async function notifyPriceDrop({
    propertyId,
    propertyTitle,
    oldPrice,
    newPrice
}: {
    propertyId: string
    propertyTitle: string
    oldPrice: number
    newPrice: number
}): Promise<{ success: boolean; notified: number }> {
    try {
        const { databases } = await createAdminClient()

        // Get all users who favorited this property
        const favorites = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FAVORITES,
            [Query.equal("listing_id", propertyId), Query.limit(100)]
        )

        const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100)
        const message = `Price dropped by ${discount}%! "${propertyTitle}" is now Rs.${newPrice.toLocaleString()}`

        // Notify each user
        await Promise.all(
            favorites.documents.map(fav =>
                createNotification({
                    userId: fav.user_id,
                    type: 'price_drop',
                    title: '🔥 Price Drop Alert!',
                    message,
                    link: `/properties/${propertyId}`,
                    metadata: { propertyId, oldPrice, newPrice, discount }
                })
            )
        )

        return { success: true, notified: favorites.documents.length }
    } catch (error) {
        console.error("Error sending price drop notifications:", error)
        return { success: false, notified: 0 }
    }
}

/**
 * Send notification for new listings matching saved searches
 */
export async function notifyNewListingMatch({
    propertyId,
    propertyTitle,
    matchedSearchIds
}: {
    propertyId: string
    propertyTitle: string
    matchedSearchIds: string[]
}): Promise<{ success: boolean; notified: number }> {
    try {
        const { databases } = await createAdminClient()

        let notifiedCount = 0
        for (const searchId of matchedSearchIds) {
            try {
                const search = await databases.getDocument(DATABASE_ID, COLLECTIONS.SAVED_SEARCHES, searchId)

                await createNotification({
                    userId: search.user_id,
                    type: 'saved_search',
                    title: '🏠 New Match Found!',
                    message: `A new property "${propertyTitle}" matches your saved search "${search.name}"`,
                    link: `/properties/${propertyId}`,
                    metadata: { propertyId, searchId, searchName: search.name }
                })
                notifiedCount++
            } catch (e) {
                // Skip if search not found
            }
        }

        return { success: true, notified: notifiedCount }
    } catch (error) {
        console.error("Error sending new listing notifications:", error)
        return { success: false, notified: 0 }
    }
}
