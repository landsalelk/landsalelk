'use client';

import { databases, Query, ID } from '@/appwrite';
import { DB_ID, COLLECTION_AGENT_LEADS, COLLECTION_LAND_OFFICES } from '@/appwrite/config';

// ================================
// AGENT LEADS
// ================================

/**
 * Get leads assigned to an agent
 */
export async function getAgentLeads(agentId) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENT_LEADS,
            [
                Query.equal('agent_id', agentId),
                Query.orderDesc('$createdAt')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching agent leads:', error);
        return [];
    }
}

/**
 * Get leads by status
 */
export async function getLeadsByStatus(agentId, status) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENT_LEADS,
            [
                Query.equal('agent_id', agentId),
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching leads by status:', error);
        return [];
    }
}

/**
 * Update lead status
 */
export async function updateLeadStatus(leadId, status, notes = '') {
    try {
        await databases.updateDocument(
            DB_ID,
            COLLECTION_AGENT_LEADS,
            leadId,
            {
                status,
                notes,
                updated_at: new Date().toISOString()
            }
        );
        return true;
    } catch (error) {
        console.error('Error updating lead status:', error);
        return false;
    }
}

/**
 * Lead status types
 */
export const LeadStatus = {
    NEW: 'new',
    CONTACTED: 'contacted',
    INTERESTED: 'interested',
    NEGOTIATING: 'negotiating',
    CONVERTED: 'converted',
    LOST: 'lost'
};

// ================================
// LAND OFFICES
// ================================

/**
 * Get all land registry offices
 */
export async function getLandOffices() {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_LAND_OFFICES,
            [Query.orderAsc('name')]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching land offices:', error);
        return [];
    }
}

/**
 * Get land offices by region
 */
export async function getLandOfficesByRegion(regionId) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_LAND_OFFICES,
            [
                Query.equal('region_id', regionId),
                Query.orderAsc('name')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching land offices by region:', error);
        return [];
    }
}

/**
 * Search land offices by name
 */
export async function searchLandOffices(query) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_LAND_OFFICES,
            [Query.search('name', query)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error searching land offices:', error);
        return [];
    }
}
