'use client';

import { databases, Query } from '@/appwrite';
import { DB_ID, COLLECTION_CATEGORIES } from '@/appwrite/config';

/**
 * Fetch all active categories from database
 */
export async function getCategories() {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_CATEGORIES,
            [
                Query.equal('is_active', true),
                Query.orderAsc('sort_order')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(categoryId) {
    try {
        const category = await databases.getDocument(
            DB_ID,
            COLLECTION_CATEGORIES,
            categoryId
        );
        return category;
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

/**
 * Get a category by slug
 */
export async function getCategoryBySlug(slug) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_CATEGORIES,
            [Query.equal('slug', slug)]
        );
        return response.documents[0] || null;
    } catch (error) {
        console.error('Error fetching category by slug:', error);
        return null;
    }
}

/**
 * Get child categories (subcategories)
 */
export async function getChildCategories(parentId) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_CATEGORIES,
            [
                Query.equal('parent_id', parentId),
                Query.equal('is_active', true),
                Query.orderAsc('sort_order')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching child categories:', error);
        return [];
    }
}

/**
 * Category icon mapping
 */
export const categoryIcons = {
    'land': '🏞️',
    'house': '🏠',
    'apartment': '🏢',
    'commercial': '🏪',
    'industrial': '🏭'
};

/**
 * Get formatted categories for dropdown
 */
export async function getCategoryOptions() {
    const categories = await getCategories();
    return categories.map(cat => ({
        value: cat.$id,
        label: cat.name,
        icon: categoryIcons[cat.slug] || '📍'
    }));
}
