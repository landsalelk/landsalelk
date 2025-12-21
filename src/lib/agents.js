import { databases, Query } from "@/appwrite";
import { DB_ID, COLLECTION_AGENTS } from "@/appwrite/config";

/**
 * Get all agents
 */
export async function getAgents(limit = 20) {
    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENTS,
            [
                Query.limit(limit),
                Query.orderDesc('$createdAt')
            ]
        );
        return result.documents;
    } catch (error) {
        console.error("Error fetching agents:", error);
        return [];
    }
}

/**
 * Get agents by specialization (e.g., "Legal", "Notary")
 */
export async function getAgentsBySpecialization(specialization, limit = 10) {
    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENTS,
            [
                Query.contains('specialization', [specialization]),
                Query.limit(limit)
            ]
        );
        return result.documents;
    } catch (error) {
        console.error("Error fetching specialized agents:", error);
        // Fallback to all agents if query fails
        return getAgents(limit);
    }
}

/**
 * Get agent by ID
 */
export async function getAgentById(id) {
    try {
        const doc = await databases.getDocument(DB_ID, COLLECTION_AGENTS, id);
        return doc;
    } catch (error) {
        console.error(`Error fetching agent ${id}:`, error);
        throw error;
    }
}
