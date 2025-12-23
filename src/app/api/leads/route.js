
import { databases, ID, Query } from '@/lib/server/appwrite';
import { NextResponse } from 'next/server';

const COLLECTION_AGENT_LEADS = 'agent_leads';
const COLLECTION_AGENTS = 'agents';
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb';

export async function POST(request) {
    try {
        if (!databases) {
            return NextResponse.json(
                { error: 'Server not configured: Appwrite client is missing' },
                { status: 500 }
            );
        }

        const { name, phone, message, requirements, location } = await request.json();

        if (!name || !phone) {
            return NextResponse.json({ error: "Name and Phone are required" }, { status: 400 });
        }

        // 1. Find a suitable agent
        // Simple logic: If location provided, find agent in that city/district.
        // Fallback: Random active agent.

        let assignedAgentId = null;

        if (location) {
             try {
                const agentsInLocation = await databases.listDocuments(
                    DB_ID,
                    COLLECTION_AGENTS,
                    [
                        Query.search('service_areas', location), // Assuming service_areas is a searchable text or array
                        Query.equal('status', 'active'),
                        Query.limit(1)
                    ]
                );
                if (agentsInLocation.documents.length > 0) {
                    assignedAgentId = agentsInLocation.documents[0].$id;
                }
            } catch (e) {
                console.warn("Location based agent search failed", e);
            }
        }

        // Fallback if no location match
        if (!assignedAgentId) {
            try {
                const anyAgent = await databases.listDocuments(
                    DB_ID,
                    COLLECTION_AGENTS,
                    [
                        Query.equal('status', 'active'),
                        Query.limit(1),
                        Query.orderDesc('$createdAt') // Or random if possible, but for now just newest
                    ]
                );
                if (anyAgent.documents.length > 0) {
                    assignedAgentId = anyAgent.documents[0].$id;
                }
            } catch (e) {
                console.warn("Fallback agent search failed", e);
            }
        }

        // If still no agent, don't create the lead because `agent_id` is required in Appwrite schema
        if (!assignedAgentId) {
            return NextResponse.json(
                { error: 'No active agents available to assign this lead' },
                { status: 503 }
            );
        }

        const leadData = {
            name,
            phone,
            message,
            requirements,
            location,
            agent_id: assignedAgentId,
            status: 'new',
            source: 'AI_ASSISTANT',
            created_at: new Date().toISOString()
        };

        const result = await databases.createDocument(
            DB_ID,
            COLLECTION_AGENT_LEADS,
            ID.unique(),
            leadData
        );

        return NextResponse.json({ success: true, leadId: result.$id, assignedAgent: assignedAgentId });

    } catch (error) {
        console.error("Lead Creation Error:", error);
        return NextResponse.json({ error: "Failed to create lead", details: error.message }, { status: 500 });
    }
}
