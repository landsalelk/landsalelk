/**
 * Legal Vault Library
 * Secure document storage for land deeds, survey plans, and legal documents
 */

import { databases, storage, account, Query, ID } from '@/appwrite';
import { DB_ID } from '@/appwrite/config';

// Collection and Bucket IDs
const COLLECTION_LEGAL_DOCUMENTS = 'legal_documents';
const COLLECTION_DOCUMENT_PURCHASES = 'document_purchases';
const COLLECTION_AGENT_SUBSCRIPTIONS = 'agent_subscriptions';
const BUCKET_LEGAL_VAULT = 'legal_vault';
const BUCKET_WATERMARKED = 'watermarked_docs';

// Document Categories
export const DOCUMENT_CATEGORIES = {
    title: {
        name: 'අයිතිය තහවුරු කරන ලේඛන',
        nameEn: 'Title Documents',
        types: [
            { id: 'deed', name: 'ප්‍රධාන ඔප්පුව', nameEn: 'Title Deed', required: true },
            { id: 'prior_deeds', name: 'පෙර ඔප්පු', nameEn: 'Prior Deeds' },
            { id: 'extracts', name: 'පත්ඉරු', nameEn: 'Extracts' },
            { id: 'gift_deed', name: 'තෑගි ඔප්පුව', nameEn: 'Gift Deed' },
        ]
    },
    survey: {
        name: 'මිනුම් ලේඛන',
        nameEn: 'Survey & Maps',
        types: [
            { id: 'survey_plan', name: 'මිනුම් පිඹුර', nameEn: 'Survey Plan', required: true },
            { id: 'blocking_plan', name: 'කැබලි කිරීමේ පිඹුර', nameEn: 'Blocking-out Plan' },
        ]
    },
    authority: {
        name: 'පළාත් පාලන සහතික',
        nameEn: 'Local Authority Certificates',
        types: [
            { id: 'street_line', name: 'වීදි රේඛා සහතිකය', nameEn: 'Street Line Certificate' },
            { id: 'non_vesting', name: 'පවරා නොගැනීමේ සහතිකය', nameEn: 'Non-Vesting Certificate' },
            { id: 'ownership_cert', name: 'අයිතිය තහවුරු කිරීමේ සහතිකය', nameEn: 'Ownership Certificate' },
            { id: 'tax_receipts', name: 'වරිපනම් බදු රිසිට්පත්', nameEn: 'Assessment Tax Receipts' },
        ]
    },
    construction: {
        name: 'ගොඩනැගිලි ලේඛන',
        nameEn: 'Construction Documents',
        types: [
            { id: 'building_plan', name: 'අනුමත ගොඩනැගිලි සැලැස්ම', nameEn: 'Approved Building Plan' },
            { id: 'coc', name: 'අනුකූලතා සහතිකය (COC)', nameEn: 'Certificate of Conformity' },
        ]
    },
    special: {
        name: 'විශේෂ ලේඛන',
        nameEn: 'Special Documents',
        types: [
            { id: 'power_of_attorney', name: 'ඇටෝනි බලපත්‍රය', nameEn: 'Power of Attorney' },
            { id: 'inheritance', name: 'උරුමකම් සහතික', nameEn: 'Inheritance Documents' },
        ]
    }
};

// Subscription Packages
export const SUBSCRIPTION_PACKAGES = {
    free: { name: 'Free', price: 0, vaultAccess: false },
    silver: {
        name: 'Silver',
        price: 5000,
        vaultAccess: true,
        allowedCategories: ['title', 'survey'],
        maxDocuments: 5
    },
    gold: {
        name: 'Gold',
        price: 15000,
        vaultAccess: true,
        allowedCategories: ['title', 'survey', 'authority', 'construction', 'special'],
        maxDocuments: 20
    },
    platinum: {
        name: 'Platinum',
        price: 25000,
        vaultAccess: true,
        allowedCategories: ['title', 'survey', 'authority', 'construction', 'special'],
        maxDocuments: -1, // Unlimited
        secureShareLinks: true
    }
};

// Document purchase price
export const DOCUMENT_PURCHASE_PRICE = 500; // LKR
export const AGENT_SHARE_PERCENT = 40; // 40% = Rs.200
export const PLATFORM_SHARE_PERCENT = 60; // 60% = Rs.300
export const ACCESS_DURATION_DAYS = 7;
export const MAX_DOWNLOADS = 3;

// Watermark text
export const WATERMARK_TEXT = 'Landsale.lk Reference Copy - Not for Legal Transactions';

/**
 * Upload a legal document
 */
export async function uploadLegalDocument(file, listingId, category, documentType, consentGiven = false) {
    try {
        const user = await account.get();

        // Upload to legal_vault bucket
        const uploadedFile = await storage.createFile(
            BUCKET_LEGAL_VAULT,
            ID.unique(),
            file
        );

        // Create document record
        const doc = await databases.createDocument(
            DB_ID,
            COLLECTION_LEGAL_DOCUMENTS,
            ID.unique(),
            {
                user_id: user.$id,
                listing_id: listingId,
                category,
                document_type: documentType,
                file_id: uploadedFile.$id,
                original_filename: file.name,
                consent_given: consentGiven,
                uploaded_at: new Date().toISOString(),
            }
        );

        return doc;
    } catch (error) {
        console.error('Error uploading legal document:', error);
        throw error;
    }
}

/**
 * Get documents for a listing
 */
export async function getListingDocuments(listingId) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_LEGAL_DOCUMENTS,
            [
                Query.equal('listing_id', listingId),
                Query.orderDesc('uploaded_at')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error getting listing documents:', error);
        return [];
    }
}

/**
 * Check if user has access to documents (purchased or owner)
 */
export async function checkDocumentAccess(listingId, userId) {
    try {
        // Check if user is owner
        const docs = await databases.listDocuments(
            DB_ID,
            COLLECTION_LEGAL_DOCUMENTS,
            [Query.equal('listing_id', listingId), Query.equal('user_id', userId)]
        );
        if (docs.total > 0) return { hasAccess: true, isOwner: true };

        // Check if user has active purchase
        const purchases = await databases.listDocuments(
            DB_ID,
            COLLECTION_DOCUMENT_PURCHASES,
            [
                Query.equal('listing_id', listingId),
                Query.equal('buyer_id', userId),
                Query.greaterThan('expires_at', new Date().toISOString())
            ]
        );

        if (purchases.total > 0) {
            const purchase = purchases.documents[0];
            return {
                hasAccess: true,
                isOwner: false,
                purchase,
                downloadsRemaining: MAX_DOWNLOADS - (purchase.download_count || 0)
            };
        }

        return { hasAccess: false };
    } catch (error) {
        console.error('Error checking document access:', error);
        return { hasAccess: false };
    }
}

/**
 * Get agent subscription
 */
export async function getAgentSubscription(agentId) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENT_SUBSCRIPTIONS,
            [
                Query.equal('agent_id', agentId),
                Query.equal('status', 'active'),
                Query.greaterThan('expires_at', new Date().toISOString())
            ]
        );
        return response.documents[0] || null;
    } catch (error) {
        console.error('Error getting agent subscription:', error);
        return null;
    }
}

/**
 * Check if agent can use vault
 */
export async function canUseVault(agentId) {
    const subscription = await getAgentSubscription(agentId);
    if (!subscription) return { canUse: false, reason: 'No active subscription' };

    const pkg = SUBSCRIPTION_PACKAGES[subscription.package];
    if (!pkg?.vaultAccess) return { canUse: false, reason: 'Package does not include vault access' };

    return { canUse: true, subscription, package: pkg };
}

/**
 * Record document purchase
 */
export async function recordDocumentPurchase(listingId, sellerId, paymentId) {
    try {
        const user = await account.get();
        const agentShare = (DOCUMENT_PURCHASE_PRICE * AGENT_SHARE_PERCENT) / 100;
        const platformShare = (DOCUMENT_PURCHASE_PRICE * PLATFORM_SHARE_PERCENT) / 100;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + ACCESS_DURATION_DAYS);

        const purchase = await databases.createDocument(
            DB_ID,
            COLLECTION_DOCUMENT_PURCHASES,
            ID.unique(),
            {
                buyer_id: user.$id,
                listing_id: listingId,
                seller_id: sellerId,
                amount: DOCUMENT_PURCHASE_PRICE,
                agent_share: agentShare,
                platform_share: platformShare,
                payment_id: paymentId,
                purchased_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
                download_count: 0,
            }
        );

        return purchase;
    } catch (error) {
        console.error('Error recording document purchase:', error);
        throw error;
    }
}

/**
 * Get watermarked document URL (pre-signed)
 */
export function getWatermarkedDocumentUrl(fileId) {
    return storage.getFileView(BUCKET_WATERMARKED, fileId);
}

/**
 * Get document count by listing
 */
export async function getDocumentCount(listingId) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_LEGAL_DOCUMENTS,
            [Query.equal('listing_id', listingId)]
        );
        return response.total;
    } catch (error) {
        return 0;
    }
}
