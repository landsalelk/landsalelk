'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Client, RealtimeResponseEvent } from 'appwrite'
import { APPWRITE_CONFIG } from '@/lib/appwrite/config'

// Initialize Appwrite client for browser
const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)

const DATABASE_ID = APPWRITE_CONFIG.databaseId

// Types for realtime events
export type RealtimeEvent = 'create' | 'update' | 'delete'

export interface RealtimePayload<T = any> {
    event: RealtimeEvent
    document: T
    timestamp: Date
}

/**
 * Hook to subscribe to realtime updates for a collection
 * @param collectionId - The collection to subscribe to
 * @param documentId - Optional specific document ID
 * @param callback - Optional callback for each event
 */
export function useRealtimeCollection<T = any>(
    collectionId: string,
    documentId?: string,
    callback?: (payload: RealtimePayload<T>) => void
) {
    const [documents, setDocuments] = useState<T[]>([])
    const [lastEvent, setLastEvent] = useState<RealtimePayload<T> | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const unsubscribeRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        // Build channel string
        const channel = documentId
            ? `databases.${DATABASE_ID}.collections.${collectionId}.documents.${documentId}`
            : `databases.${DATABASE_ID}.collections.${collectionId}.documents`

        try {
            // Subscribe to realtime updates
            unsubscribeRef.current = client.subscribe(channel, (response: RealtimeResponseEvent<T>) => {
                setIsConnected(true)

                // Parse the event type from the events array
                let eventType: RealtimeEvent = 'update'
                if (response.events.some(e => e.includes('.create'))) {
                    eventType = 'create'
                } else if (response.events.some(e => e.includes('.delete'))) {
                    eventType = 'delete'
                }

                const payload: RealtimePayload<T> = {
                    event: eventType,
                    document: response.payload as T,
                    timestamp: new Date()
                }

                setLastEvent(payload)

                // Update documents state based on event
                setDocuments(prev => {
                    switch (eventType) {
                        case 'create':
                            return [...prev, response.payload as T]
                        case 'update':
                            return prev.map(doc =>
                                (doc as any).$id === (response.payload as any).$id
                                    ? response.payload as T
                                    : doc
                            )
                        case 'delete':
                            return prev.filter(doc =>
                                (doc as any).$id !== (response.payload as any).$id
                            )
                        default:
                            return prev
                    }
                })

                // Call callback if provided
                if (callback) {
                    callback(payload)
                }
            })
        } catch (err: any) {
            setError(err.message)
            console.error('Realtime subscription error:', err)
        }

        // Cleanup on unmount
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
                unsubscribeRef.current = null
            }
            setIsConnected(false)
        }
    }, [collectionId, documentId, callback])

    return {
        documents,
        lastEvent,
        isConnected,
        error
    }
}

/**
 * Hook to subscribe to listing updates
 */
export function useRealtimeListings(
    onNewListing?: (listing: any) => void,
    onUpdatedListing?: (listing: any) => void
) {
    const { documents, lastEvent, isConnected, error } = useRealtimeCollection(
        'listings',
        undefined,
        (payload) => {
            if (payload.event === 'create' && onNewListing) {
                onNewListing(payload.document)
            } else if (payload.event === 'update' && onUpdatedListing) {
                onUpdatedListing(payload.document)
            }
        }
    )

    return { listings: documents, lastEvent, isConnected, error }
}

/**
 * Hook to subscribe to user's notifications
 */
export function useRealtimeNotifications(userId: string) {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    const { lastEvent, isConnected } = useRealtimeCollection(
        'notifications',
        undefined,
        (payload) => {
            // Only process notifications for this user
            if (payload.document.user_id === userId) {
                if (payload.event === 'create') {
                    setNotifications(prev => [payload.document, ...prev])
                    setUnreadCount(prev => prev + 1)
                }
            }
        }
    )

    return { notifications, unreadCount, isConnected, lastEvent }
}

/**
 * Hook to subscribe to chat messages in a conversation
 */
export function useRealtimeChat(conversationId: string) {
    const [messages, setMessages] = useState<any[]>([])
    const [isTyping, setIsTyping] = useState(false)

    // Subscribe to messages - using a custom channel pattern
    useEffect(() => {
        const channel = `databases.${DATABASE_ID}.collections.chat_messages.documents`

        const unsubscribe = client.subscribe(channel, (response: any) => {
            const message = response.payload

            // Filter for this conversation
            if (message.conversation_id === conversationId) {
                if (response.events.some((e: string) => e.includes('.create'))) {
                    setMessages(prev => [...prev, message])
                }
            }
        })

        return () => {
            unsubscribe()
        }
    }, [conversationId])

    return { messages, isTyping, setIsTyping }
}

/**
 * Hook to subscribe to favorite changes for a listing
 */
export function useRealtimeFavorites(listingId: string) {
    const [favoriteCount, setFavoriteCount] = useState(0)

    const { lastEvent } = useRealtimeCollection(
        'favorites',
        undefined,
        (payload) => {
            if (payload.document.listing_id === listingId) {
                if (payload.event === 'create') {
                    setFavoriteCount(prev => prev + 1)
                } else if (payload.event === 'delete') {
                    setFavoriteCount(prev => Math.max(0, prev - 1))
                }
            }
        }
    )

    return { favoriteCount, lastEvent }
}

/**
 * Hook to subscribe to a specific listing's updates (views, bids, etc.)
 */
export function useRealtimeListing(listingId: string) {
    const [listing, setListing] = useState<any | null>(null)

    const { lastEvent, isConnected } = useRealtimeCollection(
        'listings',
        listingId,
        (payload) => {
            setListing(payload.document)
        }
    )

    return { listing, isConnected, lastUpdate: lastEvent?.timestamp }
}

/**
 * Hook to subscribe to listing offers (bids)
 */
export function useRealtimeOffers(listingId: string) {
    const [offers, setOffers] = useState<any[]>([])
    const [highestBid, setHighestBid] = useState<number>(0)

    const { lastEvent } = useRealtimeCollection(
        'listing_offers',
        undefined,
        (payload) => {
            if (payload.document.listing_id === listingId) {
                if (payload.event === 'create') {
                    setOffers(prev => [...prev, payload.document])
                    if (payload.document.offer_amount > highestBid) {
                        setHighestBid(payload.document.offer_amount)
                    }
                }
            }
        }
    )

    return { offers, highestBid, lastOffer: lastEvent?.document }
}

export default {
    useRealtimeCollection,
    useRealtimeListings,
    useRealtimeNotifications,
    useRealtimeChat,
    useRealtimeFavorites,
    useRealtimeListing,
    useRealtimeOffers
}
