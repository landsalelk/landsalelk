/**
 * Appwrite Collection Setup for Sri Lankan Administrative Divisions
 * Creates all necessary collections with Grama Niladhari Division support
 * 
 * Usage: node scripts/setup-sri-lanka-locations.js
 */

import { config } from 'dotenv'
import { Client, Databases, ID, Query } from 'node-appwrite'
import { DATABASE_ID } from '../src/lib/appwrite/server.ts'

// Load environment variables
config({ path: '.env.local' })

// Environment variables
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || ''
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || ''

// Collection IDs
export const LOCATION_COLLECTIONS = {
  PROVINCES: 'provinces',
  DISTRICTS: 'districts',
  DS_DIVISIONS: 'ds_divisions',
  GN_DIVISIONS: 'gn_divisions',
  CITIES: 'cities',
  AREAS: 'areas',
  LAND_OFFICES: 'land_offices'
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY)

const databases = new Databases(client)

/**
 * Create Provinces Collection
 */
async function createProvincesCollection(databaseId) {
  console.log('🏛️ Creating Provinces Collection...')
  
  try {
    // Check if collection already exists
    try {
      await databases.getCollection(databaseId, LOCATION_COLLECTIONS.PROVINCES)
      console.log('✅ Provinces Collection already exists, skipping...')
      return true
    } catch (error) {
      // Collection doesn't exist, continue with creation
    }

    // Create collection
    await databases.createCollection(
      databaseId,
      LOCATION_COLLECTIONS.PROVINCES,
      'Provinces',
      ['read("any")', 'create("users")', 'update("users")', 'delete("users")']
    )

    // Create attributes
    const attributes = [
      { key: 'name_en', type: 'string', size: 100, required: true },
      { key: 'name_si', type: 'string', size: 100, required: true },
      { key: 'name_ta', type: 'string', size: 100, required: true },
      { key: 'code', type: 'string', size: 10, required: true },
      { key: 'capital_city', type: 'string', size: 36, required: false },
      { key: 'area_km2', type: 'double', required: true },
      { key: 'population', type: 'integer', required: true },
      { key: 'districts_count', type: 'integer', required: true },
      { key: 'coordinates_lat', type: 'double', required: true },
      { key: 'coordinates_lng', type: 'double', required: true },
      { key: 'gdp_contribution', type: 'double', required: false },
      { key: 'status', type: 'enum', elements: ['active', 'inactive'], required: true, default: 'active' }
    ]

    for (const attr of attributes) {
      if (attr.type === 'enum') {
        await databases.createEnumAttribute(
          databaseId,
          LOCATION_COLLECTIONS.PROVINCES,
          attr.key,
          attr.elements,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'double') {
        await databases.createFloatAttribute(
          databaseId,
          LOCATION_COLLECTIONS.PROVINCES,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          databaseId,
          LOCATION_COLLECTIONS.PROVINCES,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else {
        await databases.createStringAttribute(
          databaseId,
          LOCATION_COLLECTIONS.PROVINCES,
          attr.key,
          attr.size,
          attr.required,
          attr.required ? undefined : attr.default
        )
      }
    }

    // Create indexes
    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.PROVINCES,
      'province_code_idx',
      'key',
      ['code'],
      ['ASC']
    )

    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.PROVINCES,
      'province_name_en_idx',
      'key',
      ['name_en'],
      ['ASC']
    )

    console.log('✅ Provinces Collection created successfully')
    return true
  } catch (error) {
    console.error('❌ Error creating Provinces Collection:', error)
    return false
  }
}

/**
 * Create Districts Collection
 */
async function createDistrictsCollection(databaseId) {
  console.log('🏘️ Creating Districts Collection...')
  
  try {
    // Check if collection already exists
    try {
      await databases.getCollection(databaseId, LOCATION_COLLECTIONS.DISTRICTS)
      console.log('✅ Districts Collection already exists, skipping...')
      return true
    } catch (error) {
      // Collection doesn't exist, continue with creation
    }

    await databases.createCollection(
      databaseId,
      LOCATION_COLLECTIONS.DISTRICTS,
      'Districts',
      ['read("any")', 'create("users")', 'update("users")', 'delete("users")']
    )

    const attributes = [
      { key: 'province_id', type: 'string', size: 36, required: true },
      { key: 'name_en', type: 'string', size: 100, required: true },
      { key: 'name_si', type: 'string', size: 100, required: true },
      { key: 'name_ta', type: 'string', size: 100, required: true },
      { key: 'code', type: 'string', size: 10, required: true },
      { key: 'capital_city', type: 'string', size: 36, required: false },
      { key: 'area_km2', type: 'double', required: true },
      { key: 'population', type: 'integer', required: true },
      { key: 'population_density', type: 'double', required: true },
      { key: 'postal_codes', type: 'string', size: 10, required: false, array: true },
      { key: 'telephone_codes', type: 'string', size: 10, required: false, array: true },
      { key: 'ds_divisions_count', type: 'integer', required: true },
      { key: 'gn_divisions_count', type: 'integer', required: true },
      { key: 'coordinates_lat', type: 'double', required: true },
      { key: 'coordinates_lng', type: 'double', required: true },
      { key: 'elevation_min', type: 'double', required: false },
      { key: 'elevation_max', type: 'double', required: false },
      { key: 'climate_zone', type: 'enum', elements: ['wet_zone', 'intermediate_zone', 'dry_zone'], required: true },
      { key: 'rainfall_mm', type: 'integer', required: false },
      { key: 'temperature_min', type: 'double', required: false },
      { key: 'temperature_max', type: 'double', required: false },
      { key: 'status', type: 'enum', elements: ['active', 'inactive'], required: true, default: 'active' }
    ]

    for (const attr of attributes) {
      if (attr.type === 'enum') {
        await databases.createEnumAttribute(
          databaseId,
          LOCATION_COLLECTIONS.DISTRICTS,
          attr.key,
          attr.elements,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'double') {
        await databases.createFloatAttribute(
          databaseId,
          LOCATION_COLLECTIONS.DISTRICTS,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          databaseId,
          LOCATION_COLLECTIONS.DISTRICTS,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.array) {
        await databases.createStringAttribute(
          databaseId,
          LOCATION_COLLECTIONS.DISTRICTS,
          attr.key,
          attr.size,
          attr.required,
          attr.required ? undefined : attr.default,
          attr.array
        )
      } else {
        await databases.createStringAttribute(
          databaseId,
          LOCATION_COLLECTIONS.DISTRICTS,
          attr.key,
          attr.size,
          attr.required,
          attr.required ? undefined : attr.default
        )
      }
    }

    // Create indexes
    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.DISTRICTS,
      'district_province_idx',
      'key',
      ['province_id'],
      ['ASC']
    )

    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.DISTRICTS,
      'district_code_idx',
      'key',
      ['code'],
      ['ASC']
    )

    console.log('✅ Districts Collection created successfully')
    return true
  } catch (error) {
    console.error('❌ Error creating Districts Collection:', error)
    return false
  }
}

/**
 * Create DS Divisions Collection
 */
async function createDSDivisionsCollection(databaseId) {
  console.log('🏢 Creating DS Divisions Collection...')
  
  try {
    // Check if collection already exists
    try {
      await databases.getCollection(databaseId, LOCATION_COLLECTIONS.DS_DIVISIONS)
      console.log('✅ DS Divisions Collection already exists, skipping...')
      return true
    } catch (error) {
      // Collection doesn't exist, continue with creation
    }

    await databases.createCollection(
      databaseId,
      LOCATION_COLLECTIONS.DS_DIVISIONS,
      'Divisional Secretariat Divisions',
      ['read("any")', 'create("users")', 'update("users")', 'delete("users")']
    )

    const attributes = [
      { key: 'district_id', type: 'string', size: 36, required: true },
      { key: 'province_id', type: 'string', size: 36, required: true },
      { key: 'name_en', type: 'string', size: 200, required: true },
      { key: 'name_si', type: 'string', size: 200, required: true },
      { key: 'name_ta', type: 'string', size: 200, required: true },
      { key: 'code', type: 'string', size: 20, required: true },
      { key: 'area_km2', type: 'double', required: true },
      { key: 'population', type: 'integer', required: true },
      { key: 'gn_divisions_count', type: 'integer', required: true },
      { key: 'coordinates_lat', type: 'double', required: true },
      { key: 'coordinates_lng', type: 'double', required: true },
      { key: 'divisional_secretary_name', type: 'string', size: 100, required: false },
      { key: 'divisional_secretary_contact', type: 'string', size: 50, required: false },
      { key: 'divisional_secretary_address', type: 'string', size: 500, required: false },
      { key: 'status', type: 'enum', elements: ['active', 'inactive'], required: true, default: 'active' }
    ]

    for (const attr of attributes) {
      if (attr.type === 'enum') {
        await databases.createEnumAttribute(
          databaseId,
          LOCATION_COLLECTIONS.DS_DIVISIONS,
          attr.key,
          attr.elements,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'double') {
        await databases.createFloatAttribute(
          databaseId,
          LOCATION_COLLECTIONS.DS_DIVISIONS,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          databaseId,
          LOCATION_COLLECTIONS.DS_DIVISIONS,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else {
        await databases.createStringAttribute(
          databaseId,
          LOCATION_COLLECTIONS.DS_DIVISIONS,
          attr.key,
          attr.size,
          attr.required,
          attr.required ? undefined : attr.default
        )
      }
    }

    // Create indexes
    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.DS_DIVISIONS,
      'ds_district_idx',
      'key',
      ['district_id'],
      ['ASC']
    )

    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.DS_DIVISIONS,
      'ds_code_idx',
      'key',
      ['code'],
      ['ASC']
    )

    console.log('✅ DS Divisions Collection created successfully')
    return true
  } catch (error) {
    console.error('❌ Error creating DS Divisions Collection:', error)
    return false
  }
}

/**
 * Create Grama Niladhari Divisions Collection (CRITICAL FOR REAL ESTATE)
 */
async function createGNDivisionsCollection(databaseId) {
  console.log('🏘️ Creating Grama Niladhari Divisions Collection...')
  
  try {
    // Check if collection already exists
    try {
      await databases.getCollection(databaseId, LOCATION_COLLECTIONS.GN_DIVISIONS)
      console.log('✅ GN Divisions Collection already exists, skipping...')
      return true
    } catch (error) {
      // Collection doesn't exist, continue with creation
    }

    await databases.createCollection(
      databaseId,
      LOCATION_COLLECTIONS.GN_DIVISIONS,
      'Grama Niladhari Divisions',
      ['read("any")', 'create("users")', 'update("users")', 'delete("users")']
    )

    // Core attributes
    const coreAttributes = [
      { key: 'ds_division_id', type: 'string', size: 36, required: true },
      { key: 'district_id', type: 'string', size: 36, required: true },
      { key: 'province_id', type: 'string', size: 36, required: true },
      { key: 'gn_code', type: 'string', size: 10, required: true },
      { key: 'gn_number', type: 'string', size: 10, required: true },
      { key: 'name_en', type: 'string', size: 200, required: true },
      { key: 'name_si', type: 'string', size: 200, required: true },
      { key: 'name_ta', type: 'string', size: 200, required: true },
      { key: 'area_km2', type: 'double', required: true },
      { key: 'population', type: 'integer', required: true },
      { key: 'households', type: 'integer', required: true },
      { key: 'coordinates_lat', type: 'double', required: true },
      { key: 'coordinates_lng', type: 'double', required: true },
      { key: 'elevation', type: 'double', required: false }
    ]

    // Land use attributes
    const landUseAttributes = [
      { key: 'land_use_residential', type: 'double', required: true },
      { key: 'land_use_commercial', type: 'double', required: true },
      { key: 'land_use_agricultural', type: 'double', required: true },
      { key: 'land_use_forest', type: 'double', required: true },
      { key: 'land_use_water', type: 'double', required: true },
      { key: 'land_use_industrial', type: 'double', required: true }
    ]

    // Infrastructure attributes
    const infrastructureAttributes = [
      { key: 'infrastructure_roads_km', type: 'double', required: true },
      { key: 'infrastructure_electricity', type: 'double', required: true },
      { key: 'infrastructure_water', type: 'double', required: true },
      { key: 'infrastructure_telephone', type: 'double', required: true },
      { key: 'infrastructure_internet', type: 'double', required: true }
    ]

    // Demographics attributes
    const demographicsAttributes = [
      { key: 'demographics_sinhalese', type: 'double', required: true },
      { key: 'demographics_tamil', type: 'double', required: true },
      { key: 'demographics_moor', type: 'double', required: true },
      { key: 'demographics_burgher', type: 'double', required: true },
      { key: 'demographics_other_ethnic', type: 'double', required: true },
      { key: 'demographics_buddhist', type: 'double', required: true },
      { key: 'demographics_hindu', type: 'double', required: true },
      { key: 'demographics_islam', type: 'double', required: true },
      { key: 'demographics_christian', type: 'double', required: true },
      { key: 'demographics_other_religion', type: 'double', required: true },
      { key: 'demographics_under_18', type: 'double', required: true },
      { key: 'demographics_18_to_35', type: 'double', required: true },
      { key: 'demographics_35_to_60', type: 'double', required: true },
      { key: 'demographics_over_60', type: 'double', required: true }
    ]

    // Land registry attributes (CRITICAL FOR REAL ESTATE)
    const landRegistryAttributes = [
      { key: 'land_parcel_count', type: 'integer', required: true },
      { key: 'deed_freehold', type: 'integer', required: true },
      { key: 'deed_leasehold', type: 'integer', required: true },
      { key: 'deed_permit', type: 'integer', required: true },
      { key: 'deed_other', type: 'integer', required: true },
      { key: 'land_office_id', type: 'string', size: 36, required: false },
      { key: 'registration_year', type: 'integer', required: false }
    ]

    // Officer details
    const officerAttributes = [
      { key: 'gn_officer_name', type: 'string', size: 100, required: false },
      { key: 'gn_officer_contact', type: 'string', size: 50, required: false },
      { key: 'gn_officer_address', type: 'string', size: 500, required: false },
      { key: 'gn_officer_appointment_date', type: 'datetime', required: false }
    ]

    // Risk and development attributes
    const riskAttributes = [
      { key: 'status', type: 'enum', elements: ['active', 'inactive', 'under_review'], required: true, default: 'active' },
      { key: 'is_urban', type: 'boolean', required: true },
      { key: 'development_zone', type: 'enum', elements: ['high', 'medium', 'low', 'restricted'], required: true },
      { key: 'flood_zone', type: 'enum', elements: ['safe', 'moderate', 'high_risk'], required: true },
      { key: 'landslide_zone', type: 'enum', elements: ['safe', 'moderate', 'high_risk'], required: true },
      { key: 'coastal_zone', type: 'boolean', required: true },
      { key: 'protected_area', type: 'boolean', required: true }
    ]

    // Create all attributes
    const allAttributes = [
      ...coreAttributes,
      ...landUseAttributes,
      ...infrastructureAttributes,
      ...demographicsAttributes,
      ...landRegistryAttributes,
      ...officerAttributes,
      ...riskAttributes
    ]

    for (const attr of allAttributes) {
      if (attr.type === 'enum') {
        await databases.createEnumAttribute(
          databaseId,
          LOCATION_COLLECTIONS.GN_DIVISIONS,
          attr.key,
          attr.elements,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'double') {
        await databases.createFloatAttribute(
          databaseId,
          LOCATION_COLLECTIONS.GN_DIVISIONS,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          databaseId,
          LOCATION_COLLECTIONS.GN_DIVISIONS,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          databaseId,
          LOCATION_COLLECTIONS.GN_DIVISIONS,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(
          databaseId,
          LOCATION_COLLECTIONS.GN_DIVISIONS,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else {
        await databases.createStringAttribute(
          databaseId,
          LOCATION_COLLECTIONS.GN_DIVISIONS,
          attr.key,
          attr.size,
          attr.required,
          attr.required ? undefined : attr.default
        )
      }
    }

    // Create critical indexes for real estate queries
    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.GN_DIVISIONS,
      'gn_ds_division_idx',
      'key',
      ['ds_division_id'],
      ['ASC']
    )

    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.GN_DIVISIONS,
      'gn_code_idx',
      'key',
      ['gn_code'],
      ['ASC']
    )

    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.GN_DIVISIONS,
      'gn_coordinates_idx',
      'key',
      ['coordinates_lat', 'coordinates_lng'],
      ['ASC', 'ASC']
    )

    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.GN_DIVISIONS,
      'gn_land_parcels_idx',
      'key',
      ['land_parcel_count'],
      ['DESC']
    )

    console.log('✅ Grama Niladhari Divisions Collection created successfully')
    return true
  } catch (error) {
    console.error('❌ Error creating GN Divisions Collection:', error)
    return false
  }
}

/**
 * Create Cities Collection
 */
async function createCitiesCollection(databaseId) {
  console.log('🏙️ Creating Cities Collection...')
  
  try {
    // Check if collection already exists
    try {
      await databases.getCollection(databaseId, LOCATION_COLLECTIONS.CITIES)
      console.log('✅ Cities Collection already exists, skipping...')
      return true
    } catch (error) {
      // Collection doesn't exist, continue with creation
    }

    await databases.createCollection(
      databaseId,
      LOCATION_COLLECTIONS.CITIES,
      'Cities',
      ['read("any")', 'create("users")', 'update("users")', 'delete("users")']
    )

    const attributes = [
      { key: 'district_id', type: 'string', size: 36, required: true },
      { key: 'province_id', type: 'string', size: 36, required: true },
      { key: 'ds_division_id', type: 'string', size: 36, required: true },
      { key: 'primary_gn_division_id', type: 'string', size: 36, required: true },
      { key: 'name_en', type: 'string', size: 100, required: true },
      { key: 'name_si', type: 'string', size: 100, required: true },
      { key: 'name_ta', type: 'string', size: 100, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'classification', type: 'string', size: 50, required: true },
      { key: 'is_district_capital', type: 'boolean', required: true },
      { key: 'is_province_capital', type: 'boolean', required: true },
      { key: 'is_national_capital', type: 'boolean', required: true },
      { key: 'population', type: 'integer', required: true },
      { key: 'population_metro', type: 'integer', required: false },
      { key: 'population_density', type: 'double', required: true },
      { key: 'area_km2', type: 'double', required: true },
      { key: 'postal_codes', type: 'string', size: 10, required: false, array: true },
      { key: 'telephone_codes', type: 'string', size: 10, required: false, array: true },
      { key: 'coordinates_lat', type: 'double', required: true },
      { key: 'coordinates_lng', type: 'double', required: true },
      { key: 'elevation', type: 'double', required: false },
      { key: 'timezone', type: 'string', size: 50, required: true },
      { key: 'status', type: 'enum', elements: ['active', 'inactive'], required: true, default: 'active' }
    ]

    for (const attr of attributes) {
      if (attr.type === 'enum') {
        await databases.createEnumAttribute(
          databaseId,
          LOCATION_COLLECTIONS.CITIES,
          attr.key,
          attr.elements,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'double') {
        await databases.createFloatAttribute(
          databaseId,
          LOCATION_COLLECTIONS.CITIES,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          databaseId,
          LOCATION_COLLECTIONS.CITIES,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.array) {
        await databases.createStringAttribute(
          databaseId,
          LOCATION_COLLECTIONS.CITIES,
          attr.key,
          attr.size,
          attr.required,
          attr.required ? undefined : attr.default,
          attr.array
        )
      } else if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(
          databaseId,
          LOCATION_COLLECTIONS.CITIES,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else {
        await databases.createStringAttribute(
          databaseId,
          LOCATION_COLLECTIONS.CITIES,
          attr.key,
          attr.size,
          attr.required,
          attr.required ? undefined : attr.default
        )
      }
    }

    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.CITIES,
      'city_district_idx',
      'key',
      ['district_id'],
      ['ASC']
    )

    console.log('✅ Cities Collection created successfully')
    return true
  } catch (error) {
    console.error('❌ Error creating Cities Collection:', error)
    return false
  }
}

/**
 * Create Areas Collection
 */
async function createAreasCollection(databaseId) {
  console.log('🏘️ Creating Areas Collection...')
  
  try {
    // Check if collection already exists
    try {
      await databases.getCollection(databaseId, LOCATION_COLLECTIONS.AREAS)
      console.log('✅ Areas Collection already exists, skipping...')
      return true
    } catch (error) {
      // Collection doesn't exist, continue with creation
    }

    await databases.createCollection(
      databaseId,
      LOCATION_COLLECTIONS.AREAS,
      'Areas/Neighborhoods',
      ['read("any")', 'create("users")', 'update("users")', 'delete("users")']
    )

    const attributes = [
      { key: 'city_id', type: 'string', size: 36, required: true },
      { key: 'district_id', type: 'string', size: 36, required: true },
      { key: 'province_id', type: 'string', size: 36, required: true },
      { key: 'primary_gn_division_id', type: 'string', size: 36, required: true },
      { key: 'name_en', type: 'string', size: 100, required: true },
      { key: 'name_si', type: 'string', size: 100, required: true },
      { key: 'name_ta', type: 'string', size: 100, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'postal_code', type: 'string', size: 10, required: false },
      { key: 'coordinates_lat', type: 'double', required: true },
      { key: 'coordinates_lng', type: 'double', required: true },
      { key: 'population', type: 'integer', required: false },
      { key: 'area_km2', type: 'double', required: false },
      { key: 'status', type: 'enum', elements: ['active', 'inactive'], required: true, default: 'active' }
    ]

    for (const attr of attributes) {
      if (attr.type === 'enum') {
        await databases.createEnumAttribute(
          databaseId,
          LOCATION_COLLECTIONS.AREAS,
          attr.key,
          attr.elements,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'double') {
        await databases.createFloatAttribute(
          databaseId,
          LOCATION_COLLECTIONS.AREAS,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          databaseId,
          LOCATION_COLLECTIONS.AREAS,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(
          databaseId,
          LOCATION_COLLECTIONS.AREAS,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else {
        await databases.createStringAttribute(
          databaseId,
          LOCATION_COLLECTIONS.AREAS,
          attr.key,
          attr.size,
          attr.required,
          attr.required ? undefined : attr.default
        )
      }
    }

    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.AREAS,
      'area_city_idx',
      'key',
      ['city_id'],
      ['ASC']
    )

    console.log('✅ Areas Collection created successfully')
    return true
  } catch (error) {
    console.error('❌ Error creating Areas Collection:', error)
    return false
  }
}

/**
 * Create Land Offices Collection
 */
async function createLandOfficesCollection(databaseId) {
  console.log('🏢 Creating Land Offices Collection...')
  
  try {
    // Check if collection already exists
    try {
      await databases.getCollection(databaseId, LOCATION_COLLECTIONS.LAND_OFFICES)
      console.log('✅ Land Offices Collection already exists, skipping...')
      return true
    } catch (error) {
      // Collection doesn't exist, continue with creation
    }

    await databases.createCollection(
      databaseId,
      LOCATION_COLLECTIONS.LAND_OFFICES,
      'Land Registry Offices',
      ['read("any")', 'create("users")', 'update("users")', 'delete("users")']
    )

    const attributes = [
      { key: 'name_en', type: 'string', size: 200, required: true },
      { key: 'name_si', type: 'string', size: 200, required: true },
      { key: 'name_ta', type: 'string', size: 200, required: true },
      { key: 'district_id', type: 'string', size: 36, required: true },
      { key: 'province_id', type: 'string', size: 36, required: true },
      { key: 'city_id', type: 'string', size: 36, required: true },
      { key: 'address', type: 'string', size: 500, required: true },
      { key: 'coordinates_lat', type: 'double', required: true },
      { key: 'coordinates_lng', type: 'double', required: true },
      { key: 'contact_phone', type: 'string', size: 20, required: false, array: true },
      { key: 'contact_email', type: 'string', size: 100, required: false },
      { key: 'contact_website', type: 'string', size: 200, required: false },
      { key: 'contact_fax', type: 'string', size: 20, required: false },
      { key: 'services', type: 'string', size: 100, required: false, array: true },
      { key: 'status', type: 'enum', elements: ['active', 'inactive', 'under_maintenance'], required: true, default: 'active' }
    ]

    for (const attr of attributes) {
      if (attr.type === 'enum') {
        await databases.createEnumAttribute(
          databaseId,
          LOCATION_COLLECTIONS.LAND_OFFICES,
          attr.key,
          attr.elements,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.type === 'double') {
        await databases.createFloatAttribute(
          databaseId,
          LOCATION_COLLECTIONS.LAND_OFFICES,
          attr.key,
          attr.required,
          attr.required ? undefined : attr.default
        )
      } else if (attr.array) {
        await databases.createStringAttribute(
          databaseId,
          LOCATION_COLLECTIONS.LAND_OFFICES,
          attr.key,
          attr.size,
          attr.required,
          attr.required ? undefined : attr.default,
          attr.array
        )
      } else {
        await databases.createStringAttribute(
          databaseId,
          LOCATION_COLLECTIONS.LAND_OFFICES,
          attr.key,
          attr.size,
          attr.required,
          attr.required ? undefined : attr.default
        )
      }
    }

    await databases.createIndex(
      databaseId,
      LOCATION_COLLECTIONS.LAND_OFFICES,
      'land_office_district_idx',
      'key',
      ['district_id'],
      ['ASC']
    )

    console.log('✅ Land Offices Collection created successfully')
    return true
  } catch (error) {
    console.error('❌ Error creating Land Offices Collection:', error)
    return false
  }
}

/**
 * List existing databases and use the first available one
 */
async function findAvailableDatabase() {
  console.log(`🔍 Checking available databases...`)
  
  try {
    // List all databases
    const response = await databases.list()
    
    if (response.databases && response.databases.length > 0) {
      const availableDb = response.databases[0]
      console.log(`✅ Found existing database: ${availableDb.name} (${availableDb.$id})`)
      return availableDb.$id
    } else {
      console.log(`❌ No databases found`)
      return null
    }
  } catch (error) {
    console.error(`❌ Error listing databases:`, error)
    return null
  }
}

/**
 * Create the main database if it doesn't exist
 */
async function createDatabaseIfNotExists() {
  console.log(`🏗️  Creating database: ${DATABASE_ID}...`)
  
  try {
    // Try to get the database
    await databases.get(DATABASE_ID)
    console.log(`✅ Database ${DATABASE_ID} already exists`)
    return DATABASE_ID
  } catch (error) {
    if (error.code === 404) {
      // Database doesn't exist, try to create it
      try {
        await databases.create(DATABASE_ID, 'Sri Lankan Real Estate Locations', true)
        console.log(`✅ Database ${DATABASE_ID} created successfully`)
        return DATABASE_ID
      } catch (createError) {
        if (createError.code === 403 && createError.type === 'additional_resource_not_allowed') {
          console.log(`⚠️  Cannot create database: ${createError.message}`)
          console.log(`🔍 Looking for existing databases...`)
          
          // Try to find an existing database
          const availableDbId = await findAvailableDatabase()
          if (availableDbId) {
            console.log(`✅ Using existing database: ${availableDbId}`)
            return availableDbId
          } else {
            console.log(`❌ No available databases found`)
            return null
          }
        } else {
          console.error(`❌ Error creating database:`, createError)
          return null
        }
      }
    } else {
      console.error(`❌ Error checking database:`, error)
      return null
    }
  }
}

/**
 * Main setup function
 */
async function setupSriLankanLocations() {
  console.log('🚀 Starting Sri Lankan Administrative Divisions Setup...')
  console.log('📊 This will create 7 collections with comprehensive location data')
  
  // First, ensure database exists
  const actualDatabaseId = await createDatabaseIfNotExists()
  if (!actualDatabaseId) {
    console.log('❌ Failed to create or access database')
    return false
  }
  
  // Update the database ID to use the actual one
  const databaseId = actualDatabaseId
  console.log(`📍 Using database: ${databaseId}`)
  
  const results = []
  
  try {
    // Create collections in order (dependencies first)
    results.push(await createProvincesCollection(databaseId))
    results.push(await createDistrictsCollection(databaseId))
    results.push(await createDSDivisionsCollection(databaseId))
    results.push(await createGNDivisionsCollection(databaseId)) // CRITICAL FOR REAL ESTATE
    results.push(await createCitiesCollection(databaseId))
    results.push(await createAreasCollection(databaseId))
    results.push(await createLandOfficesCollection(databaseId))
    
    const successCount = results.filter(Boolean).length
    const totalCount = results.length
    
    console.log(`\n📋 Setup Summary:`)
    console.log(`✅ Successfully created: ${successCount}/${totalCount} collections`)
    
    if (successCount === totalCount) {
      console.log('🎉 All collections created successfully!')
      console.log('\n📍 Collections created:')
      console.log(`   • ${LOCATION_COLLECTIONS.PROVINCES} - 9 Provinces`)
      console.log(`   • ${LOCATION_COLLECTIONS.DISTRICTS} - 25 Districts`)
      console.log(`   • ${LOCATION_COLLECTIONS.DS_DIVISIONS} - 331 DS Divisions`)
      console.log(`   • ${LOCATION_COLLECTIONS.GN_DIVISIONS} - 14,000+ GN Divisions (CRITICAL)`)
      console.log(`   • ${LOCATION_COLLECTIONS.CITIES} - Major Cities`)
      console.log(`   • ${LOCATION_COLLECTIONS.AREAS} - Neighborhoods/Areas`)
      console.log(`   • ${LOCATION_COLLECTIONS.LAND_OFFICES} - Land Registry Offices`)
      
      console.log('\n🎯 Next Steps:')
      console.log('   1. Import location data using the data import script')
      console.log('   2. Update existing property listings to use GN Division references')
      console.log('   3. Test location-based property search functionality')
      console.log('   4. Set up location-based analytics and reporting')
      
    } else {
      console.log('⚠️  Some collections failed to create. Check error messages above.')
    }
    
    return successCount === totalCount
  } catch (error) {
    console.error('❌ Setup failed:', error)
    return false
  }
}

// Run setup
setupSriLankanLocations()
  .then(success => {
    if (success) {
      console.log('\n✅ Setup completed successfully!')
      process.exit(0)
    } else {
      console.log('\n❌ Setup completed with errors.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  })