'use client';

import { databases, Query } from '@/appwrite';
import {
    DB_ID,
    COLLECTION_CMS_PAGES,
    COLLECTION_BLOG_POSTS,
    COLLECTION_FAQS,
    COLLECTION_SETTINGS,
    APPWRITE_ENDPOINT,
    BUCKET_LISTING_IMAGES
} from '@/appwrite/config';

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject';

/**
 * Get Image View URL
 */
function getImageUrl(fileId) {
    if (!fileId) return null;
    if (fileId.startsWith('http')) return fileId;
    return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_LISTING_IMAGES}/files/${fileId}/view?project=${PROJECT_ID}`;
}

/**
 * Transform blog post data
 */
function transformPost(post) {
    return {
        ...post,
        cover_image: getImageUrl(post.cover_image) || getImageUrl(post.featured_image) || null,
        featured_image: getImageUrl(post.cover_image) || getImageUrl(post.featured_image) || null
    };
}

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
            COLLECTION_CMS_PAGES
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
                Query.orderDesc('$createdAt'),
                Query.limit(limit),
                Query.offset(offset)
            ]
        );
        return {
            posts: response.documents.map(transformPost),
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
        return response.documents[0] ? transformPost(response.documents[0]) : null;
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
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ]
        );
        return response.documents.map(transformPost);
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
