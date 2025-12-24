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

/**
 * Find agents by service area location (for matching during listing creation)
 * @param {string} location - The property location to match against agent service_areas
 * @param {number} limit - Max results
 */
export async function findAgentsByLocation(location, limit = 5) {
    if (!location) return [];

    try {
        // Fetch verified agents and filter by service area match
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENTS,
            [
                Query.equal('is_verified', true),
                Query.limit(50) // Fetch more, then filter client-side
            ]
        );

        const locationLower = location.toLowerCase();

        // Filter agents whose service_areas contain the location
        const matched = result.documents.filter(agent => {
            if (!agent.service_areas || !Array.isArray(agent.service_areas)) return false;
            return agent.service_areas.some(area =>
                locationLower.includes(area.toLowerCase()) ||
                area.toLowerCase().includes(locationLower.split(',')[0].trim())
            );
        });

        // Sort by rating/deals and return top matches
        matched.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        return matched.slice(0, limit);
    } catch (error) {
        console.error("Error finding agents by location:", error);
        return [];
    }
}
