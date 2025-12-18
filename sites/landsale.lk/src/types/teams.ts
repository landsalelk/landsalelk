/**
 * Appwrite Teams Types for Real Estate Agent Collaboration
 * Extends Appwrite's built-in Teams functionality for agent-specific use cases
 */

import { Models } from 'appwrite'

// ============================================================================
// Team Roles for Real Estate
// ============================================================================

export type AgentTeamRole = 
  | 'owner'        // Agency owner - full control
  | 'admin'        // Branch manager - manage agents and listings
  | 'senior'       // Senior agent - mentor others, manage some team features
  | 'agent'        // Regular agent - create listings, view team data
  | 'junior'       // Junior agent - limited permissions, needs approval
  | 'assistant'    // Assistant - view-only, administrative tasks

// ============================================================================
// Team Types
// ============================================================================

export interface AgentTeam extends Models.Team {
  // Custom attributes for real estate teams
  agency_name: string
  license_number?: string
  office_address?: string
  office_phone?: string
  office_email?: string
  service_areas: string[]      // Districts/regions they cover
  specializations: string[]    // Property types they specialize in
  is_verified: boolean
  verification_status: 'pending' | 'verified' | 'rejected'
  team_type: 'agency' | 'brokerage' | 'franchise' | 'independent'
  max_members: number
  subscription_tier: 'basic' | 'premium' | 'enterprise'
  branding?: {
    logo_url?: string
    primary_color?: string
    website_url?: string
  }
  stats: {
    total_listings: number
    total_sales: number
    average_rating: number
    response_time_hours: number
  }
  // Data & Accuracy Enhancements
  working_hours?: WorkingHours
  holidays?: Holiday[]
  sla_config?: SLAConfig
}

export interface WorkingHours {
  timezone: string
  schedule: {
    [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: {
      is_working: boolean
      start: string // "09:00"
      end: string // "17:00"
    }
  }
}

export interface Holiday {
  date: string // YYYY-MM-DD
  name: string
  is_recurring: boolean
}

export interface SLAConfig {
  response_time_minutes: number
  resolution_time_hours: number
  priority_multipliers: {
    low: number
    medium: number
    high: number
    urgent: number
  }
}

export interface AgentTeamMembership extends Models.Membership {
  // Custom attributes for team members
  agent_id: string             // Reference to agents collection
  role: AgentTeamRole
  commission_split: number     // Commission percentage for team member
  monthly_fee?: number         // Monthly desk fee or team fee
  is_team_lead: boolean
  permissions: {
    can_create_listings: boolean
    can_edit_team_listings: boolean
    can_delete_listings: boolean
    can_view_analytics: boolean
    can_manage_members: boolean
    can_assign_leads: boolean
    can_access_team_wallet: boolean
  }
  performance: {
    listings_count: number
    sales_count: number
    leads_converted: number
    response_rate: number
  }
  joined_at: string
  license_info?: {
    license_number: string
    license_type: 'estate' | 'business' | 'individual'
    expiry_date: string
  }
}

// ============================================================================
// Team Listing Collaboration
// ============================================================================

export interface TeamListing extends Models.Document {
  // Extends regular listings with team collaboration features
  listing_id: string           // Reference to main listings collection
  team_id: string             // Appwrite team ID
  assigned_agents: string[]   // Agent IDs who can manage this listing
  primary_agent_id: string    // Main agent responsible
  collaboration_type: 'solo' | 'co_listing' | 'team_listing'
  commission_split: {
    [agent_id: string]: number // Percentage for each agent
  }
  status: 'draft' | 'active' | 'pending_approval' | 'approved' | 'rejected'
  approval_chain: {
    level: number
    approver_id: string
    status: 'pending' | 'approved' | 'rejected'
    notes?: string
    approved_at?: string
  }[]
  team_notes: {
    agent_id: string
    note: string
    created_at: string
    is_private: boolean
  }[]
  sharing_settings: {
    show_on_team_profile: boolean
    allow_team_contacts: boolean
    share_leads: boolean
    share_analytics: boolean
  }
}

// ============================================================================
// Team Lead Management
// ============================================================================

export interface TeamLead extends Models.Document {
  team_id: string
  property_id: string          // Reference to listing
  lead_source: 'direct' | 'team_website' | 'referral' | 'walk_in' | 'phone'
  assigned_agents: string[]     // Agents who can work this lead
  primary_agent_id: string      // Main agent assigned
  rotation_index: number       // For round-robin assignment
  status: 'new' | 'assigned' | 'contacted' | 'qualified' | 'converted' | 'lost'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  contact_info: {
    name: string
    phone?: string
    email?: string
    preferred_contact: 'phone' | 'email' | 'whatsapp'
    best_time_to_contact?: string
  }
  requirements: {
    property_type: string[]
    location_preference: string[]
    budget_min?: number
    budget_max?: number
    timeline: 'immediate' | '1_month' | '3_months' | '6_months' | '1_year'
    notes?: string
  }
  activity_log: {
    agent_id: string
    action: string
    notes?: string
    created_at: string
  }[]
  conversion_details?: {
    converted_at: string
    converted_by: string
    property_id?: string
    commission_earned: number
  }
}

// ============================================================================
// Team Analytics & Performance
// ============================================================================

export interface TeamAnalytics extends Models.Document {
  team_id: string
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  period_start: string
  period_end: string
  metrics: {
    // Listing metrics
    total_listings: number
    new_listings: number
    active_listings: number
    sold_listings: number
    average_days_on_market: number
    average_listing_price: number
    average_sale_price: number
    
    // Lead metrics
    total_leads: number
    new_leads: number
    qualified_leads: number
    converted_leads: number
    lead_conversion_rate: number
    average_response_time: number
    median_response_time: number // New: Median calculation
    response_time_breakdown: {
      call: number
      email: number
      sms: number
      whatsapp: number
      other: number
    }
    resolution_time_avg: number // New: Resolution time

    // Gamification & Leaderboard
    leaderboard: {
      agent_id: string
      name: string
      points: number
      rank: number
      badges: string[]
      streak_days: number
    }[]
    
    // Team performance
    total_commission: number
    average_rating: number
    client_satisfaction: number
    agent_productivity: {
      [agent_id: string]: {
        listings: number
        sales: number
        leads_handled: number
        conversion_rate: number
        commission_earned: number
        avg_response_time: number
        median_response_time: number
        resolution_time_avg: number
        response_time_breakdown: {
            call: number
            email: number
            sms: number
            whatsapp: number
            other: number
        }
        points: number
        streak_days: number
        badges: string[]
      }
    }
    
    // Market insights
    top_locations: {
      location: string
      listings: number
      sales: number
      average_price: number
    }[]
    
    popular_property_types: {
      type: string
      listings: number
      sales: number
      average_price: number
    }[]
  }
}

// ============================================================================
// Team Communication
// ============================================================================

export interface TeamMessage extends Models.Document {
  team_id: string
  sender_id: string
  message_type: 'announcement' | 'listing_update' | 'lead_alert' | 'general' | 'urgent'
  title: string
  content: string
  recipients?: string[]        // Specific agents, empty = all team
  priority: 'low' | 'normal' | 'high' | 'urgent'
  is_read: boolean[]           // Track who has read it
  attachments?: {
    file_id: string
    file_name: string
    file_type: string
  }[]
  related_listing_id?: string
  related_lead_id?: string
  expires_at?: string
}

// ============================================================================
// Team Wallet & Finances
// ============================================================================

export interface TeamWallet extends Models.Document {
  team_id: string
  balance: number
  currency: string
  is_active: boolean
  transaction_history: {
    transaction_id: string
    type: 'deposit' | 'withdrawal' | 'commission' | 'fee' | 'refund'
    amount: number
    description: string
    agent_id?: string
    listing_id?: string
    created_at: string
  }[]
  settings: {
    auto_payout: boolean
    payout_threshold: number
    payout_schedule: 'weekly' | 'bi_weekly' | 'monthly'
  }
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateTeamRequest {
  agency_name: string
  license_number?: string
  office_address?: string
  office_phone?: string
  office_email?: string
  service_areas: string[]
  specializations: string[]
  team_type: 'agency' | 'brokerage' | 'franchise' | 'independent'
  max_members: number
  initial_members?: {
    user_id: string
    role: AgentTeamRole
    commission_split: number
  }[]
}

export interface UpdateTeamRequest {
  agency_name?: string
  license_number?: string
  office_address?: string
  office_phone?: string
  office_email?: string
  service_areas?: string[]
  specializations?: string[]
  branding?: {
    logo_url?: string
    primary_color?: string
    website_url?: string
  }
}

export interface AddTeamMemberRequest {
  user_id: string
  role: AgentTeamRole
  commission_split: number
  monthly_fee?: number
  permissions?: Partial<AgentTeamMembership['permissions']>
}

export interface TeamLeadAssignment {
  lead_id: string
  agent_id: string
  notes?: string
  priority?: TeamLead['priority']
}

// ============================================================================
// Permission Helpers
// ============================================================================

export const getRolePermissions = (role: AgentTeamRole): AgentTeamMembership['permissions'] => {
  const basePermissions = {
    can_create_listings: false,
    can_edit_team_listings: false,
    can_delete_listings: false,
    can_view_analytics: false,
    can_manage_members: false,
    can_assign_leads: false,
    can_access_team_wallet: false,
  }

  switch (role) {
    case 'owner':
      return {
        ...basePermissions,
        can_create_listings: true,
        can_edit_team_listings: true,
        can_delete_listings: true,
        can_view_analytics: true,
        can_manage_members: true,
        can_assign_leads: true,
        can_access_team_wallet: true,
      }
    case 'admin':
      return {
        ...basePermissions,
        can_create_listings: true,
        can_edit_team_listings: true,
        can_delete_listings: true,
        can_view_analytics: true,
        can_manage_members: true,
        can_assign_leads: true,
        can_access_team_wallet: true,
      }
    case 'senior':
      return {
        ...basePermissions,
        can_create_listings: true,
        can_edit_team_listings: true,
        can_delete_listings: false,
        can_view_analytics: true,
        can_manage_members: false,
        can_assign_leads: true,
        can_access_team_wallet: false,
      }
    case 'agent':
      return {
        ...basePermissions,
        can_create_listings: true,
        can_edit_team_listings: true,
        can_delete_listings: false,
        can_view_analytics: true,
        can_manage_members: false,
        can_assign_leads: false,
        can_access_team_wallet: false,
      }
    case 'junior':
      return {
        ...basePermissions,
        can_create_listings: true,
        can_edit_team_listings: false,
        can_delete_listings: false,
        can_view_analytics: false,
        can_manage_members: false,
        can_assign_leads: false,
        can_access_team_wallet: false,
      }
    case 'assistant':
      return {
        ...basePermissions,
        can_create_listings: false,
        can_edit_team_listings: false,
        can_delete_listings: false,
        can_view_analytics: false,
        can_manage_members: false,
        can_assign_leads: false,
        can_access_team_wallet: false,
      }
    default:
      return basePermissions
  }
}