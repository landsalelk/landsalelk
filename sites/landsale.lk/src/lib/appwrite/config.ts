// Client-side Appwrite configuration
// Note: The actual client initialization is done in client.ts to avoid issues during SSR/build

// Core Appwrite configuration
// IMPORTANT: Set these in your .env.local file
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
export const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '' // Server-side only, not exposed to client

// Validate required configuration at runtime (dev warning only)
if (typeof window === 'undefined' && !APPWRITE_PROJECT_ID) {
    console.warn('⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set. Appwrite functionality will not work.')
}

// Database and Collection IDs - Updated for new schema
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'osclass_landsale_db'

export const COLLECTIONS = {
    // Core listings
    LISTINGS: process.env.NEXT_PUBLIC_APPWRITE_LISTINGS_COLLECTION_ID || 'listings',
    PROPERTIES: process.env.NEXT_PUBLIC_APPWRITE_LISTINGS_COLLECTION_ID || 'listings', // Alias for compatibility
    CATEGORIES: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID || 'categories',

    // User management
    USERS_EXTENDED: process.env.NEXT_PUBLIC_APPWRITE_USERS_EXTENDED_COLLECTION_ID || 'users_extended',
    FAVORITES: process.env.NEXT_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID || 'favorites',
    SAVED_SEARCHES: process.env.NEXT_PUBLIC_APPWRITE_SAVED_SEARCHES_COLLECTION_ID || 'saved_searches',
    USER_WALLETS: process.env.NEXT_PUBLIC_APPWRITE_USER_WALLETS_COLLECTION_ID || 'user_wallets',

    // Location hierarchy
    COUNTRIES: process.env.NEXT_PUBLIC_APPWRITE_COUNTRIES_COLLECTION_ID || 'countries',
    REGIONS: process.env.NEXT_PUBLIC_APPWRITE_REGIONS_COLLECTION_ID || 'regions',
    CITIES: process.env.NEXT_PUBLIC_APPWRITE_CITIES_COLLECTION_ID || 'cities',
    AREAS: process.env.NEXT_PUBLIC_APPWRITE_AREAS_COLLECTION_ID || 'areas',

    // Reviews and interactions
    REVIEWS: process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID || 'reviews',
    LISTING_OFFERS: process.env.NEXT_PUBLIC_APPWRITE_LISTING_OFFERS_COLLECTION_ID || 'listing_offers',

    // Content management
    CMS_PAGES: process.env.NEXT_PUBLIC_APPWRITE_CMS_PAGES_COLLECTION_ID || 'cms_pages',
    BLOG_POSTS: process.env.NEXT_PUBLIC_APPWRITE_BLOG_POSTS_COLLECTION_ID || 'blog_posts',
    FAQS: process.env.NEXT_PUBLIC_APPWRITE_FAQS_COLLECTION_ID || 'faqs',
    SEO_META: process.env.NEXT_PUBLIC_APPWRITE_SEO_META_COLLECTION_ID || 'seo_meta',
    SETTINGS: process.env.NEXT_PUBLIC_APPWRITE_SETTINGS_COLLECTION_ID || 'settings',

    // Agent system
    AGENTS: process.env.NEXT_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID || 'agents',
    AGENT_LEADS: process.env.NEXT_PUBLIC_APPWRITE_AGENT_LEADS_COLLECTION_ID || 'agent_leads',
    DIGITAL_PURCHASES: process.env.NEXT_PUBLIC_APPWRITE_DIGITAL_PURCHASES_COLLECTION_ID || 'digital_purchases',

    // Transactions
    TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions',

    // Notifications
    NOTIFICATIONS: process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications',

    // Teams functionality
    TEAMS_EXTENDED: process.env.NEXT_PUBLIC_APPWRITE_TEAMS_EXTENDED_COLLECTION_ID || 'teams_extended',
    TEAM_MEMBERSHIPS_EXTENDED: process.env.NEXT_PUBLIC_APPWRITE_TEAM_MEMBERSHIPS_EXTENDED_COLLECTION_ID || 'team_memberships_extended',
    TEAM_LISTINGS: process.env.NEXT_PUBLIC_APPWRITE_TEAM_LISTINGS_COLLECTION_ID || 'team_listings',
    TEAM_LEADS: process.env.NEXT_PUBLIC_APPWRITE_TEAM_LEADS_COLLECTION_ID || 'team_leads',
    TEAM_MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_TEAM_MESSAGES_COLLECTION_ID || 'team_messages',
    TEAM_ANALYTICS: process.env.NEXT_PUBLIC_APPWRITE_TEAM_ANALYTICS_COLLECTION_ID || 'team_analytics',
}

// Storage bucket IDs - Updated for new schema
export const BUCKETS = {
    LISTING_IMAGES: process.env.NEXT_PUBLIC_APPWRITE_LISTING_IMAGES_BUCKET_ID || 'listing_images',
    USER_AVATARS: process.env.NEXT_PUBLIC_APPWRITE_USER_AVATARS_BUCKET_ID || 'user_avatars',
    LISTING_DOCUMENTS: process.env.NEXT_PUBLIC_APPWRITE_LISTING_DOCUMENTS_BUCKET_ID || 'listing_documents',
    BLOG_IMAGES: process.env.NEXT_PUBLIC_APPWRITE_BLOG_IMAGES_BUCKET_ID || 'blog_images',
    AGENT_DOCUMENTS: process.env.NEXT_PUBLIC_APPWRITE_AGENT_DOCUMENTS_BUCKET_ID || 'agent_documents',
}

// Legacy support for existing code
export const LEGACY_COLLECTIONS = {
    PROPERTIES: 'properties', // Old collection name
    FAVORITES: 'favorites',
    REGIONS: 'regions',
    CITIES: 'cities',
}

// Unified config object for hooks and components
export const APPWRITE_CONFIG = {
    endpoint: APPWRITE_ENDPOINT,
    projectId: APPWRITE_PROJECT_ID,
    databaseId: DATABASE_ID,
    collections: COLLECTIONS,
    buckets: BUCKETS,
}