
import { Client, Databases, Query, ID } from 'node-appwrite';
import { NextResponse } from 'next/server';

const COLLECTION_AGENT_LEADS = 'agent_leads';
const COLLECTION_AGENTS = 'agents';

export async function POST(request) {
    try {
        // Initialize Admin Client inside the handler to avoid build-time crashes
        // when environment variables are not present during `next build`.
        const endpoint =
            process.env.APPWRITE_ENDPOINT ||
            process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
            'https://sgp.cloud.appwrite.io/v1';
        const projectId =
            process.env.APPWRITE_PROJECT_ID ||
            process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
            'landsalelkproject';
        const apiKey = process.env.APPWRITE_API_KEY;
        const DB_ID =
            process.env.APPWRITE_DATABASE_ID ||
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ||
            'landsalelkdb';

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Server not configured: APPWRITE_API_KEY is missing' },
                { status: 500 }
            );
        }

        const client = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey);

        const databases = new Databases(client);

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
                        Query.equal('status', 'approved'),
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
                        Query.equal('status', 'approved'),
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

        // Appwrite schema requires agent_id - if no agents available, return user-friendly error
        if (!assignedAgentId) {
            return NextResponse.json({
                success: false,
                error: 'Our team is currently setting up agent support in your area. Please try again later or contact us directly at info@landsale.lk',
                code: 'NO_AGENTS_AVAILABLE'
            }, { status: 503 });
        }

        const leadData = {
            name,
            phone,
            message: message || '',
            requirements: requirements || '',
            location: location || '',
            agent_id: assignedAgentId,
            status: 'new',
            source: 'WEBSITE',
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
