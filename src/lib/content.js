'use client';

import { databases } from '@/lib/appwrite';
import {
    DB_ID,
    COLLECTION_CMS_PAGES,
    COLLECTION_BLOG_POSTS,
    COLLECTION_FAQS,
    COLLECTION_SETTINGS
} from './constants';
import { Query } from 'appwrite';

// ================================
// CMS PAGES
// ================================

/**
 * Get a CMS page by slug
 */
export async function getCmsPage(slug) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_CMS_PAGES,
            [Query.equal('slug', slug)]
        );
        return response.documents[0] || null;
    } catch (error) {
        console.error('Error fetching CMS page:', error);
        return null;
    }
}

/**
 * Get all CMS pages
 */
export async function getAllCmsPages() {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_CMS_PAGES,
            [Query.equal('is_published', true)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching CMS pages:', error);
        return [];
    }
}

// ================================
// BLOG POSTS
// ================================

/**
 * Get published blog posts
 */
export async function getBlogPosts(limit = 10, offset = 0) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_BLOG_POSTS,
            [
                Query.equal('is_published', true),
                Query.orderDesc('$createdAt'),
                Query.limit(limit),
                Query.offset(offset)
            ]
        );
        return {
            posts: response.documents,
            total: response.total
        };
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return { posts: [], total: 0 };
    }
}

/**
 * Get a blog post by slug
 */
export async function getBlogPostBySlug(slug) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_BLOG_POSTS,
            [Query.equal('slug', slug)]
        );
        return response.documents[0] || null;
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}

/**
 * Get featured blog posts
 */
export async function getFeaturedPosts(limit = 3) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_BLOG_POSTS,
            [
                Query.equal('is_published', true),
                Query.equal('is_featured', true),
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching featured posts:', error);
        return [];
    }
}

// ================================
// FAQs
// ================================

/**
 * Get all FAQs
 */
export async function getFaqs() {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_FAQS,
            [
                Query.equal('is_active', true),
                Query.orderAsc('sort_order')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return [];
    }
}

/**
 * Get FAQs by category
 */
export async function getFaqsByCategory(category) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_FAQS,
            [
                Query.equal('category', category),
                Query.equal('is_active', true),
                Query.orderAsc('sort_order')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching FAQs by category:', error);
        return [];
    }
}

// ================================
// SETTINGS
// ================================

/**
 * Get a setting by key
 */
export async function getSetting(key) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_SETTINGS,
            [Query.equal('key', key)]
        );
        return response.documents[0]?.value || null;
    } catch (error) {
        console.error('Error fetching setting:', error);
        return null;
    }
}

/**
 * Get all settings
 */
export async function getAllSettings() {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_SETTINGS
        );
        // Convert to key-value object
        const settings = {};
        response.documents.forEach(doc => {
            settings[doc.key] = doc.value;
        });
        return settings;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return {};
    }
}
