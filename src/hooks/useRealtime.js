'use client';

import { useState, useEffect, useCallback } from 'react';
import { client } from '@/lib/appwrite';
import { DB_ID } from '@/lib/constants';

/**
 * Hook for subscribing to Appwrite Realtime updates
 * @param {string} collectionId - The collection to subscribe to
 * @param {function} onUpdate - Callback when document is created/updated
 * @param {function} onDelete - Callback when document is deleted
 * @param {string} userId - Optional user ID to filter events
 */
export function useRealtime(collectionId, { onUpdate, onDelete, userId } = {}) {
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!collectionId) return;

        const channel = `databases.${DB_ID}.collections.${collectionId}.documents`;

        try {
            const unsubscribe = client.subscribe(channel, (response) => {
                const { events, payload } = response;

                // Check if event is for this user (if userId provided)
                if (userId && payload.user_id && payload.user_id !== userId) {
                    return;
                }

                // Handle create/update events
                if (events.some(e => e.includes('.create') || e.includes('.update'))) {
                    onUpdate?.(payload);
                }

                // Handle delete events
                if (events.some(e => e.includes('.delete'))) {
                    onDelete?.(payload);
                }
            });

            setConnected(true);
            setError(null);

            return () => {
                unsubscribe();
                setConnected(false);
            };
        } catch (err) {
            console.error('Realtime subscription error:', err);
            setError(err);
            setConnected(false);
        }
    }, [collectionId, userId, onUpdate, onDelete]);

    return { connected, error };
}

/**
 * Hook for subscribing to user notifications in realtime
 * @param {string} userId - User ID to subscribe to
 * @param {function} onNewNotification - Callback when new notification arrives
 */
export function useNotificationRealtime(userId, onNewNotification) {
    return useRealtime('notifications', {
        userId,
        onUpdate: onNewNotification
    });
}

/**
 * Hook for subscribing to offer updates in realtime
 * @param {string} userId - User ID to filter offers
 * @param {function} onOfferUpdate - Callback when offer is updated
 */
export function useOfferRealtime(userId, onOfferUpdate) {
    return useRealtime('listing_offers', {
        userId,
        onUpdate: onOfferUpdate
    });
}

/**
 * Hook for subscribing to message updates in realtime
 * @param {string} conversationId - Conversation to watch (user1_user2 format)
 * @param {function} onNewMessage - Callback when new message arrives
 */
export function useMessageRealtime(conversationId, onNewMessage) {
    const [messages, setMessages] = useState([]);

    const handleNewMessage = useCallback((message) => {
        // Check if message is part of this conversation
        const participants = [message.sender_id, message.receiver_id].sort().join('_');
        if (participants === conversationId || !conversationId) {
            setMessages(prev => [...prev, message]);
            onNewMessage?.(message);
        }
    }, [conversationId, onNewMessage]);

    const { connected, error } = useRealtime('messages', {
        onUpdate: handleNewMessage
    });

    return { connected, error, messages };
}
