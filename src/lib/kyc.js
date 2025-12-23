import { databases, storage, account, ID, Query, Permission, Role } from "@/appwrite";
import { DB_ID, COLLECTION_KYC, BUCKET_KYC } from "@/appwrite/config";

/**
 * Submit a KYC request with files.
 * @param {Object} data - { nicFront: File, nicBack: File, type: 'agent'|'seller' }
 */
export async function submitKYC(data) {
    try {
        const user = await account.get(); // Ensure user is logged in
        if (!user) throw new Error("User not authenticated");

        // 1. Upload Files
        const frontUpload = await storage.createFile(
            BUCKET_KYC,
            ID.unique(),
            data.nicFront
        );

        const backUpload = await storage.createFile(
            BUCKET_KYC,
            ID.unique(),
            data.nicBack
        );

        // 2. Create KYC Request Doc
        const kycDoc = await databases.createDocument(
            DB_ID,
            COLLECTION_KYC,
            ID.unique(),
            {
                user_id: user.$id,
                status: 'pending',
                nic_front_id: frontUpload.$id,
                nic_back_id: backUpload.$id,
                request_type: data.type || 'verify_identity',
                submitted_at: new Date().toISOString()
            },
            [
                Permission.read(Role.user(user.$id)),
                Permission.read(Role.team('admins')),
                Permission.update(Role.team('admins')), // Only admins update status
            ]
        );

        return kycDoc;

    } catch (error) {
        // console.error("KYC Submission Error:", error);
        throw error;
    }
}

/**
 * Check existing KYC status.
 */
export async function getKYCStatus() {
    try {
        const user = await account.get();
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_KYC,
            [
                Query.equal('user_id', user.$id),
                Query.orderDesc('submitted_at'),
                Query.limit(1)
            ]
        );
        return result.documents.length > 0 ? result.documents[0] : null;
    } catch (error) {
        // If 401, return null (not logged in)
        return null;
    }
}

/**
 * ADMIN: Get all pending KYC requests.
 */
export async function getPendingKYCRequests() {
    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_KYC,
            [
                Query.equal('status', 'pending'),
                Query.orderDesc('submitted_at'),
            ]
        );
        return result.documents;
    } catch (error) {
        console.error("Admin Fetch Error:", error);
        return [];
    }
}

/**
 * ADMIN: Approve or Reject a KYC request.
 * @param {string} docId 
 * @param {string} status 'approved' | 'rejected'
 */
export async function updateKYCStatus(docId, status) {
    return await databases.updateDocument(
        DB_ID,
        COLLECTION_KYC,
        docId,
        {
            status: status,
            reviewed_at: new Date().toISOString()
        }
    );
}

/**
 * Helper to get file view URL
 */
export function getKYCFileView(fileId) {
    if (!fileId) return null;
    return storage.getFileView(BUCKET_KYC, fileId);
}
