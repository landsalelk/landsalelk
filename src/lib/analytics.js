import { databases, Query } from "@/appwrite";
import { DB_ID, COLLECTION_LISTINGS, COLLECTION_KYC } from "@/appwrite/config";
// Assuming we might have a users collection or use the count of KYC for now since we can't query auth users directly from client easily without function
// But we actually DO have a 'users_extended' collection in the schema list, let's use that if it exists, or just use Listings/KYC as proxies.
// The user previously saw 'users_extended' in collections.json.

export async function getPlatformStats() {
    try {
        // Parallel fetch for valid stats
        const [listings, kycRequests, users] = await Promise.all([
            databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [Query.limit(1)]),
            databases.listDocuments(DB_ID, COLLECTION_KYC, [Query.limit(1)]),
            // We'll try to get verified users count
            databases.listDocuments(DB_ID, COLLECTION_KYC, [
                Query.equal('status', 'approved'),
                Query.limit(1)
            ])
        ]);

        // Revenue Estimate: Approved KYC (Premium) * 5000 LKR
        const revenue = users.total * 5000;

        return {
            totalListings: listings.total,
            totalUsers: kycRequests.total, // Proxy for "Active Users" interacting with trust system
            verifiedUsers: users.total,
            totalRevenue: revenue
        };
    } catch (error) {
        console.error("Analytics Error:", error);
        return {
            totalListings: 0,
            totalUsers: 0,
            verifiedUsers: 0,
            totalRevenue: 0
        };
    }
}
