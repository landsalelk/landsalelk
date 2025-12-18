
import { Client, Databases, Query, ID } from 'node-appwrite';
import { NextResponse } from 'next/server';

// Initialize Admin Client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_AGENT_LEADS = 'agent_leads';
const COLLECTION_AGENTS = 'agents';

export async function POST(request) {
    try {
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

        // If still no agent, we might want to assign to a default admin agent or leave unassigned
        // For now, let's proceed even if null (unassigned lead)

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
