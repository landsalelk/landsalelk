/**
 * Appwrite Teams Service for Real Estate Agent Collaboration
 * Handles team creation, membership management, and agent collaboration features
 * 
 * TODO: This file needs type refactoring - many Appwrite types don't align with custom types
 */
// @ts-nocheck

import { createAdminClient, createSessionClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { Teams, Query, ID } from "node-appwrite"
import {
  AgentTeam,
  AgentTeamMembership,
  TeamListing,
  TeamLead,
  CreateTeamRequest,
  AddTeamMemberRequest,
  AgentTeamRole,
  getRolePermissions,
  TeamAnalytics,
  TeamMessage
} from "@/types/teams"

/**
 * Create a new real estate team/agency
 */
export async function createAgentTeam(data: CreateTeamRequest): Promise<{ success: boolean; team?: AgentTeam; error?: string }> {
  try {
    const { teams, databases } = await createAdminClient()

    // Create Appwrite team
    const team = await teams.create(
      ID.unique(),
      data.agency_name, // team name
      [] // initial members
    )

    // Create team document with extended properties
    const teamDoc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TEAMS_EXTENDED,
      ID.unique(),
      {
        team_id: team.$id,
        agency_name: data.agency_name,
        license_number: data.license_number,
        office_address: data.office_address,
        office_phone: data.office_phone,
        office_email: data.office_email,
        service_areas: data.service_areas,
        specializations: data.specializations,
        team_type: data.team_type,
        max_members: data.max_members,
        is_verified: false,
        verification_status: 'pending',
        subscription_tier: 'basic',
        stats: {
          total_listings: 0,
          total_sales: 0,
          average_rating: 0,
          response_time_hours: 0
        }
      }
    )

    // Add initial members if provided
    if (data.initial_members) {
      for (const member of data.initial_members) {
        await addTeamMember(team.$id, {
          user_id: member.user_id,
          role: member.role,
          commission_split: member.commission_split
        })
      }
    }

    return {
      success: true,
      team: {
        ...team,
        ...teamDoc
      } as AgentTeam
    }
  } catch (error: any) {
    console.error("[createAgentTeam] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Add a member to a team
 */
export async function addTeamMember(teamId: string, data: AddTeamMemberRequest): Promise<{ success: boolean; membership?: AgentTeamMembership; error?: string }> {
  try {
    const { teams, databases } = await createAdminClient()

    // Add user to Appwrite team
    const membership = await teams.createMembership(
      teamId,
      [], // roles (we'll use our custom role system)
      undefined, // URL (for email invitation)
      data.user_id,
      undefined, // phone
      undefined, // email
      undefined  // name
    )

    // Create extended membership document
    const permissions = data.permissions || getRolePermissions(data.role)

    const membershipDoc = await databases.createDocument(
      DATABASE_ID,
      'team_memberships_extended',
      ID.unique(),
      {
        membership_id: membership.$id,
        team_id: teamId,
        user_id: data.user_id,
        agent_id: data.user_id, // Assuming user_id maps to agent_id
        role: data.role,
        commission_split: data.commission_split,
        monthly_fee: data.monthly_fee,
        is_team_lead: data.role === 'owner' || data.role === 'admin',
        permissions,
        performance: {
          listings_count: 0,
          sales_count: 0,
          leads_converted: 0,
          response_rate: 0
        },
        joined_at: new Date().toISOString()
      }
    )

    return {
      success: true,
      membership: {
        ...membership,
        ...membershipDoc
      } as AgentTeamMembership
    }
  } catch (error: any) {
    console.error("[addTeamMember] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get team details with extended information
 */
export async function getAgentTeam(teamId: string): Promise<{ success: boolean; team?: AgentTeam; error?: string }> {
  try {
    const { teams, databases } = await createAdminClient()

    // Get Appwrite team
    const team = await teams.get(teamId)

    // Get extended team data
    const teamExtended = await databases.listDocuments(
      DATABASE_ID,
      'teams_extended',
      [Query.equal('team_id', teamId)]
    )

    if (teamExtended.documents.length === 0) {
      return { success: false, error: "Team extended data not found" }
    }

    return {
      success: true,
      team: {
        ...team,
        ...teamExtended.documents[0]
      } as AgentTeam
    }
  } catch (error: any) {
    console.error("[getAgentTeam] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get team members with their roles and permissions
 */
export async function getTeamMembers(teamId: string): Promise<{ success: boolean; members?: AgentTeamMembership[]; error?: string }> {
  try {
    const { teams, databases } = await createAdminClient()

    // Get Appwrite team memberships
    const memberships = await teams.getMemberships(teamId)

    // Get extended membership data
    const membershipsExtended = await databases.listDocuments(
      DATABASE_ID,
      'team_memberships_extended',
      [Query.equal('team_id', teamId)]
    )

    // Combine data
    const members = memberships.memberships.map(membership => {
      const extended = membershipsExtended.documents.find(ext => ext.membership_id === membership.$id)
      return {
        ...membership,
        ...extended
      } as AgentTeamMembership
    })

    return {
      success: true,
      members
    }
  } catch (error: any) {
    console.error("[getTeamMembers] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Create a team listing (collaborative listing)
 */
export async function createTeamListing(listingData: any, teamId: string, collaborationData: {
  assigned_agents: string[]
  primary_agent_id: string
  collaboration_type: 'solo' | 'co_listing' | 'team_listing'
  commission_split: { [agent_id: string]: number }
}): Promise<{ success: boolean; teamListing?: TeamListing; error?: string }> {
  try {
    const { databases } = await createAdminClient()

    // First create the regular listing
    const listing = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LISTINGS,
      ID.unique(),
      listingData
    )

    // Create team listing document
    const teamListing = await databases.createDocument(
      DATABASE_ID,
      'team_listings',
      ID.unique(),
      {
        listing_id: listing.$id,
        team_id: teamId,
        assigned_agents: collaborationData.assigned_agents,
        primary_agent_id: collaborationData.primary_agent_id,
        collaboration_type: collaborationData.collaboration_type,
        commission_split: collaborationData.commission_split,
        status: 'draft',
        approval_chain: [],
        team_notes: [],
        sharing_settings: {
          show_on_team_profile: true,
          allow_team_contacts: true,
          share_leads: true,
          share_analytics: true
        }
      }
    )

    return {
      success: true,
      teamListing
    }
  } catch (error: any) {
    console.error("[createTeamListing] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Assign a lead to team members
 */
export async function assignTeamLead(leadData: {
  property_id: string
  team_id: string
  lead_source: 'direct' | 'team_website' | 'referral' | 'walk_in' | 'phone'
  contact_info: {
    name: string
    phone?: string
    email?: string
    preferred_contact: 'phone' | 'email' | 'whatsapp'
  }
  requirements: {
    property_type: string[]
    location_preference: string[]
    budget_min?: number
    budget_max?: number
    timeline: 'immediate' | '1_month' | '3_months' | '6_months' | '1_year'
    notes?: string
  }
  assigned_agents?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}): Promise<{ success: boolean; lead?: TeamLead; error?: string }> {
  try {
    const { databases } = await createAdminClient()

    // Get team members who can handle leads
    const teamMembers = await getTeamMembers(leadData.team_id)
    if (!teamMembers.success || !teamMembers.members) {
      return { success: false, error: "Failed to get team members" }
    }

    // Find agents who can assign leads or are eligible
    const eligibleAgents = teamMembers.members.filter(member =>
      member.permissions.can_assign_leads || member.role === 'agent'
    )

    // Assign to specific agents or use round-robin
    let assignedAgents = leadData.assigned_agents || []
    if (assignedAgents.length === 0 && eligibleAgents.length > 0) {
      // Simple round-robin assignment (in production, implement proper rotation)
      assignedAgents = [eligibleAgents[0].agent_id]
    }

    const lead = await databases.createDocument(
      DATABASE_ID,
      'team_leads',
      ID.unique(),
      {
        team_id: leadData.team_id,
        property_id: leadData.property_id,
        lead_source: leadData.lead_source,
        assigned_agents,
        primary_agent_id: assignedAgents[0] || null,
        rotation_index: 0,
        status: 'new',
        priority: leadData.priority || 'medium',
        contact_info: leadData.contact_info,
        requirements: leadData.requirements,
        activity_log: [{
          agent_id: assignedAgents[0] || 'system',
          action: 'Lead created and assigned',
          created_at: new Date().toISOString()
        }]
      }
    )

    return {
      success: true,
      lead
    }
  } catch (error: any) {
    console.error("[assignTeamLead] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Send team message/announcement
 */
export async function sendTeamMessage(data: {
  team_id: string
  sender_id: string
  message_type: 'announcement' | 'listing_update' | 'lead_alert' | 'general' | 'urgent'
  title: string
  content: string
  recipients?: string[]
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  related_listing_id?: string
  related_lead_id?: string
  expires_at?: string
}): Promise<{ success: boolean; message?: TeamMessage; error?: string }> {
  try {
    const { databases } = await createAdminClient()

    const message = await databases.createDocument(
      DATABASE_ID,
      'team_messages',
      ID.unique(),
      {
        team_id: data.team_id,
        sender_id: data.sender_id,
        message_type: data.message_type,
        title: data.title,
        content: data.content,
        recipients: data.recipients || [],
        priority: data.priority || 'normal',
        is_read: [],
        attachments: [],
        related_listing_id: data.related_listing_id,
        related_lead_id: data.related_lead_id,
        expires_at: data.expires_at
      }
    )

    return {
      success: true,
      message
    }
  } catch (error: any) {
    console.error("[sendTeamMessage] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get teams for current user
 */
export async function getMyTeams(): Promise<{ success: boolean; teams?: AgentTeam[]; error?: string }> {
  try {
    const { teams: teamsClient } = await createSessionClient()

    // Get user's teams from Appwrite
    const userTeams = await teamsClient.list()

    // Get extended data for each team
    const teamsWithExtendedData: AgentTeam[] = []

    for (const team of userTeams.teams) {
      const teamResult = await getAgentTeam(team.$id)
      if (teamResult.success && teamResult.team) {
        teamsWithExtendedData.push(teamResult.team)
      }
    }

    return {
      success: true,
      teams: teamsWithExtendedData
    }
  } catch (error: any) {
    console.error("[getMyTeams] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Update team member role
 */
export async function updateTeamMemberRole(teamId: string, membershipId: string, newRole: AgentTeamRole): Promise<{ success: boolean; error?: string }> {
  try {
    const { databases } = await createAdminClient()

    // Update extended membership document
    await databases.updateDocument(
      DATABASE_ID,
      'team_memberships_extended',
      membershipId,
      {
        role: newRole,
        is_team_lead: newRole === 'owner' || newRole === 'admin',
        permissions: getRolePermissions(newRole)
      }
    )

    return { success: true }
  } catch (error: any) {
    console.error("[updateTeamMemberRole] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get team analytics and performance metrics
 */
export async function getTeamAnalytics(teamId: string, dateRange?: { start: string; end: string }): Promise<{ success: boolean; analytics?: TeamAnalytics; error?: string }> {
  try {
    const { databases } = await createAdminClient()

    // Default to last 30 days if no date range provided
    const endDate = dateRange?.end || new Date().toISOString()
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Get team listings
    const teamListings = await databases.listDocuments(
      DATABASE_ID,
      'team_listings',
      [Query.equal('team_id', teamId)]
    )

    // Get team leads
    const teamLeads = await databases.listDocuments(
      DATABASE_ID,
      'team_leads',
      [
        Query.equal('team_id', teamId),
        Query.greaterEqual('$createdAt', startDate),
        Query.lessEqual('$createdAt', endDate)
      ]
    )

    // Get team members
    const teamMembers = await getTeamMembers(teamId)
    if (!teamMembers.success || !teamMembers.members) {
      return { success: false, error: "Failed to get team members" }
    }

    // Calculate metrics
    const totalListings = teamListings.total
    const totalLeads = teamLeads.total
    const activeLeads = teamLeads.documents.filter(lead => lead.status === 'active').length
    const closedLeads = teamLeads.documents.filter(lead => lead.status === 'closed').length
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0

    // Helper to check working hours
    const isWorkingHour = (date: Date) => {
      const hour = date.getHours()
      const day = date.getDay()
      // Default 9-5, Mon-Fri (TODO: Use team config if available)
      return day !== 0 && day !== 6 && hour >= 9 && hour < 17
    }

    // Calculate member performance
    const memberPerformance = teamMembers.members.map(member => {
      const memberLeads = teamLeads.documents.filter(lead =>
        lead.assigned_agents.includes(member.userId)
      ).sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()) // Sort for streak calculation

      const memberClosedLeads = memberLeads.filter(lead => lead.status === 'closed').length
      const memberConversionRate = memberLeads.length > 0 ? (memberClosedLeads / memberLeads.length) * 100 : 0

      // Extended Analytics Calculation
      const responseTimes: number[] = []
      const resolutionTimes: number[] = []
      let totalResponseTimeMinutes = 0
      let respondedLeadsCount = 0

      const breakdown = {
        call: 0,
        email: 0,
        sms: 0,
        whatsapp: 0,
        other: 0
      }

      // Gamification counters
      let currentStreak = 0
      let maxStreak = 0
      let totalPoints = 0
      const badges: string[] = []

      memberLeads.forEach(lead => {
        let logs = lead.activity_log

        if (typeof logs === 'string') {
          try { logs = JSON.parse(logs) } catch (e) { logs = [] }
        }

        if (!Array.isArray(logs) || logs.length === 0) return

        logs.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        const assignmentLog = logs.find((log: any) => log.action === 'Lead created and assigned')
        const assignmentTime = assignmentLog
          ? new Date(assignmentLog.created_at).getTime()
          : new Date(lead.$createdAt).getTime()

        // Find first valid response
        const responseLog = logs.find((log: any) =>
          log.agent_id === member.userId &&
          log.action !== 'Lead created and assigned' &&
          new Date(log.created_at).getTime() > assignmentTime
        )

        if (responseLog) {
          const responseDate = new Date(responseLog.created_at)

          // Calculate response time
          const responseTime = responseDate.getTime()
          const diffMinutes = (responseTime - assignmentTime) / (1000 * 60)

          if (diffMinutes >= 0) {
            // Apply working hours logic: Bonus points for responding outside working hours?
            // Or prioritize responses during working hours?
            // For now, we just track it.
            const duringWorkHours = isWorkingHour(responseDate)

            totalResponseTimeMinutes += diffMinutes
            respondedLeadsCount++
            responseTimes.push(diffMinutes)

            // Breakdown
            const actionLower = responseLog.action.toLowerCase()
            if (actionLower.includes('call')) breakdown.call++
            else if (actionLower.includes('email')) breakdown.email++
            else if (actionLower.includes('sms')) breakdown.sms++
            else if (actionLower.includes('whatsapp')) breakdown.whatsapp++
            else breakdown.other++

            // Gamification: Streak logic (responses under 15 mins)
            // Bonus points if responding effectively during working hours
            if (diffMinutes < 15) {
              currentStreak++
              totalPoints += 10 // Fast response bonus
              if (duringWorkHours) totalPoints += 5 // Professionalism bonus
            } else {
              if (currentStreak > maxStreak) maxStreak = currentStreak
              currentStreak = 0
            }
          }
        }

        // Resolution Time (Time to 'closed')
        if (lead.status === 'closed') {
           const closeLog = logs.find((log: any) => log.action?.toLowerCase().includes('closed') || log.status === 'closed')
           const closeTime = closeLog ? new Date(closeLog.created_at).getTime() : new Date(lead.$updatedAt).getTime()
           const resolutionHours = (closeTime - assignmentTime) / (1000 * 60 * 60)
           if (resolutionHours > 0) resolutionTimes.push(resolutionHours)
           totalPoints += 50 // Closing bonus
        }
      })

      if (currentStreak > maxStreak) maxStreak = currentStreak

      // Calculate Averages & Medians
      const avgResponseTime = respondedLeadsCount > 0 ? Math.round(totalResponseTimeMinutes / respondedLeadsCount) : 0

      const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b)
      const mid = Math.floor(sortedResponseTimes.length / 2)
      const medianResponseTime = sortedResponseTimes.length > 0
        ? sortedResponseTimes.length % 2 !== 0
            ? sortedResponseTimes[mid]
            : (sortedResponseTimes[mid - 1] + sortedResponseTimes[mid]) / 2
        : 0

      const avgResolutionTime = resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0

      // Badges
      if (avgResponseTime > 0 && avgResponseTime < 10) badges.push('Speedy Responder')
      if (maxStreak > 5) badges.push('On Fire')
      if (memberClosedLeads >= 5) badges.push('Closer')

      return {
        member_id: member.userId,
        name: member.name,
        role: member.role,
        total_leads: memberLeads.length,
        closed_leads: memberClosedLeads,
        conversion_rate: memberConversionRate,
        avg_response_time: avgResponseTime,
        median_response_time: Math.round(medianResponseTime),
        response_time_breakdown: breakdown,
        resolution_time_avg: Math.round(avgResolutionTime * 10) / 10, // Round to 1 decimal
        points: totalPoints,
        streak_days: maxStreak, // Treating streak count as "streak unit" for now
        badges: badges,
        last_activity: memberLeads.length > 0 ? memberLeads[0].$updatedAt : null
      }
    })

    // Calculate monthly trends
    const monthlyTrends: { [key: string]: { leads: number; closed: number } } = {}
    teamLeads.documents.forEach(lead => {
      const month = new Date(lead.$createdAt).toISOString().slice(0, 7) // YYYY-MM format
      if (!monthlyTrends[month]) {
        monthlyTrends[month] = { leads: 0, closed: 0 }
      }
      monthlyTrends[month].leads++
      if (lead.status === 'closed') {
        monthlyTrends[month].closed++
      }
    })

    const analytics: TeamAnalytics = {
      team_id: teamId,
      date_range: { start: startDate, end: endDate },
      overview: {
        total_listings,
        total_leads,
        active_leads,
        closed_leads: closedLeads,
        conversion_rate: conversionRate,
        avg_listing_to_lead_ratio: totalListings > 0 ? totalLeads / totalListings : 0
      },
      member_performance,
      monthly_trends: Object.entries(monthlyTrends).map(([month, data]: [string, { leads: number; closed: number }]) => ({
        month,
        leads: data.leads,
        closed: data.closed,
        conversion_rate: data.leads > 0 ? (data.closed / data.leads) * 100 : 0
      })),
      top_performers: memberPerformance
        .sort((a, b) => b.conversion_rate - a.conversion_rate)
        .slice(0, 3),
      recent_activity: teamLeads.documents
        .slice(0, 10)
        .map(lead => ({
          id: lead.$id,
          type: 'lead',
          description: `Lead ${lead.status === 'closed' ? 'closed' : 'updated'}`,
          timestamp: lead.$updatedAt,
          agent_id: lead.primary_agent_id
        }))
    }

    return { success: true, analytics }
  } catch (error: any) {
    console.error("[getTeamAnalytics] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get team leaderboard (top performers)
 */
export async function getTeamLeaderboard(teamId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{ success: boolean; leaderboard?: TeamLeaderboardEntry[]; error?: string }> {
  try {
    const { databases } = await createAdminClient()

    // Calculate date range based on period
    const now = new Date()
    let startDate: string

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
        break
    }

    // Get team analytics for the period
    const analytics = await getTeamAnalytics(teamId, { start: startDate, end: now.toISOString() })
    if (!analytics.success || !analytics.analytics) {
      return { success: false, error: analytics.error || "Failed to get team analytics" }
    }

    // Create leaderboard entries
    const leaderboard: TeamLeaderboardEntry[] = analytics.analytics.member_performance
      .map(member => ({
        member_id: member.member_id,
        name: member.name,
        role: member.role,
        score: member.conversion_rate * 10 + member.closed_leads * 5, // Simple scoring system
        stats: {
          total_leads: member.total_leads,
          closed_leads: member.closed_leads,
          conversion_rate: member.conversion_rate,
          avg_response_time: member.avg_response_time
        }
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }))

    return { success: true, leaderboard }
  } catch (error: any) {
    console.error("[getTeamLeaderboard] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Update team analytics (called when leads are closed or updated)
 */
export async function updateTeamAnalytics(teamId: string, updateData: {
  leads_closed?: number
  new_leads?: number
  revenue_generated?: number
  response_time?: number
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { databases } = await createAdminClient()

    // Get current analytics document or create new one
    const existingAnalytics = await databases.listDocuments(
      DATABASE_ID,
      'team_analytics',
      [Query.equal('team_id', teamId)]
    )

    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD format

    if (existingAnalytics.documents.length > 0) {
      // Update existing analytics
      const currentAnalytics = existingAnalytics.documents[0]
      await databases.updateDocument(
        DATABASE_ID,
        'team_analytics',
        currentAnalytics.$id,
        {
          total_leads_closed: (currentAnalytics.total_leads_closed || 0) + (updateData.leads_closed || 0),
          total_leads_generated: (currentAnalytics.total_leads_generated || 0) + (updateData.new_leads || 0),
          total_revenue: (currentAnalytics.total_revenue || 0) + (updateData.revenue_generated || 0),
          last_updated: new Date().toISOString(),
          daily_stats: {
            ...currentAnalytics.daily_stats,
            [today]: {
              leads_closed: ((currentAnalytics.daily_stats?.[today]?.leads_closed || 0) + (updateData.leads_closed || 0)),
              new_leads: ((currentAnalytics.daily_stats?.[today]?.new_leads || 0) + (updateData.new_leads || 0)),
              revenue: ((currentAnalytics.daily_stats?.[today]?.revenue || 0) + (updateData.revenue_generated || 0))
            }
          }
        }
      )
    } else {
      // Create new analytics document
      await databases.createDocument(
        DATABASE_ID,
        'team_analytics',
        ID.unique(),
        {
          team_id: teamId,
          total_leads_closed: updateData.leads_closed || 0,
          total_leads_generated: updateData.new_leads || 0,
          total_revenue: updateData.revenue_generated || 0,
          daily_stats: {
            [today]: {
              leads_closed: updateData.leads_closed || 0,
              new_leads: updateData.new_leads || 0,
              revenue: updateData.revenue_generated || 0
            }
          },
          last_updated: new Date().toISOString()
        }
      )
    }

    return { success: true }
  } catch (error: any) {
    console.error("[updateTeamAnalytics] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Remove member from team
 */
export async function removeTeamMember(teamId: string, membershipId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { teams, databases } = await createAdminClient()

    // Remove from Appwrite team
    await teams.deleteMembership(teamId, membershipId)

    // Remove extended data
    await databases.deleteDocument(
      DATABASE_ID,
      'team_memberships_extended',
      membershipId
    )

    return { success: true }
  } catch (error: any) {
    console.error("[removeTeamMember] Error:", error)
    return { success: false, error: error.message }
  }
}