# Appwrite Collection Setup: agent_leads

This document describes how to create the `agent_leads` collection in your Appwrite Console.

## Collection Details

- **Collection ID**: `agent_leads`
- **Collection Name**: Agent Leads
- **Database**: `osclass_landsale_db`

## Attributes

| Attribute | Type | Size | Required | Default | Notes |
|-----------|------|------|----------|---------|-------|
| `agent_id` | String | 36 | Yes | - | Agent document ID |
| `agent_user_id` | String | 36 | Yes | - | User ID of the agent |
| `property_id` | String | 36 | Yes | - | Listing document ID |
| `property_title` | String | 500 | Yes | - | Property title |
| `city` | String | 100 | No | - | City name |
| `district` | String | 100 | No | - | District name |
| `price` | Integer | - | No | 0 | Property price |
| `seller_phone` | String | 20 | No | - | Seller contact phone |
| `status` | Enum | - | No | `new` | `new`, `contacted`, `viewing_scheduled`, `negotiation`, `closed`, `lost` |
| `priority` | Enum | - | No | `medium` | `low`, `medium`, `high` |
| `notes` | String[] | - | No | [] | Array of timestamped notes |
| `created_at` | DateTime | - | No | - | Lead creation time |

## Indexes

| Key | Type | Attributes | Orders |
|-----|------|------------|--------|
| `agent_user_id` | Key | `agent_user_id` | ASC |
| `status` | Key | `status` | ASC |
| `created_at` | Key | `created_at` | DESC |

## Permissions

For **Realtime** to work with authenticated users, set these permissions:

- **Read**: `users` (Any user can read their own leads - refine with custom auth)
- **Create**: `team:server` or API Key only (Leads created by server on listing creation)
- **Update**: `users` (Agents can update their lead status)
- **Delete**: `users` or restricted

> **Note**: For production, consider using Document Security to restrict read access to only the agent_user_id matching the current user.

## Quick Setup via Appwrite CLI

```bash
appwrite databases createCollection \
  --databaseId osclass_landsale_db \
  --collectionId agent_leads \
  --name "Agent Leads" \
  --permissions 'read("users")' 'write("users")'
```

Then add attributes:

```bash
appwrite databases createStringAttribute \
  --databaseId osclass_landsale_db \
  --collectionId agent_leads \
  --key agent_id \
  --size 36 \
  --required true

# Repeat for other attributes...
```

## Verification

After creating the collection:

1. Go to Appwrite Console → Databases → `osclass_landsale_db` → `agent_leads`
2. Verify all attributes are created
3. Test creating a document manually
4. Enable Realtime for this collection (usually auto-enabled)
