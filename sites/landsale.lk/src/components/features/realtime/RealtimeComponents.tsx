'use client'

import { useEffect } from 'react'
import { Bell, Home, Heart, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import {
    useRealtimeListings,
    useRealtimeNotifications,
    useRealtimeFavorites,
    useRealtimeOffers
} from '@/hooks/useAppwriteRealtime'
import { useAuth } from '@/components/ai-chat/hooks/useAuth'

/**
 * Component that shows realtime notifications toast
 * Place this in your layout to get live updates
 */
export function RealtimeNotificationToast() {
    const { user } = useAuth()

    // Subscribe to new listings
    const { lastEvent: listingEvent, isConnected: listingsConnected } = useRealtimeListings(
        (newListing) => {
            // Show toast for new listings
            toast.success('New Property Listed!', {
                description: newListing.title?.substring(0, 50) + '...',
                icon: <Home className="w-4 h-4" />,
                action: {
                    label: 'View',
                    onClick: () => window.location.href = `/property/${newListing.slug}`
                }
            })
        }
    )

    // Subscribe to user notifications if logged in
    const { notifications, unreadCount, isConnected: notificationsConnected } = useRealtimeNotifications(
        user?.$id || ''
    )

    // Show notification toast for new notifications
    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0]
            toast.info(latest.title, {
                description: latest.message,
                icon: <Bell className="w-4 h-4" />
            })
        }
    }, [notifications])

    // Debug: Show connection status in console
    useEffect(() => {
        if (listingsConnected) {
            console.log('🟢 Realtime: Connected to listings')
        }
        if (notificationsConnected) {
            console.log('🟢 Realtime: Connected to notifications')
        }
    }, [listingsConnected, notificationsConnected])

    // This component doesn't render anything visible
    return null
}

/**
 * Component that shows a live favorite count
 */
export function LiveFavoriteCount({
    listingId,
    initialCount = 0
}: {
    listingId: string
    initialCount?: number
}) {
    const { favoriteCount } = useRealtimeFavorites(listingId)

    // Use realtime count if available, otherwise initial
    const count = favoriteCount || initialCount

    return (
        <div className="flex items-center gap-1 text-sm text-gray-500">
            <Heart className="w-4 h-4" />
            <span>{count}</span>
        </div>
    )
}



/**
 * Component that shows live bid/offer updates
 */
export function LiveBidTracker({
    listingId,
    currentPrice
}: {
    listingId: string
    currentPrice: number
}) {
    const { offers, highestBid, lastOffer } = useRealtimeOffers(listingId)

    // Show animation when new bid comes in
    useEffect(() => {
        if (lastOffer) {
            toast.success('New Bid!', {
                description: `LKR ${lastOffer.offer_amount?.toLocaleString()}`,
                icon: <span className="text-lg">🔨</span>
            })
        }
    }, [lastOffer])

    const displayPrice = highestBid > currentPrice ? highestBid : currentPrice

    return (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg">
            <div className="text-sm opacity-80">Current Highest Bid</div>
            <div className="text-2xl font-bold">
                LKR {displayPrice.toLocaleString()}
            </div>
            {offers.length > 0 && (
                <div className="text-sm mt-2 opacity-80">
                    {offers.length} bid(s) placed
                </div>
            )}
        </div>
    )
}



/**
 * Connection status indicator
 */
export function RealtimeStatus() {
    const { isConnected } = useRealtimeListings()

    return (
        <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-500">
                {isConnected ? 'Live' : 'Connecting...'}
            </span>
        </div>
    )
}

/**
 * Notification badge with live count
 */
export function NotificationBadge() {
    const { user } = useAuth()
    const { unreadCount } = useRealtimeNotifications(user?.$id || '')

    if (unreadCount === 0) return null

    return (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
        </span>
    )
}

export default {
    RealtimeNotificationToast,
    LiveFavoriteCount,
    LiveBidTracker,
    RealtimeStatus,
    NotificationBadge
}
