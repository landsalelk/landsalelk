# Appwrite Teams Implementation - Database Schema Updates

## Database Information
**Database ID**: `osclass_landsale_db` (existing database)

**Note**: A mistakenly created database `real_estate_platform` should be deleted from the Appwrite console.

## Required Collections for Teams Functionality

### 1. teams_extended
**Purpose**: Extended team information for real estate agencies

| Field | Type | Size/Values | Required | Description |
|-------|------|-------------|----------|-------------|
| team_id | string | 36 | ✅ | Appwrite team ID |
| agency_name | string | 200 | ✅ | Agency/business name |
| license_number | string | 50 | ❌ | Real estate license number |
| office_address | string | 500 | ❌ | Physical office address |
| office_phone | string | 20 | ❌ | Office contact number |
| office_email | string | 100 | ❌ | Office email address |
| service_areas | string[] | - | ✅ | Array of districts/regions served |
| specializations | string[] | - | ✅ | Property types specialized in |
| team_type | enum | agency, brokerage, franchise, independent | ✅ | Type of real estate business |
| is_verified | boolean | - | ✅ | Verification status |
| verification_status | enum | pending, verified, rejected | ✅ | Current verification state |
| max_members | integer | - | ✅ | Maximum allowed team members |
| subscription_tier | enum | basic, premium, enterprise | ✅ | Subscription level |
| branding | string | 2000 | ❌ | JSON: {logo_url, primary_color, website_url} |
| stats | string | 1000 | ✅ | JSON: team statistics |
| created_at | datetime | - | ✅ | Creation timestamp |
| updated_at | datetime | - | ✅ | Last update timestamp |

**Indexes**:
- team_id (unique)
- agency_name
- service_areas
- is_verified
- team_type

---

### 2. team_memberships_extended
**Purpose**: Extended membership data with real estate specific roles and permissions

| Field | Type | Size/Values | Required | Description |
|-------|------|-------------|----------|-------------|
| membership_id | string | 36 | ✅ | Appwrite membership ID |
| team_id | string | 36 | ✅ | Appwrite team ID |
| user_id | string | 36 | ✅ | Appwrite user ID |
| agent_id | string | 36 | ✅ | Reference to agents collection |
| role | enum | owner, admin, senior, agent, junior, assistant | ✅ | Team role |
| commission_split | number | 0-100 | ✅ | Commission percentage |
| monthly_fee | number | - | ❌ | Monthly desk/team fee |
| is_team_lead | boolean | - | ✅ | Has team lead responsibilities |
| permissions | string | 2000 | ✅ | JSON: role permissions |
| performance | string | 1000 | ✅ | JSON: performance metrics |
| joined_at | datetime | - | ✅ | Join date |
| license_info | string | 500 | ❌ | JSON: {license_number, license_type, expiry_date} |

**Indexes**:
- membership_id (unique)
- team_id + user_id (unique)
- role
- agent_id

---

### 3. team_listings
**Purpose**: Collaborative listings managed by team members

| Field | Type | Size/Values | Required | Description |
|-------|------|-------------|----------|-------------|
| listing_id | string | 36 | ✅ | Reference to main listings collection |
| team_id | string | 36 | ✅ | Appwrite team ID |
| assigned_agents | string[] | - | ✅ | Agent IDs who can manage |
| primary_agent_id | string | 36 | ✅ | Main responsible agent |
| collaboration_type | enum | solo, co_listing, team_listing | ✅ | Type of collaboration |
| commission_split | string | 1000 | ✅ | JSON: {agent_id: percentage} |
| status | enum | draft, active, pending_approval, approved, rejected | ✅ | Team listing status |
| approval_chain | string | 2000 | ❌ | JSON: approval workflow |
| team_notes | string | 2000 | ❌ | JSON: team communication |
| sharing_settings | string | 500 | ✅ | JSON: visibility settings |
| created_at | datetime | - | ✅ | Creation timestamp |
| updated_at | datetime | - | ✅ | Last update timestamp |

**Indexes**:
- listing_id + team_id (unique)
- team_id
- assigned_agents
- primary_agent_id
- status

---

### 4. team_leads
**Purpose**: Lead management and assignment within teams

| Field | Type | Size/Values | Required | Description |
|-------|------|-------------|----------|-------------|
| team_id | string | 36 | ✅ | Appwrite team ID |
| property_id | string | 36 | ❌ | Reference to listing (if property-specific) |
| lead_source | enum | direct, team_website, referral, walk_in, phone | ✅ | Lead origin |
| assigned_agents | string[] | - | ✅ | Agents working the lead |
| primary_agent_id | string | 36 | ✅ | Main assigned agent |
| rotation_index | integer | - | ✅ | For round-robin assignment |
| status | enum | new, assigned, contacted, qualified, converted, lost | ✅ | Lead status |
| priority | enum | low, medium, high, urgent | ✅ | Lead priority |
| contact_info | string | 500 | ✅ | JSON: contact details |
| requirements | string | 1000 | ✅ | JSON: client requirements |
| activity_log | string | 2000 | ❌ | JSON: interaction history |
| conversion_details | string | 500 | ❌ | JSON: conversion info |
| created_at | datetime | - | ✅ | Creation timestamp |
| updated_at | datetime | - | ✅ | Last update timestamp |

**Indexes**:
- team_id + status
- assigned_agents
- primary_agent_id
- status
- priority

---

### 5. team_messages
**Purpose**: Team communication and announcements

| Field | Type | Size/Values | Required | Description |
|-------|------|-------------|----------|-------------|
| team_id | string | 36 | ✅ | Appwrite team ID |
| sender_id | string | 36 | ✅ | Message sender |
| message_type | enum | announcement, listing_update, lead_alert, general, urgent | ✅ | Message category |
| title | string | 200 | ✅ | Message title |
| content | string | 2000 | ✅ | Message content |
| recipients | string[] | - | ❌ | Specific recipients (empty = all) |
| priority | enum | low, normal, high, urgent | ✅ | Message priority |
| is_read | string[] | - | ❌ | User IDs who have read it |
| attachments | string | 1000 | ❌ | JSON: file attachments |
| related_listing_id | string | 36 | ❌ | Reference to listing |
| related_lead_id | string | 36 | ❌ | Reference to lead |
| expires_at | datetime | - | ❌ | Expiration time |
| created_at | datetime | - | ✅ | Creation timestamp |

**Indexes**:
- team_id + created_at
- sender_id
- message_type
- priority

---

### 6. team_analytics
**Purpose**: Team performance metrics and analytics

| Field | Type | Size/Values | Required | Description |
|-------|------|-------------|----------|-------------|
| team_id | string | 36 | ✅ | Appwrite team ID |
| period | enum | daily, weekly, monthly, quarterly, yearly | ✅ | Analytics period |
| period_start | datetime | - | ✅ | Period start date |
| period_end | datetime | - | ✅ | Period end date |
| metrics | string | 5000 | ✅ | JSON: comprehensive metrics |
| created_at | datetime | - | ✅ | Creation timestamp |

**Indexes**:
- team_id + period + period_start (unique)
- period + period_start

---

### 7. team_wallet
**Purpose**: Team financial management and commission tracking

| Field | Type | Size/Values | Required | Description |
|-------|------|-------------|----------|-------------|
| team_id | string | 36 | ✅ | Appwrite team ID |
| balance | number | - | ✅ | Current wallet balance |
| currency | string | 3 | ✅ | Currency code |
| is_active | boolean | - | ✅ | Wallet status |
| transaction_history | string | 2000 | ❌ | JSON: transaction log |
| settings | string | 500 | ✅ | JSON: wallet settings |
| created_at | datetime | - | ✅ | Creation timestamp |
| updated_at | datetime | - | ✅ | Last update timestamp |

**Indexes**:
- team_id (unique)
- is_active

---

## API Key Permissions Required

For the Teams functionality to work properly, ensure your Appwrite API key has these permissions:

```
Teams (all permissions)
Database (all permissions) 
Users (read/write)
Functions (if using cloud functions)
```

## Implementation Notes

1. **Team Creation Flow**:
   - User creates Appwrite team via SDK
   - System creates extended team document
   - Owner gets full permissions

2. **Member Management**:
   - Add to Appwrite team for authentication
   - Create extended membership for real estate roles
   - Handle permissions based on role

3. **Collaborative Listings**:
   - Regular listing + team_listing document
   - Permission checks on both levels
   - Commission tracking

4. **Lead Assignment**:
   - Round-robin or manual assignment
   - Performance tracking
   - Conversion analytics

5. **Security Considerations**:
   - Validate all permissions server-side
   - Check team membership before operations
   - Audit logs for sensitive operations

## Migration Strategy

For existing agents to use teams:

1. Create default team for existing verified agents
2. Migrate their listings to team listings
3. Set appropriate roles and permissions
4. Update UI to show team options

## Next Steps

1. Create these collections in Appwrite console
2. Set up proper indexes for performance
3. Implement server-side validation
4. Create UI components for team management
5. Add team features to existing agent workflows