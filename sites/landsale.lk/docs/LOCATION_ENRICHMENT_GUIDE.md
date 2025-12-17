# Location Data Enrichment Guide

## 📊 Data Sources Summary

### 1. **GeoNames Postal Codes** (`docs/LK_postcodes/`)
- **Total Records**: 1,837 postal codes
- **Coverage**: All 25 districts of Sri Lanka
- **Fields Available**:
  - Postal Code
  - Place Name
  - Province & District
  - Latitude & Longitude
  - Accuracy

**Top Districts by Postal Codes**:
- Kurunegala: 201
- Kandy: 164
- Badulla: 132
- Anuradhapura: 128
- Gampaha: 126

### 2. **GeoNames Full Database** (`docs/LK_geonames/`)
- **Total Records**: 56,995 geographic places
- **Types**: Cities, towns, villages, landmarks, administrative areas
- **Fields Available**:
  - Geographic Names (English + alternatives)
  - Coordinates (Latitude & Longitude)
  - Population
  - Elevation
  - Timezone
  - Feature Class & Code
  - Administrative Hierarchy

## 🗄️ Database Schema Updates

### New Fields Added

#### **Regions Collection**
| Field | Type | Description |
|-------|------|-------------|
| `postal_code` | string(10) | District postal code |
| `latitude` | float | Geographic latitude |
| `longitude` | float | Geographic longitude |
| `population` | integer | Population count |
| `elevation` | integer | Elevation in meters |

#### **Cities Collection**
| Field | Type | Description |
|-------|------|-------------|
| `postal_code` | string(10) | City postal code |
| `population` | integer | Population count |
| `elevation` | integer | Elevation in meters |
| `timezone` | string(50) | Timezone (e.g., "Asia/Colombo") |

#### **Areas Collection**
| Field | Type | Description |
|-------|------|-------------|
| `postal_code` | string(10) | Area postal code |

## 🚀 Enrichment Scripts

### 1. **add_enrichment_fields.ts**
Adds new fields to existing collections.

```bash
npx tsx scripts/add_enrichment_fields.ts
```

**Status**: ✅ Completed

### 2. **enrich_locations.ts**
Enriches existing location data with GeoNames information.

```bash
npx tsx scripts/enrich_locations.ts
```

**What it does**:
- Matches existing regions/cities with GeoNames data
- Adds postal codes where available
- Adds population data
- Adds elevation data
- Adds coordinates (if missing)

## 📈 Expected Results

### Enrichment Coverage
- **Regions (25 districts)**: ~100% postal codes, ~90% population data
- **Cities (339 DS divisions)**: ~60-70% postal codes, ~40% population data
- **Areas (14,000+ GN divisions)**: Postal codes available on demand

### Matching Strategy

1. **Exact Name Match**: Primary method
2. **Partial Name Match**: Fallback for variations
3. **District-Level Defaults**: For unmapped locations

## 🔄 Future Data Updates

### Additional Data Sources Available

1. **Department of Census and Statistics**
   - URL: https://www.statistics.gov.lk
   - Population demographics
   - Housing statistics

2. **Survey Department GIS**
   - URL: https://survey.gov.lk
   - Official boundary data
   - Coordinate updates

3. **OpenStreetMap**
   - URL: https://download.geofabrik.de/asia/sri-lanka.html
   - Real-time data
   - Community-maintained

### Recommended Update Schedule
- **Postal Codes**: Annually (from GeoNames)
- **Population**: Every census cycle (~10 years)
- **Boundaries**: Check Survey Department quarterly
- **Elevation**: Static (one-time import)

## 📝 Usage Example

Once enriched, your locations will have:

```typescript
// Region (District)
{
  "$id": "LK11",
  "name": "Colombo",
  "country_code": "LK",
  "country_id": "LK",
  "postal_code": "00100",  // NEW
  "latitude": 6.9271,      // NEW
  "longitude": 79.8612,    // NEW
  "population": 2324000,   // NEW
  "elevation": 7,          // NEW
  "is_active": true,
  "slug": "colombo-lk11"
}

// City (DS Division)
{
  "$id": "LK1103",
  "name": "Thimbirigasyaya",
  "region_id": "LK11",
  "country_id": "LK",
  "postal_code": "00500",  // NEW
  "population": 45000,     // NEW
  "elevation": 10,         // NEW
  "timezone": "Asia/Colombo", // NEW
  "is_active": true,
  "slug": "thimbirigasyaya-lk1103"
}
```

## ⚠️ Important Notes

1. **Wait Time**: After running `add_enrichment_fields.ts`, wait 30-60 seconds before enrichment
2. **Partial Matches**: Some locations may use different spellings - manual review recommended
3. **Missing Data**: Not all locations in GeoNames have complete data (especially population)
4. **Backup**: Consider backing up database before running enrichment

## 🎯 Next Steps

1. ✅ Download GeoNames data
2. ✅ Add schema fields
3. ⏳ Run enrichment script
4. ⏳ Verify data quality
5. ⏳ Update frontend to display new fields

---

*Last Updated: December 2025*
