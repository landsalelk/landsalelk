/**
 * Sri Lankan Location Database Schema
 * Enhanced schema for comprehensive administrative divisions
 */

// Sri Lankan Administrative Hierarchy:
// Country → Province → District → Divisional Secretariat → Grama Niladhari → City/Town/Village

export interface SriLankanLocationSchema {
  // Enhanced Regions Collection (Provinces)
  provinces: {
    id: string
    name_en: string      // English name
    name_si: string      // Sinhala name  
    name_ta: string      // Tamil name
    code: string         // ISO code (e.g., "WP", "CP", "SP")
    capital_city: string // Capital city ID
    area_km2: number     // Area in square kilometers
    population: number   // Latest census population
    districts_count: number
    coordinates: {
      lat: number
      lng: number
    }
    boundaries: string    // GeoJSON polygon
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
  }

  // Enhanced Districts Collection
  districts: {
    id: string
    province_id: string  // Reference to provinces
    name_en: string
    name_si: string
    name_ta: string
    code: string         // District code (e.g., "CO", "KA", "GL")
    capital_city: string
    area_km2: number
    population: number
    population_density: number
    postal_codes: string[] // Array of postal codes
    telephone_codes: string[] // Telephone area codes
    ds_divisions_count: number // Divisional Secretariat divisions
    coordinates: {
      lat: number
      lng: number
    }
    boundaries: string    // GeoJSON polygon
    elevation: {
      min: number         // Minimum elevation (meters)
      max: number         // Maximum elevation (meters)
    }
    climate_zone: 'wet_zone' | 'intermediate_zone' | 'dry_zone'
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
  }

  // Divisional Secretariat Divisions
  ds_divisions: {
    id: string
    district_id: string    // Reference to districts
    province_id: string    // Reference to provinces
    name_en: string
    name_si: string
    name_ta: string
    code: string
    area_km2: number
    population: number
    gn_divisions_count: number // Grama Niladhari divisions count
    coordinates: {
      lat: number
      lng: number
    }
    boundaries: string      // GeoJSON polygon
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
  }

  // Enhanced Cities Collection
  cities: {
    id: string
    district_id: string    // Reference to districts
    province_id: string    // Reference to provinces
    ds_division_id: string // Reference to ds_divisions
    name_en: string
    name_si: string
    name_ta: string
    type: 'capital' | 'municipal_council' | 'urban_council' | 'pradeshiya_sabha' | 'town' | 'village'
    classification: 'major_city' | 'city' | 'town' | 'suburb' | 'village'
    population: number
    population_metro?: number // Metropolitan population
    area_km2: number
    postal_codes: string[]
    telephone_codes: string[]
    coordinates: {
      lat: number
      lng: number
    }
    elevation: number      // Elevation in meters
    timezone: string       // Timezone (e.g., "Asia/Colombo")
    climate: {
      type: 'tropical' | 'temperate' | 'arid'
      temperature_range: {
        min: number        // Average minimum temperature (°C)
        max: number        // Average maximum temperature (°C)
      }
      rainfall_mm: number   // Average annual rainfall
    }
    economy: {
      main_industries: string[]
      gdp_contribution: number // Percentage of national GDP
    }
    infrastructure: {
      airports: boolean
      railway_station: boolean
      major_highways: string[]
      hospitals_count: number
      schools_count: number
      universities_count: number
    }
    tourism: {
      is_tourist_destination: boolean
      attractions: string[]
      hotel_count: number
    }
    boundaries: string    // GeoJSON polygon for city limits
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
  }

  // Areas/Neighborhoods/Barangays
  areas: {
    id: string
    city_id: string        // Reference to cities
    district_id: string    // Reference to districts
    province_id: string    // Reference to provinces
    name_en: string
    name_si: string
    name_ta: string
    type: 'neighborhood' | 'suburb' | 'ward' | 'grama_niladhari' | 'estate' | 'township'
    postal_code: string
    coordinates: {
      lat: number
      lng: number
    }
    population: number
    area_km2: number
    demographics: {
      density: number      // Population density per km²
      ethnic_composition: {
        sinhalese: number  // Percentage
        tamil: number      // Percentage
        moor: number       // Percentage
        other: number      // Percentage
      }
    }
    real_estate: {
      avg_land_price_per_perch?: number  // LKR
      avg_house_price?: number           // LKR
      property_types: ('residential' | 'commercial' | 'agricultural' | 'industrial')[]
      development_stage: 'developed' | 'developing' | 'underdeveloped'
    }
    amenities: {
      schools: number
      hospitals: number
      supermarkets: number
      banks: number
      restaurants: number
      parks: number
    }
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
  }

  // Land Registration Offices
  land_offices: {
    id: string
    name_en: string
    name_si: string
    name_ta: string
    district_id: string
    city_id: string
    address: string
    coordinates: {
      lat: number
      lng: number
    }
    contact: {
      phone: string[]
      email: string
      website?: string
    }
    jurisdiction: string[] // Array of ds_division_ids
    services: string[]
    working_hours: {
      monday: { open: string; close: string }
      tuesday: { open: string; close: string }
      wednesday: { open: string; close: string }
      thursday: { open: string; close: string }
      friday: { open: string; close: string }
      saturday: { open: string; close: string }
      sunday: { open: string; close: string }
    }
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
  }
}

// Enhanced Property Listing Location Field
export interface EnhancedLocationField {
  country: 'Sri Lanka'
  country_code: 'LK'
  province: {
    id: string
    name_en: string
    name_si: string
    name_ta: string
  }
  district: {
    id: string
    name_en: string
    name_si: string
    name_ta: string
    code: string
  }
  city: {
    id: string
    name_en: string
    name_si: string
    name_ta: string
    type: string
    postal_codes: string[]
  }
  area: {
    id: string
    name_en: string
    name_si: string
    name_ta: string
    postal_code: string
  }
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  landmarks: string[]
  accessibility: {
    distance_to_main_road_km: number
    distance_to_city_center_km: number
    distance_to_railway_station_km: number
    distance_to_airport_km: number
    distance_to_hospital_km: number
    distance_to_school_km: number
  }
}