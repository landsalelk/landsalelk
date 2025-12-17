"use server"

import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { sendSMS, sendEmail } from "@/lib/actions/messaging"
import { Query, ID } from "node-appwrite"

interface LeadDispatchData {
    propertyId: string
    propertyTitle: string
    city: string
    district: string
    price: number
    sellerPhone?: string
}

/**
 * Dispatches a new property lead to team members or all agents serving that area.
 * Called when a new listing is created.
 */
export async function dispatchLeadToAgents(data: LeadDispatchData) {
    try {
        const { databases, teams } = await createAdminClient()

        console.log(`[Lead Dispatch] New listing in ${data.city}, ${data.district}`)

        // First, check if this listing belongs to a team
        const property = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            data.propertyId
        )

        let agentsFound = 0
        let dispatchedAgents: string[] = []

        if (property.team_id) {
            console.log(`[Lead Dispatch] Listing belongs to team: ${property.team_id}`)

            // Get team members
            const teamMembers = await teams.listMemberships(property.team_id)
            console.log(`[Lead Dispatch] Found ${teamMembers.total} team members`)

            // Get agent profiles for team members
            for (const member of teamMembers.memberships) {
                try {
                    const agentProfile = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.AGENTS,
                        [Query.equal('user_id', member.userId)]
                    )

                    if (agentProfile.documents.length > 0) {
                        const agent = agentProfile.documents[0]

                        // Check if agent serves this area
                        if (agent.service_areas.includes(data.district)) {
                            await notifyAgentOfLead(agent, data)
                            agentsFound++
                            dispatchedAgents.push(agent.name)
                        }
                    }
                } catch (memberError) {
                    console.error(`[Lead Dispatch] Failed to process team member ${member.userId}:`, memberError)
                }
            }
        } else {
            console.log(`[Lead Dispatch] Listing does not belong to a team, dispatching to all agents`)

            // Original logic: dispatch to all agents serving the area
            const agents = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AGENTS,
                [Query.contains('service_areas', data.district)]
            )

            agentsFound = agents.documents.length
            console.log(`[Lead Dispatch] Found ${agentsFound} agents serving ${data.district}`)

            // Send notifications to agents
            for (const agent of agents.documents) {
                try {
                    await notifyAgentOfLead(agent, data)
                    dispatchedAgents.push(agent.name)
                } catch (notificationError) {
                    console.error(`[Lead Dispatch] Failed to notify agent ${agent.name}:`, notificationError)
                }
            }
        }

        console.log(`[Lead Dispatch] Successfully dispatched to ${dispatchedAgents.length} agents:`, dispatchedAgents)
        return { success: true, dispatchedCount: agentsFound, dispatchedAgents }

    } catch (error: any) {
        console.error("[Lead Dispatch] Error:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Helper function to notify an agent about a new lead AND persist to database
 */
async function notifyAgentOfLead(agent: any, data: LeadDispatchData) {
    const { databases } = await createAdminClient()

    // 1. PERSIST LEAD TO DATABASE (for Realtime Dashboard)
    try {
        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.AGENT_LEADS,
            ID.unique(),
            {
                agent_id: agent.$id,
                agent_user_id: agent.user_id,
                property_id: data.propertyId,
                property_title: data.propertyTitle,
                city: data.city,
                district: data.district,
                price: data.price,
                seller_phone: data.sellerPhone || '',
                status: 'new', // new | contacted | viewing_scheduled | negotiation | closed | lost
                priority: 'medium',
                notes: [],
                created_at: new Date().toISOString()
            }
        )
        console.log(`[Lead Dispatch] Lead persisted for agent: ${agent.name}`)
    } catch (persistError) {
        console.error(`[Lead Dispatch] Failed to persist lead for ${agent.name}:`, persistError)
    }

    // 2. SEND SMS NOTIFICATION
    try {
        await sendSMS({
            content: `🏡 New Lead Alert! ${data.propertyTitle} in ${data.city} - Rs. ${data.price.toLocaleString()}. Contact: ${data.sellerPhone}`,
            to: [agent.phone]
        })
    } catch (smsError) {
        console.error(`[Lead Dispatch] SMS failed for ${agent.name}:`, smsError)
    }

    // 3. SEND EMAIL NOTIFICATION (if available)
    if (agent.email) {
        try {
            await sendEmail({
                to: [agent.email],
                subject: `New Property Lead: ${data.propertyTitle}`,
                content: `
                    <h2>New Property Lead Available!</h2>
                    <p><strong>Property:</strong> ${data.propertyTitle}</p>
                    <p><strong>Location:</strong> ${data.city}, ${data.district}</p>
                    <p><strong>Price:</strong> Rs. ${data.price.toLocaleString()}</p>
                    <p><strong>Contact:</strong> ${data.sellerPhone}</p>
                    <p><strong>Property ID:</strong> ${data.propertyId}</p>
                    <hr>
                    <p>Contact the seller quickly to secure this lead!</p>
                `
            })
        } catch (emailError) {
            console.error(`[Lead Dispatch] Email failed for ${agent.name}:`, emailError)
        }
    }

    console.log(`[Lead Dispatch] Notified agent: ${agent.name} (${agent.phone})`)
}

interface AgentProfileData {
    userId: string
    fullName: string
    email?: string
    phone: string
    whatsapp?: string
    bio: string
    experience: number
    serviceAreas: string[]
    specializations: string[]
}

/**
 * Creates a new agent profile (pending verification).
 */
export async function createAgentProfile(data: AgentProfileData) {
    try {
        const { databases } = await createAdminClient()

        // Check if user already has an agent profile
        try {
            const existing = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AGENTS,
                [Query.equal('user_id', data.userId), Query.limit(1)]
            )
            if (existing.documents.length > 0) {
                return { success: false, error: "You already have an agent profile" }
            }
        } catch (checkError) {
            // Collection might not exist yet, proceed with creation
            console.log("[Agent] Collection check failed, proceeding with creation")
        }

        // Create the agent profile
        const profile = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.AGENTS,
            ID.unique(),
            {
                user_id: data.userId,
                name: data.fullName,
                email: data.email || '',
                phone: data.phone,
                whatsapp: data.whatsapp || data.phone,
                bio: data.bio,
                experience_years: data.experience,
                service_areas: data.serviceAreas,
                specializations: data.specializations,
                is_verified: false,
                status: 'pending',
                rating: 0,
                review_count: 0,
                deals_count: 0,
                created_at: new Date().toISOString()
            }
        )

        console.log("[Agent] Profile created:", profile.$id)
        return { success: true, profileId: profile.$id }
    } catch (error: any) {
        console.error("[Agent] Error creating profile:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Gets agents that cover a specific area (for property pages).
 */
export async function getAgentsForArea(district: string) {
    try {
        const { databases } = await createAdminClient()

        // Find agents that serve this district
        const agents = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.AGENTS,
            [
                Query.contains('service_areas', district),
                Query.equal('status', 'active'),
                Query.equal('is_verified', true)
            ]
        )

        return {
            success: true,
            agents: agents.documents.map(agent => ({
                id: agent.$id,
                name: agent.name,
                phone: agent.phone,
                whatsapp: agent.whatsapp,
                bio: agent.bio,
                experience: agent.experience_years,
                rating: agent.rating,
                reviewCount: agent.review_count,
                dealsCount: agent.deals_count,
                isVerified: agent.is_verified,
                specializations: agent.specializations || [],
                serviceAreas: agent.service_areas || []
            }))
        }
    } catch (error: any) {
        console.error("[getAgentsForArea] Error:", error)
        return { success: false, error: error.message, agents: [] }
    }
}

/**
 * Gets the current user's agent profile
 */
export async function getMyAgentProfile(userId: string) {
    try {
        const { databases } = await createAdminClient()

        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.AGENTS,
            [Query.equal('user_id', userId), Query.limit(1)]
        )

        if (result.documents.length === 0) {
            return { success: true, profile: null }
        }

        const profile = result.documents[0]
        return {
            success: true,
            profile: {
                id: profile.$id,
                userId: profile.user_id,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                whatsapp: profile.whatsapp,
                bio: profile.bio,
                avatarUrl: profile.avatar_url,
                experienceYears: profile.experience_years,
                serviceAreas: profile.service_areas || [],
                specializations: profile.specializations || [],
                isVerified: profile.is_verified,
                status: profile.status, // pending | active | suspended
                rating: profile.rating,
                reviewCount: profile.review_count,
                dealsCount: profile.deals_count,
                verificationDocuments: profile.verification_documents || [],
                vacationMode: profile.vacation_mode || false,
                createdAt: profile.created_at
            }
        }
    } catch (error: any) {
        console.error("[getMyAgentProfile] Error:", error)
        return { success: false, error: error.message, profile: null }
    }
}

/**
 * Updates an agent's profile
 */
export async function updateAgentProfile(agentId: string, data: {
    name?: string
    phone?: string
    whatsapp?: string
    bio?: string
    experienceYears?: number
    serviceAreas?: string[]
    specializations?: string[]
    avatarUrl?: string
    vacationMode?: boolean
}) {
    try {
        const { databases } = await createAdminClient()

        const updateData: Record<string, any> = {}
        if (data.name !== undefined) updateData.name = data.name
        if (data.phone !== undefined) updateData.phone = data.phone
        if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp
        if (data.bio !== undefined) updateData.bio = data.bio
        if (data.experienceYears !== undefined) updateData.experience_years = data.experienceYears
        if (data.serviceAreas !== undefined) updateData.service_areas = data.serviceAreas
        if (data.specializations !== undefined) updateData.specializations = data.specializations
        if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl
        if (data.vacationMode !== undefined) updateData.vacation_mode = data.vacationMode
        updateData.updated_at = new Date().toISOString()

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.AGENTS,
            agentId,
            updateData
        )

        console.log("[Agent] Profile updated:", agentId)
        return { success: true }
    } catch (error: any) {
        console.error("[updateAgentProfile] Error:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Adds a verification document reference to agent profile
 */
export async function addVerificationDocument(agentId: string, documentInfo: {
    fileId: string
    documentType: 'nic' | 'business_reg' | 'license' | 'other'
    fileName: string
}) {
    try {
        const { databases } = await createAdminClient()

        // Get current profile
        const profile = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.AGENTS,
            agentId
        )

        const currentDocs = profile.verification_documents || []
        const updatedDocs = [...currentDocs, {
            file_id: documentInfo.fileId,
            document_type: documentInfo.documentType,
            file_name: documentInfo.fileName,
            uploaded_at: new Date().toISOString()
        }]

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.AGENTS,
            agentId,
            {
                verification_documents: updatedDocs,
                status: 'pending_review' // Mark for admin review
            }
        )

        console.log("[Agent] Verification document added:", agentId)
        return { success: true }
    } catch (error: any) {
        console.error("[addVerificationDocument] Error:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Gets leads for a specific agent
 */
export async function getAgentLeads(agentUserId: string, options?: {
    status?: string
    limit?: number
}) {
    try {
        const { databases } = await createAdminClient()

        const queries = [
            Query.equal('agent_user_id', agentUserId),
            Query.orderDesc('$createdAt'),
            Query.limit(options?.limit || 50)
        ]

        if (options?.status) {
            queries.push(Query.equal('status', options.status))
        }

        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.AGENT_LEADS,
            queries
        )

        return {
            success: true,
            leads: result.documents.map(doc => ({
                id: doc.$id,
                propertyId: doc.property_id,
                propertyTitle: doc.property_title,
                city: doc.city,
                district: doc.district,
                price: doc.price,
                sellerPhone: doc.seller_phone,
                status: doc.status,
                priority: doc.priority,
                notes: doc.notes || [],
                createdAt: doc.$createdAt
            })),
            total: result.total
        }
    } catch (error: any) {
        console.error("[getAgentLeads] Error:", error)
        return { success: false, error: error.message, leads: [], total: 0 }
    }
}

/**
 * Updates a lead's status
 */
export async function updateLeadStatus(leadId: string, status: string, note?: string) {
    try {
        const { databases } = await createAdminClient()

        const lead = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.AGENT_LEADS,
            leadId
        )

        const updateData: Record<string, any> = { status }

        if (note) {
            const currentNotes = lead.notes || []
            updateData.notes = [...currentNotes, `${new Date().toLocaleString()}: Status changed to ${status}. ${note}`]
        }

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.AGENT_LEADS,
            leadId,
            updateData
        )

        return { success: true }
    } catch (error: any) {
        console.error("[updateLeadStatus] Error:", error)
        return { success: false, error: error.message }
    }
}
