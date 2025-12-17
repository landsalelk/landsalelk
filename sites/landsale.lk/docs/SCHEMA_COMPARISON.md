# Schema Comparison: Appwrite ListingDocument vs API Data

## Appwrite Schema (from types/appwrite.ts)

| Field | Type | Required | API Source | Notes |
|-------|------|----------|------------|-------|
| `user_id` | string | Yes | `user_id` | ✅ Available |
| `team_id` | string | No | - | ❌ Missing - default: null |
| `category_id` | string | Yes | `category.id` | ✅ Map to Appwrite ID |
| `title` | string (JSON) | Yes | `title` | ✅ Wrap as I18n |
| `description` | string (JSON) | Yes | `description` | ✅ Wrap as I18n |
| `slug` | string | Yes | - | ❌ Missing - Generate from title |
| `listing_type` | enum | Yes | - | ❌ Missing - default: "sale" |
| `status` | enum | Yes | `active` | ✅ Map boolean to status |
| `price` | number | Yes | `price` | ⚠️ Often null - default: 0 |
| `currency_code` | string | Yes | `currency` | ✅ Default: "LKR" |
| `price_negotiable` | boolean | Yes | - | ❌ Missing - default: true |
| `location` | string (JSON) | Yes | `location` | ✅ Restructure |
| `contact` | string (JSON) | Yes | `contact_*` | ✅ Combine fields |
| `attributes` | string (JSON) | No | - | ❌ Missing - default: {} |
| `features` | string[] | No | - | ❌ Missing - default: [] |
| `images` | string[] | No | `images` | ✅ URLs to upload |
| `videos` | string[] | No | - | ❌ Missing - default: [] |
| `is_premium` | boolean | Yes | `premium` | ✅ Available |
| `views_count` | number | Yes | `views` | ✅ Available |
| `expires_at` | string | Yes | - | ❌ Missing - default: +1 year |
| `published_at` | string | No | `published_date` | ✅ Convert format |
| `ip_address` | string | Yes | - | ❌ Missing - default: "0.0.0.0" |
| `auction_enabled` | boolean | Yes | - | ❌ Missing - default: false |
| `min_bid_amount` | number | No | - | ❌ N/A |
| `current_bid_amount` | number | No | - | ❌ N/A |
| `bid_count` | number | Yes | - | ❌ Missing - default: 0 |
| `auction_ends_at` | string | No | - | ❌ N/A |
| `seo_title` | string (JSON) | No | - | ❌ Use title |
| `seo_description` | string (JSON) | No | - | ❌ Use description excerpt |
| `seo_keywords` | string[] | No | - | ❌ Extract from title |

## Summary
- **Available from API**: 10 fields
- **Missing (need defaults/fake)**: 12+ fields
- **Critical missing**: `slug`, `listing_type`, `ip_address`, `expires_at`, `auction_enabled`, `bid_count`
