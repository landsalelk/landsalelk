export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.EXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb';

// ================================
// CORE BUSINESS COLLECTIONS
// ================================
export const COLLECTION_LISTINGS = 'listings';
export const COLLECTION_CATEGORIES = 'categories';
export const COLLECTION_LISTING_OFFERS = 'listing_offers';
export const COLLECTION_REVIEWS = 'reviews';

// ================================
// USER MANAGEMENT
// ================================
export const COLLECTION_USERS_EXTENDED = 'users_extended';
export const COLLECTION_FAVORITES = 'favorites';
export const COLLECTION_SAVED_SEARCHES = 'saved_searches';
export const COLLECTION_NOTIFICATIONS = 'notifications';

// ================================
// AGENT SYSTEM
// ================================
export const COLLECTION_AGENTS = 'agents';
export const COLLECTION_AGENT_LEADS = 'agent_leads';
export const COLLECTION_TRAINING_PROGRESS = 'training_progress';
export const COLLECTION_CERTIFICATES = 'certificates';
export const COLLECTION_AGENT_SUBSCRIPTIONS = 'agent_subscriptions';
export const COLLECTION_OPEN_HOUSES = 'open_houses';
export const COLLECTION_AGENT_PAYMENTS = 'agent_payments';

// ================================
// FINANCIAL
// ================================
export const COLLECTION_TRANSACTIONS = 'transactions';
export const COLLECTION_USER_WALLETS = 'user_wallets';
export const COLLECTION_DIGITAL_PURCHASES = 'digital_purchases';

// ================================
// GEOGRAPHIC
// ================================
export const COLLECTION_COUNTRIES = 'countries';
export const COLLECTION_REGIONS = 'regions';
export const COLLECTION_CITIES = 'cities';
export const COLLECTION_AREAS = 'areas';

// ================================
// KYC & COMPLIANCE
// ================================
export const COLLECTION_KYC = 'kyc_requests';
export const COLLECTION_LAND_OFFICES = 'land_offices';
export const COLLECTION_CONSENT_LOGS = 'consent_logs';

// ================================
// LEGAL VAULT
// ================================
export const COLLECTION_LEGAL_DOCUMENTS = 'legal_documents';
export const COLLECTION_DOCUMENT_PURCHASES = 'document_purchases';

// ================================
// CONTENT MANAGEMENT
// ================================
export const COLLECTION_CMS_PAGES = 'cms_pages';
export const COLLECTION_BLOG_POSTS = 'blog_posts';
export const COLLECTION_FAQS = 'faqs';
export const COLLECTION_SETTINGS = 'settings';
export const COLLECTION_COUPONS = 'coupons';
export const COLLECTION_AUDIT_LOGS = 'audit_logs';
export const COLLECTION_EMAIL_TEMPLATES = 'email_templates';
export const COLLECTION_SUBSCRIPTION_PLANS = 'subscription_plans';

// ================================
// SEO & MARKETING
// ================================
export const COLLECTION_SEO_META = 'seo_meta';
export const COLLECTION_SUBSCRIBERS = 'subscribers';

// ================================
// COMMUNICATION
// ================================
export const COLLECTION_MESSAGES = 'messages';

// ================================
// STORAGE BUCKETS
// ================================
export const BUCKET_LISTING_IMAGES = 'listing_images';
export const BUCKET_KYC = 'kyc_documents';
export const BUCKET_CERTIFICATES = 'certificates';
export const BUCKET_AGENT_IDS = 'agent-ids';
export const BUCKET_LEGAL_VAULT = 'legal_vault';
export const BUCKET_WATERMARKED = 'watermarked_docs';

