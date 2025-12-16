import { databases } from "./appwrite";
import { Query } from "appwrite";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';
const COLLECTION_AGENTS = 'agents';

/**
 * Fetch all agents, optionally filtered by visibility/status.
 * @returns {Promise<Array>}
 */
export async function getAllAgents() {
    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENTS,
            [
                Query.limit(100), // Get enough for the map
                // Query.equal('is_verified', true) // For premium feeling
            ]
        );
        return result.documents;
    } catch (error) {
        console.error("Error fetching agents:", error);
        return [];
    }
}

/**
 * Get agent details by ID.
 * @param {string} id 
 */
export async function getAgentById(id) {
    try {
        return await databases.getDocument(DB_ID, COLLECTION_AGENTS, id);
    } catch (error) {
        throw new Error("Agent not found");
    }
}
