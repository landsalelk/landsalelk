'use client';

import { databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_SAVED_SEARCHES } from './constants';
import { Query, ID } from 'appwrite';

/**
 * Get user's saved searches
 */
export async function getSavedSearches(userId) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_SAVED_SEARCHES,
            [
                Query.equal('user_id', userId),
                Query.orderDesc('$createdAt')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching saved searches:', error);
        return [];
    }
}

/**
 * Save a search
 */
export async function saveSearch(userId, name, filters, notifyOnNew = true) {
    try {
        const search = await databases.createDocument(
            DB_ID,
            COLLECTION_SAVED_SEARCHES,
            ID.unique(),
            {
                user_id: userId,
                name,
                filters: JSON.stringify(filters),
                notify_on_new: notifyOnNew
            }
        );
        return search;
    } catch (error) {
        console.error('Error saving search:', error);
        return null;
    }
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(searchId) {
    try {
        await databases.deleteDocument(DB_ID, COLLECTION_SAVED_SEARCHES, searchId);
        return true;
    } catch (error) {
        console.error('Error deleting saved search:', error);
        return false;
    }
}

/**
 * Update saved search notification preference
 */
export async function toggleSearchNotification(searchId, notify) {
    try {
        await databases.updateDocument(
            DB_ID,
            COLLECTION_SAVED_SEARCHES,
            searchId,
            { notify_on_new: notify }
        );
        return true;
    } catch (error) {
        console.error('Error updating search notification:', error);
        return false;
    }
}

/**
 * Parse saved search filters
 */
export function parseSearchFilters(search) {
    try {
        return JSON.parse(search.filters);
    } catch {
        return {};
    }
}
