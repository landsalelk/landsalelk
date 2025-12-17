# 🔍 Complete Database Analysis Report
**Generated**: 12/15/2025, 5:11:49 PM
**Database**: landsalelkdb
---
## 📊 Summary
**Total Documents**: 5,375
**Total Collections**: 22

| Collection | Documents | Attributes | Completeness |
|------------|-----------|------------|-------------|
| Listings | 0 | 25 | 0% |
| Categories | 10 | 8 | 100% |
| Users Extended | 0 | 22 | 0% |
| Countries | 1 | 12 | 100% |
| Regions | 25 | 13 | 75% |
| Cities | 339 | 20 | 53% |
| Areas | 5,000 | 9 | 44% |
| Favorites | 0 | 3 | 0% |
| Reviews | 0 | 6 | 0% |
| Saved Searches | 0 | 7 | 0% |
| CMS Pages | 0 | 7 | 0% |
| Settings | 0 | 4 | 0% |
| Transactions | 0 | 7 | 0% |
| User Wallets | 0 | 5 | 0% |
| Listing Offers | 0 | 7 | 0% |
| SEO Meta | 0 | 9 | 0% |
| Blog Posts | 0 | 9 | 0% |
| FAQs | 0 | 5 | 0% |
| Agents | 0 | 9 | 0% |
| Digital Purchases | 0 | 8 | 0% |
| Notifications | 0 | 6 | 0% |
| Land Registry Offices | 0 | 14 | 0% |

---
## 📋 Detailed Collection Analysis

### Listings Collection
**ID**: `listings`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| category_id | string | ✓ | ❌ 0% |
| title | string | ✓ | ❌ 0% |
| description | string | ✓ | ❌ 0% |
| slug | string | ✓ | ❌ 0% |
| listing_type | string | ✓ | ❌ 0% |
| status | string | ✓ | ❌ 0% |
| price | integer | ✓ | ❌ 0% |
| currency_code | string | ✓ | ❌ 0% |
| price_negotiable | boolean | - | ❌ 0% |
| location | string | ✓ | ❌ 0% |
| contact | string | ✓ | ❌ 0% |
| is_premium | boolean | - | ❌ 0% |
| attributes | string | - | ❌ 0% |
| features | string | - | ❌ 0% |
| images | string | - | ❌ 0% |
| expires_at | datetime | - | ❌ 0% |
| ip_address | string | - | ❌ 0% |
| auction_enabled | boolean | - | ❌ 0% |
| views_count | integer | - | ❌ 0% |
| bid_count | integer | - | ❌ 0% |
| verification_requested | boolean | - | ❌ 0% |
| verification_paid | boolean | - | ❌ 0% |
| boost_until | datetime | - | ❌ 0% |
| is_boosted | boolean | - | ❌ 0% |

**⚠️ Empty Fields**: user_id, category_id, title, description, slug, listing_type, status, price, currency_code, price_negotiable, location, contact, is_premium, attributes, features, images, expires_at, ip_address, auction_enabled, views_count, bid_count, verification_requested, verification_paid, boost_until, is_boosted

### Categories Collection
**ID**: `categories`
**Total Documents**: 10

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| name | string | ✓ | ✅ 100% |
| description | string | ✓ | ✅ 100% |
| icon | string | - | ✅ 100% |
| color | string | - | ✅ 100% |
| parent_id | integer | - | ✅ 100% |
| sort_order | integer | ✓ | ✅ 100% |
| is_active | boolean | ✓ | ✅ 100% |
| slug | string | - | ✅ 100% |

#### Sample Data
```json
{
  "name": "Land for Sale",
  "description": "Vacant land and plots for sale",
  "icon": "terrain",
  "color": "#4CAF50",
  "parent_id": 0,
  "sort_order": 1,
  "is_active": true,
  "slug": "land-for-sale",
  "$id": "land-sale",
  "$sequence": 26,
  "$createdAt": "2025-12-15T11:24:16.867+00:00",
  "$updatedAt": "2025-12-15T11:24:16.867+00:00",
  "$permissions": [],
  "$databaseId": "landsalelkdb",
  "$collectionId": "categories"
}
```

### Users Extended Collection
**ID**: `users_extended`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| first_name | string | - | ❌ 0% |
| last_name | string | - | ❌ 0% |
| phone | string | - | ❌ 0% |
| avatar | string | - | ❌ 0% |
| country_id | string | - | ❌ 0% |
| region_id | string | - | ❌ 0% |
| city_id | string | - | ❌ 0% |
| area_id | string | - | ❌ 0% |
| address | string | - | ❌ 0% |
| postal_code | string | - | ❌ 0% |
| company_name | string | - | ❌ 0% |
| company_phone | string | - | ❌ 0% |
| company_website | string | - | ❌ 0% |
| bio | string | - | ❌ 0% |
| date_of_birth | datetime | - | ❌ 0% |
| gender | string | - | ❌ 0% |
| language | string | - | ❌ 0% |
| timezone | string | - | ❌ 0% |
| is_verified | boolean | ✓ | ❌ 0% |
| is_premium | boolean | ✓ | ❌ 0% |
| premium_expires_at | datetime | - | ❌ 0% |

**⚠️ Empty Fields**: user_id, first_name, last_name, phone, avatar, country_id, region_id, city_id, area_id, address, postal_code, company_name, company_phone, company_website, bio, date_of_birth, gender, language, timezone, is_verified, is_premium, premium_expires_at

### Countries Collection
**ID**: `countries`
**Total Documents**: 1

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| name | string | ✓ | ✅ 100% |
| native_name | string | - | ✅ 100% |
| iso_code | string | ✓ | ✅ 100% |
| iso3_code | string | - | ✅ 100% |
| phone_code | integer | - | ✅ 100% |
| capital | string | - | ✅ 100% |
| currency | string | - | ✅ 100% |
| currency_symbol | string | - | ✅ 100% |
| is_active | boolean | ✓ | ✅ 100% |
| sort_order | integer | - | ✅ 100% |
| code | string | ✓ | ✅ 100% |
| slug | string | ✓ | ✅ 100% |

#### Sample Data
```json
{
  "name": "Sri Lanka",
  "native_name": "ශ්‍රී ලංකා",
  "iso_code": "LK",
  "iso3_code": "LKA",
  "phone_code": 94,
  "capital": "Sri Jayawardenepura Kotte",
  "currency": "LKR",
  "currency_symbol": "Rs",
  "is_active": true,
  "sort_order": 1,
  "code": "LK",
  "slug": "sri-lanka",
  "$id": "LK",
  "$sequence": 26,
  "$createdAt": "2025-12-15T11:24:16.499+00:00",
  "$updatedAt": "2025-12-15T11:24:16.499+00:00",
  "$permissions": [],
  "$databaseId": "landsalelkdb",
  "$collectionId": "countries"
}
```

### Regions Collection
**ID**: `regions`
**Total Documents**: 25

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| name | string | ✓ | ✅ 100% |
| country_id | string | ✓ | ✅ 100% |
| native_name | string | - | ✅ 100% |
| code | string | - | ❌ 0% |
| is_active | boolean | ✓ | ✅ 100% |
| sort_order | integer | - | ❌ 0% |
| country_code | string | ✓ | ✅ 100% |
| slug | string | ✓ | ✅ 100% |
| postal_code | string | - | ✅ 92% |
| latitude | double | - | ✅ 96% |
| longitude | double | - | ✅ 96% |
| population | integer | - | ✅ 96% |
| elevation | integer | - | ❌ 0% |

**⚠️ Empty Fields**: code, sort_order, elevation

#### Sample Data
```json
{
  "name": "Colombo",
  "country_id": "LK",
  "native_name": "කොළඹ දිස්ත්‍රික්ක",
  "code": null,
  "is_active": true,
  "sort_order": null,
  "country_code": "LK",
  "slug": "colombo-lk11",
  "postal_code": "00100",
  "latitude": 6.93548,
  "longitude": 79.84868,
  "population": 648034,
  "elevation": null,
  "$id": "LK11",
  "$sequence": 26,
  "$createdAt": "2025-12-15T10:36:23.742+00:00",
  "$updatedAt": "2025-12-15T11:27:05.495+00:00",
  "$permissions": [],
  "$databaseId": "landsalelkdb",
  "$collectionId": "regions"
}
```

### Cities Collection
**ID**: `cities`
**Total Documents**: 339

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| name | string | ✓ | ✅ 100% |
| country_id | string | ✓ | ✅ 100% |
| region_id | string | - | ✅ 100% |
| native_name | string | - | ✅ 100% |
| code | string | - | ❌ 0% |
| latitude | double | - | ✅ 100% |
| longitude | double | - | ✅ 100% |
| is_active | boolean | ✓ | ✅ 100% |
| sort_order | integer | - | ❌ 0% |
| slug | string | ✓ | ✅ 100% |
| postal_code | string | - | ✅ 100% |
| population | integer | - | ✅ 83% |
| elevation | integer | - | ✅ 83% |
| timezone | string | - | ❌ 0% |
| schools_nearby | integer | - | ❌ 0% |
| hospitals_nearby | integer | - | ❌ 0% |
| banks_nearby | integer | - | ❌ 0% |
| places_of_worship_nearby | integer | - | ❌ 0% |
| nearest_school | string | - | ❌ 0% |
| nearest_hospital | string | - | ❌ 0% |

**⚠️ Empty Fields**: code, sort_order, timezone, schools_nearby, hospitals_nearby, banks_nearby, places_of_worship_nearby, nearest_school, nearest_hospital

#### Sample Data
```json
{
  "name": "Colombo",
  "country_id": "LK",
  "region_id": "LK11",
  "native_name": "කොළඹ",
  "code": null,
  "latitude": 6.94698684,
  "longitude": 79.86526281,
  "is_active": true,
  "sort_order": null,
  "slug": "colombo-lk1103",
  "postal_code": "00100",
  "population": 648034,
  "elevation": 0,
  "timezone": null,
  "schools_nearby": null,
  "hospitals_nearby": null,
  "banks_nearby": null,
  "places_of_worship_nearby": null,
  "nearest_school": null,
  "nearest_hospital": null,
  "$id": "LK1103",
  "$sequence": 27,
  "$createdAt": "2025-12-15T10:38:24.596+00:00",
  "$updatedAt": "2025-12-15T11:27:28.705+00:00",
  "$permissions": [],
  "$databaseId": "landsalelkdb",
  "$collectionId": "cities"
}
```

### Areas Collection
**ID**: `areas`
**Total Documents**: 5,000

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| name | string | ✓ | ✅ 100% |
| city_id | string | ✓ | ✅ 100% |
| native_name | string | - | ❌ 0% |
| postal_code | string | - | ❌ 0% |
| latitude | double | - | ❌ 0% |
| longitude | double | - | ❌ 0% |
| is_active | boolean | ✓ | ✅ 100% |
| sort_order | integer | - | ❌ 0% |
| slug | string | ✓ | ✅ 100% |

**⚠️ Empty Fields**: native_name, postal_code, latitude, longitude, sort_order

#### Sample Data
```json
{
  "name": "Sammanthranapura",
  "city_id": "LK1103",
  "native_name": null,
  "postal_code": null,
  "latitude": null,
  "longitude": null,
  "is_active": true,
  "sort_order": null,
  "slug": "sammanthranapura-lk1103005",
  "$id": "LK1103005",
  "$sequence": 26,
  "$createdAt": "2025-12-15T10:13:13.290+00:00",
  "$updatedAt": "2025-12-15T10:13:13.290+00:00",
  "$permissions": [],
  "$databaseId": "landsalelkdb",
  "$collectionId": "areas"
}
```

### Favorites Collection
**ID**: `favorites`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| listing_id | string | ✓ | ❌ 0% |
| created_at | datetime | - | ❌ 0% |

**⚠️ Empty Fields**: user_id, listing_id, created_at

### Reviews Collection
**ID**: `reviews`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| listing_id | string | ✓ | ❌ 0% |
| rating | integer | ✓ | ❌ 0% |
| comment | string | - | ❌ 0% |
| is_approved | boolean | ✓ | ❌ 0% |
| created_at | datetime | - | ❌ 0% |

**⚠️ Empty Fields**: user_id, listing_id, rating, comment, is_approved, created_at

### Saved Searches Collection
**ID**: `saved_searches`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| name | string | ✓ | ❌ 0% |
| search_params | string | - | ❌ 0% |
| is_active | boolean | ✓ | ❌ 0% |
| created_at | datetime | - | ❌ 0% |
| frequency | string | - | ❌ 0% |
| last_sent_at | datetime | - | ❌ 0% |

**⚠️ Empty Fields**: user_id, name, search_params, is_active, created_at, frequency, last_sent_at

### CMS Pages Collection
**ID**: `cms_pages`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| title | string | ✓ | ❌ 0% |
| slug | string | ✓ | ❌ 0% |
| content | string | - | ❌ 0% |
| meta_title | string | - | ❌ 0% |
| meta_description | string | - | ❌ 0% |
| is_active | boolean | ✓ | ❌ 0% |
| created_at | datetime | - | ❌ 0% |

**⚠️ Empty Fields**: title, slug, content, meta_title, meta_description, is_active, created_at

### Settings Collection
**ID**: `settings`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| key | string | ✓ | ❌ 0% |
| value | string | - | ❌ 0% |
| description | string | - | ❌ 0% |
| type | string | - | ❌ 0% |

**⚠️ Empty Fields**: key, value, description, type

### Transactions Collection
**ID**: `transactions`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| type | string | ✓ | ❌ 0% |
| amount | double | ✓ | ❌ 0% |
| currency_code | string | ✓ | ❌ 0% |
| status | string | ✓ | ❌ 0% |
| description | string | - | ❌ 0% |
| created_at | datetime | - | ❌ 0% |

**⚠️ Empty Fields**: user_id, type, amount, currency_code, status, description, created_at

### User Wallets Collection
**ID**: `user_wallets`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| balance | double | ✓ | ❌ 0% |
| currency_code | string | ✓ | ❌ 0% |
| total_deposits | double | - | ❌ 0% |
| is_active | boolean | ✓ | ❌ 0% |

**⚠️ Empty Fields**: user_id, balance, currency_code, total_deposits, is_active

### Listing Offers Collection
**ID**: `listing_offers`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| listing_id | string | ✓ | ❌ 0% |
| offer_amount | double | ✓ | ❌ 0% |
| currency_code | string | ✓ | ❌ 0% |
| message | string | - | ❌ 0% |
| status | string | ✓ | ❌ 0% |
| created_at | datetime | - | ❌ 0% |

**⚠️ Empty Fields**: user_id, listing_id, offer_amount, currency_code, message, status, created_at

### SEO Meta Collection
**ID**: `seo_meta`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| object_id | string | ✓ | ❌ 0% |
| object_type | string | ✓ | ❌ 0% |
| title | string | - | ❌ 0% |
| description | string | - | ❌ 0% |
| keywords | string | - | ❌ 0% |
| canonical_url | string | - | ❌ 0% |
| og_title | string | - | ❌ 0% |
| og_description | string | - | ❌ 0% |
| og_image | string | - | ❌ 0% |

**⚠️ Empty Fields**: object_id, object_type, title, description, keywords, canonical_url, og_title, og_description, og_image

### Blog Posts Collection
**ID**: `blog_posts`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| title | string | ✓ | ❌ 0% |
| slug | string | ✓ | ❌ 0% |
| content | string | - | ❌ 0% |
| excerpt | string | - | ❌ 0% |
| featured_image | string | - | ❌ 0% |
| status | string | ✓ | ❌ 0% |
| is_featured | boolean | ✓ | ❌ 0% |
| published_at | datetime | - | ❌ 0% |

**⚠️ Empty Fields**: user_id, title, slug, content, excerpt, featured_image, status, is_featured, published_at

### FAQs Collection
**ID**: `faqs`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| question | string | ✓ | ❌ 0% |
| answer | string | ✓ | ❌ 0% |
| category | string | ✓ | ❌ 0% |
| sort_order | integer | - | ❌ 0% |
| is_active | boolean | ✓ | ❌ 0% |

**⚠️ Empty Fields**: question, answer, category, sort_order, is_active

### Agents Collection
**ID**: `agents`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| name | string | ✓ | ❌ 0% |
| phone | string | ✓ | ❌ 0% |
| whatsapp | string | - | ❌ 0% |
| bio | string | - | ❌ 0% |
| experience_years | integer | - | ❌ 0% |
| service_areas | string | - | ❌ 0% |
| specializations | string | - | ❌ 0% |
| email | string | - | ❌ 0% |

**⚠️ Empty Fields**: user_id, name, phone, whatsapp, bio, experience_years, service_areas, specializations, email

### Digital Purchases Collection
**ID**: `digital_purchases`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| property_id | string | ✓ | ❌ 0% |
| product_type | string | ✓ | ❌ 0% |
| payment_id | string | ✓ | ❌ 0% |
| status | string | ✓ | ❌ 0% |
| file_id | string | - | ❌ 0% |
| created_at | datetime | ✓ | ❌ 0% |
| completed_at | datetime | - | ❌ 0% |

**⚠️ Empty Fields**: user_id, property_id, product_type, payment_id, status, file_id, created_at, completed_at

### Notifications Collection
**ID**: `notifications`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| user_id | string | ✓ | ❌ 0% |
| type | string | ✓ | ❌ 0% |
| title | string | ✓ | ❌ 0% |
| message | string | ✓ | ❌ 0% |
| link | string | - | ❌ 0% |
| metadata | string | - | ❌ 0% |

**⚠️ Empty Fields**: user_id, type, title, message, link, metadata

### Land Registry Offices Collection
**ID**: `land_offices`
**Total Documents**: 0

#### Attributes
| Field | Type | Required | Completeness |
|-------|------|----------|-------------|
| name_en | string | ✓ | ❌ 0% |
| name_si | string | ✓ | ❌ 0% |
| name_ta | string | ✓ | ❌ 0% |
| district_id | string | ✓ | ❌ 0% |
| province_id | string | ✓ | ❌ 0% |
| city_id | string | ✓ | ❌ 0% |
| address | string | ✓ | ❌ 0% |
| coordinates_lat | double | ✓ | ❌ 0% |
| coordinates_lng | double | ✓ | ❌ 0% |
| contact_phone | string | - | ❌ 0% |
| contact_email | string | - | ❌ 0% |
| contact_website | string | - | ❌ 0% |
| contact_fax | string | - | ❌ 0% |
| services | string | - | ❌ 0% |

**⚠️ Empty Fields**: name_en, name_si, name_ta, district_id, province_id, city_id, address, coordinates_lat, coordinates_lng, contact_phone, contact_email, contact_website, contact_fax, services

---
## 🔗 Relationship Integrity
✅ All relationships are valid!

---
## 💡 Recommendations

### Listings
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, category_id, title, description, slug, listing_type, status, price, currency_code, price_negotiable, location, contact, is_premium, attributes, features, images, expires_at, ip_address, auction_enabled, views_count, bid_count, verification_requested, verification_paid, boost_until, is_boosted
- **Action**: Consider enriching these fields or making them optional

### Users Extended
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, first_name, last_name, phone, avatar, country_id, region_id, city_id, area_id, address, postal_code, company_name, company_phone, company_website, bio, date_of_birth, gender, language, timezone, is_verified, is_premium, premium_expires_at
- **Action**: Consider enriching these fields or making them optional

### Cities
- **Data Completeness**: 53% (Target: 80%+)
- **Incomplete Fields**: code, sort_order, timezone, schools_nearby, hospitals_nearby, banks_nearby, places_of_worship_nearby, nearest_school, nearest_hospital
- **Action**: Consider enriching these fields or making them optional

### Areas
- **Data Completeness**: 44% (Target: 80%+)
- **Incomplete Fields**: native_name, postal_code, latitude, longitude, sort_order
- **Action**: Consider enriching these fields or making them optional

### Favorites
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, listing_id, created_at
- **Action**: Consider enriching these fields or making them optional

### Reviews
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, listing_id, rating, comment, is_approved, created_at
- **Action**: Consider enriching these fields or making them optional

### Saved Searches
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, name, search_params, is_active, created_at, frequency, last_sent_at
- **Action**: Consider enriching these fields or making them optional

### CMS Pages
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: title, slug, content, meta_title, meta_description, is_active, created_at
- **Action**: Consider enriching these fields or making them optional

### Settings
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: key, value, description, type
- **Action**: Consider enriching these fields or making them optional

### Transactions
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, type, amount, currency_code, status, description, created_at
- **Action**: Consider enriching these fields or making them optional

### User Wallets
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, balance, currency_code, total_deposits, is_active
- **Action**: Consider enriching these fields or making them optional

### Listing Offers
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, listing_id, offer_amount, currency_code, message, status, created_at
- **Action**: Consider enriching these fields or making them optional

### SEO Meta
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: object_id, object_type, title, description, keywords, canonical_url, og_title, og_description, og_image
- **Action**: Consider enriching these fields or making them optional

### Blog Posts
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, title, slug, content, excerpt, featured_image, status, is_featured, published_at
- **Action**: Consider enriching these fields or making them optional

### FAQs
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: question, answer, category, sort_order, is_active
- **Action**: Consider enriching these fields or making them optional

### Agents
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, name, phone, whatsapp, bio, experience_years, service_areas, specializations, email
- **Action**: Consider enriching these fields or making them optional

### Digital Purchases
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, property_id, product_type, payment_id, status, file_id, created_at, completed_at
- **Action**: Consider enriching these fields or making them optional

### Notifications
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: user_id, type, title, message, link, metadata
- **Action**: Consider enriching these fields or making them optional

### Land Registry Offices
- **Data Completeness**: 0% (Target: 80%+)
- **Incomplete Fields**: name_en, name_si, name_ta, district_id, province_id, city_id, address, coordinates_lat, coordinates_lng, contact_phone, contact_email, contact_website, contact_fax, services
- **Action**: Consider enriching these fields or making them optional

---
## ⚡ Performance Metrics
- **Largest Collection**: Areas (5,000 docs)
- **Most Attributes**: Listings (25 fields)
