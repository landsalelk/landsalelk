// Appwrite Configuration Constants

// Endpoint
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject';

// Database IDs
export const DB_ID = 'landsalelkdb';

// Collection IDs
export const COLLECTION_LISTINGS = 'listings';
export const COLLECTION_AGENTS = 'agents';
export const COLLECTION_AGENT_LEADS = 'agent_leads';
export const COLLECTION_OPEN_HOUSES = 'open_houses';
export const COLLECTION_USERS_EXTENDED = 'users_extended';
export const COLLECTION_CATEGORIES = 'categories';
export const COLLECTION_REGIONS = 'regions';
export const COLLECTION_CITIES = 'cities';
export const COLLECTION_AREAS = 'areas';
export const COLLECTION_REVIEWS = 'reviews';
export const COLLECTION_FAVORITES = 'favorites';
export const COLLECTION_MESSAGES = 'messages';
export const COLLECTION_NOTIFICATIONS = 'notifications';
export const COLLECTION_TRANSACTIONS = 'transactions';
export const COLLECTION_USER_WALLETS = 'user_wallets';

// Storage Buckets
export const BUCKET_LISTING_IMAGES = 'listing_images';
export const BUCKET_AGENT_AVATARS = 'agent_avatars';
export const BUCKET_DOCUMENTS = 'documents';

// Other Constants
export const ITEMS_PER_PAGE = 12;
export const CURRENCY_CODE = 'LKR';
