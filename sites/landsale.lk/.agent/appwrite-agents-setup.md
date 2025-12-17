# Appwrite Collection Setup: agents

This document describes how to create/update the `agents` collection in your Appwrite Console.

## Collection Details

- **Collection ID**: `agents`
- **Collection Name**: Agents
- **Database**: `osclass_landsale_db`

## Attributes

| Attribute | Type | Size | Required | Default | Notes |
|-----------|------|------|----------|---------|-------|
| `user_id` | String | 36 | Yes | - | Appwrite User ID |
| `name` | String | 200 | Yes | - | Agent's full name |
| `email` | String | 320 | No | - | Contact email |
| `phone` | String | 20 | Yes | - | Phone number |
| `whatsapp` | String | 20 | No | - | WhatsApp number |
| `bio` | String | 1000 | No | - | Agent bio/description |
| `avatar_url` | String | 500 | No | - | Profile image URL |
| `experience_years` | Integer | - | No | 0 | Years of experience |
| `service_areas` | String[] | - | Yes | [] | Array of districts |
| `specializations` | String[] | - | No | [] | Array of specializations |
| `is_verified` | Boolean | - | No | false | Verification status |
| `status` | Enum | - | No | `pending` | `pending`, `pending_review`, `active`, `suspended` |
| `rating` | Float | - | No | 0 | Average rating (0-5) |
| `review_count` | Integer | - | No | 0 | Total reviews |
| `deals_count` | Integer | - | No | 0 | Closed deals |
| `verification_documents` | String | 5000 | No | [] | JSON array of doc references |
| `vacation_mode` | Boolean | - | No | false | Away/vacation status |
| `created_at` | DateTime | - | No | - | Registration date |
| `updated_at` | DateTime | - | No | - | Last update date |

## Indexes

| Key | Type | Attributes | Orders |
|-----|------|------------|--------|
| `user_id` | Unique | `user_id` | ASC |
| `status_verified` | Key | `status`, `is_verified` | ASC, ASC |
| `service_areas` | Fulltext | `service_areas` | - |
| `rating` | Key | `rating` | DESC |

## Permissions

- **Read**: `any` (Public agents visible to all)
- **Create**: `users` (Logged in users can register)
- **Update**: `user:{user_id}` (Agents can update own profile)
- **Delete**: Restricted to admins

## Quick Setup via Appwrite Console

1. Go to Appwrite Console → Databases → `osclass_landsale_db`
2. Click "Create Collection" or select existing `agents`
3. Add each attribute from the table above
4. Create the indexes
5. Set permissions

## Notes

- The `verification_documents` field stores a JSON string array like:
  ```json
  [
    {"file_id": "abc123", "document_type": "nic", "file_name": "nic_front.jpg", "uploaded_at": "2024-12-16T10:00:00Z"}
  ]
  ```
- When an agent uploads documents, their status changes to `pending_review`
- Admin must manually set `is_verified: true` and `status: active` after reviewing documents
