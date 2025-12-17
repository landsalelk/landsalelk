import { NextResponse } from 'next/server'
import { Client, Databases } from 'node-appwrite'

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || ''
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'osclass_landsale_db'

export async function GET() {
    try {
        const client = new Client()
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID)
            .setKey(APPWRITE_API_KEY)

        const databases = new Databases(client)

        // List all collections
        const collections = await databases.listCollections(DATABASE_ID)

        // Get details for agents and agent_leads if they exist
        const agentsCollection = collections.collections.find(c => c.$id === 'agents')
        const agentLeadsCollection = collections.collections.find(c => c.$id === 'agent_leads')

        let agentsAttributes: string[] = []
        let agentLeadsAttributes: string[] = []

        if (agentsCollection) {
            agentsAttributes = agentsCollection.attributes.map((a: any) => a.key)
        }

        if (agentLeadsCollection) {
            agentLeadsAttributes = agentLeadsCollection.attributes.map((a: any) => a.key)
        }

        return NextResponse.json({
            success: true,
            database: DATABASE_ID,
            totalCollections: collections.total,
            collections: collections.collections.map(c => c.$id),
            agents: {
                exists: !!agentsCollection,
                attributes: agentsAttributes
            },
            agent_leads: {
                exists: !!agentLeadsCollection,
                attributes: agentLeadsAttributes
            }
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        })
    }
}
