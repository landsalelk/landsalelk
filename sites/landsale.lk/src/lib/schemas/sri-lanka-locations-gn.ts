/**
 * Sri Lankan Location Database Schema with Grama Niladhari Divisions
 * Complete administrative hierarchy for real estate property location
 */

// Sri Lankan Administrative Hierarchy:
// Country → Province → District → Divisional Secretariat → Grama Niladhari Division → City/Town/Village

export interface SriLankanLocationSchemaWithGN {
  // ==================== PROVINCES (9 Provinces) ====================
  provinces: {
    id: string
    name_en: string           // English name (e.g., "Western Province")
    name_si: string           // Sinhala name (e.g., "බස්නාහිර පළාත")
    name_ta: string           // Tamil name (e.g., "மேல் மாகாணம்")
    code: string              // ISO code (e.g., "WP", "CP", "SP", "NP", "EP", "UP", "NW", "NC", "SB")
    capital_city: string      // Reference to cities.id
    area_km2: number          // Total area in square kilometers
    population: number        // Latest census population (2021)
    districts_count: number    // Number of districts in province
    coordinates: {
      lat: number             // Geographic center latitude
      lng: number             // Geographic center longitude
    }
    boundaries: string        // GeoJSON polygon boundaries
    gdp_contribution: number  // Percentage of national GDP
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
  }

  // ==================== DISTRICTS (25 Districts) ====================
  districts: {
    id: string
    province_id: string      // Reference to provinces.id
    name_en: string           // English name (e.g., "Colombo District")
    name_si: string           // Sinhala name (e.g., "කොළඹ දිස්ත්‍රික්කය")
    name_ta: string           // Tamil name (e.g., "கொழும்பு மாவட்டம்")
    code: string              // District code (e.g., "CO", "KA", "GL", "MA", "KE")
    capital_city: string      // Reference to cities.id
    area_km2: number          // Total area
    population: number        // Population
    population_density: number // People per km²
    postal_codes: string[]    // Array of postal codes
    telephone_codes: string[] // Telephone area codes
    ds_divisions_count: number // Number of Divisional Secretariat divisions
    gn_divisions_count: number // Number of Grama Niladhari divisions
    coordinates: {
      lat: number
      lng: number
    }
    boundaries: string        // GeoJSON polygon
    elevation: {
      min: number             // Minimum elevation (meters above sea level)
      max: number             // Maximum elevation
    }
    climate_zone: 'wet_zone' | 'intermediate_zone' | 'dry_zone'
    rainfall_mm: number      // Average annual rainfall
    temperature_range: {
      min: number            // Average minimum temperature (°C)
      max: number            // Average maximum temperature (°C)
    }
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
  }

  // ==================== DIVISIONAL SECRETARIAT DIVISIONS (331 DS Divisions) ====================
  ds_divisions: {
    id: string
    district_id: string      // Reference to districts.id
    province_id: string      // Reference to provinces.id
    name_en: string           // English name (e.g., "Colombo Divisional Secretariat")
    name_si: string           // Sinhala name (e.g., "කොළඹ ප්‍රාදේශීය ලේකම් කොට්ඨාසය")
    name_ta: string           // Tamil name (e.g., "கொழும்பு பிரதேச செயலகம்")
    code: string              // DS Division code
    area_km2: number
    population: number
    gn_divisions_count: number // Number of GN divisions under this DS
    coordinates: {
      lat: number
      lng: number
    }
    boundaries: string        // GeoJSON polygon
    divisional_secretary: {
      name: string
      contact: string
      office_address: string
    }
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
  }

  // ==================== GRAMA NILADHARI DIVISIONS (14,000+ GN Divisions) ====================
  gn_divisions: {
    id: string
    ds_division_id: string   // Reference to ds_divisions.id
    district_id: string      // Reference to districts.id
    province_id: string      // Reference to provinces.id
    gn_code: string          // Unique GN Code (e.g., "135A", "246B")
    gn_number: string        // GN Number (e.g., "135", "246")
    name_en: string           // English name (e.g., "Weliwita GN Division")
    name_si: string           // Sinhala name (e.g., "වැලිවිට ග්‍රාම නිලධාරී වසම")
    name_ta: string           // Tamil name (e.g., "வெளிவிட்ட கிராம நிலாதாரி பிரிவு")
    area_km2: number
    population: number
    households: number       // Number of households
    coordinates: {
      lat: number             // Center point latitude
      lng: number             // Center point longitude
    }
    boundaries: string        // GeoJSON polygon (precise boundaries)
    elevation: number         // Average elevation (meters)
    land_use: {
      residential_percentage: number
      commercial_percentage: number
      agricultural_percentage: number
      forest_percentage: number
      water_percentage: number
      industrial_percentage: number
    }
    infrastructure: {
      roads_km: number        // Total road length in km
      electricity_coverage: number // Percentage
      water_supply_coverage: number // Percentage
      telephone_coverage: number // Percentage
      internet_coverage: number // Percentage
    }
    demographics: {
      ethnic_composition: {
        sinhalese: number     // Percentage
        tamil: number        // Percentage
        moor: number         // Percentage
        burgher: number      // Percentage
        other: number        // Percentage
      }
      religions: {
        buddhist: number     // Percentage
        hindu: number        // Percentage
        islam: number        // Percentage
        christian: number   // Percentage
        other: number        // Percentage
      }
      age_groups: {
        under_18: number     // Percentage
        _18_to_35: number    // Percentage
        _35_to_60: number    // Percentage
        over_60: number      // Percentage
      }
    }
    // CRITICAL FOR REAL ESTATE:
    land_registry: {
      land_parcel_count: number // Total registered land parcels
      deed_types: {
        freehold: number       // Number of freehold deeds
        leasehold: number      // Number of leasehold deeds
        permit: number        // Number of permits
        other: number         // Other deed types
      }
      land_office: string      // Reference to land_offices.id
      registration_year: number // Year of first registration
    }
    // Grama Niladhari Officer Details
    gn_officer: {
      name: string
      contact_number: string
      office_address: string
      appointment_date: string
    }
    status: 'active' | 'inactive' | 'under_review'
    is_urban: boolean          // Urban vs Rural classification
    development_zone: 'high' | 'medium' | 'low' | 'restricted'
    flood_zone: 'safe' | 'moderate' | 'high_risk'
    landslide_zone: 'safe' | 'moderate' | 'high_risk'
    coastal_zone: boolean     // Is this a coastal GN division?
    protected_area: boolean    // Is this in a protected area?
    created_at: string
    updated_at: string
  }

  // ==================== CITIES & TOWNS (Major Urban Centers) ====================
  cities: {
    id: string
    district_id: string      // Reference to districts.id
    province_id: string      // Reference to provinces.id
    ds_division_id: string   // Reference to ds_divisions.id
    primary_gn_division_id: string // Main GN division reference
    name_en: string           // English name (e.g., "Colombo")
    name_si: string           // Sinhala name (e.g., "කොළඹ")
    name_ta: string           // Tamil name (e.g., "கொழும்பு")
    type: 'capital_city' | 'municipal_council' | 'urban_council' | 'pradeshiya_sabha' | 'town' | 'village'
    classification: 'major_city' | 'city' | 'town' | 'suburb' | 'village'
    is_district_capital: boolean
    is_province_capital: boolean
    is_national_capital: boolean
    population: number
    population_metro?: number // Metropolitan population
    population_density: number
    area_km2: number
    postal_codes: string[]
    telephone_codes: string[]
    coordinates: {
      lat: number
      lng: number
    }
    elevation: number        // Average elevation (meters)
    timezone: string          // "Asia/Colombo"
    climate: {
      type: 'tropical' | 'temperate' | 'arid'
      temperature_range: {
        min: number          // °C
        max: number          // °C
      }
      rainfall_mm: number
      humidity_percentage: number
    }
    economy: {
      main_industries: string[]
      gdp_contribution: number // Percentage of national GDP
      unemployment_rate: number
      average_income_lkr: number // Monthly average income
    }
    infrastructure: {
      airports: boolean
      railway_station: boolean
      major_highways: string[]
      hospitals_count: number
      schools_count: number
      universities_count: number
      shopping_malls: number
      hotels_count: number
      restaurants_count: number
    }
    real_estate_market: {
      avg_land_price_per_perch: number    // LKR
      avg_house_price: number              // LKR
      avg_apartment_price_per_sqft: number // LKR
      price_trend: 'increasing' | 'stable' | 'decreasing'
      market_activity: 'high' | 'medium' | 'low'
      popular_property_types: ('land' | 'house' | 'apartment' | 'commercial' | 'agricultural')[]
    }
    tourism: {
      is_tourist_destination: boolean
      attractions: string[]
      hotel_count: number
      annual_visitors?: number
    }
    gn_divisions: string[]    // Array of gn_divisions.id
    boundaries: string        // GeoJSON polygon
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
  }

  // ==================== AREAS/NEIGHBORHOODS (Urban Subdivisions) ====================
  areas: {
    id: string
    city_id: string          // Reference to cities.id
    district_id: string      // Reference to districts.id
    province_id: string      // Reference to provinces.id
    primary_gn_division_id: string // Main GN division
    name_en: string           // English name (e.g., "Bambalapitiya")
    name_si: string           // Sinhala name (e.g., "බම්බලපිටිය")
    name_ta: string           // Tamil name (e.g., "பம்பலபிட்டி")
    type: 'neighborhood' | 'suburb' | 'ward' | 'colony' | 'estate' | 'township' | 'sector'
    postal_code: string
    coordinates: {
      lat: number
      lng: number
    }
    population: number
    area_km2: number
    demographics: {
      density: number         // Population density per km²
      ethnic_composition: {
        sinhalese: number     // Percentage
        tamil: number        // Percentage
        moor: number         // Percentage
        burgher: number      // Percentage
        other: number        // Percentage
      }
      religions: {
        buddhist: number
        hindu: number
        islam: number
        christian: number
        other: number
      }
      average_household_income: number // Monthly LKR
    }
    real_estate_market: {
      avg_land_price_per_perch: number    // LKR
      avg_house_price: number              // LKR
      avg_apartment_price_per_sqft: number // LKR
      price_range: {
        min: number
        max: number
      }
      property_types: ('residential' | 'commercial' | 'mixed_use' | 'apartment')[]
      development_stage: 'highly_developed' | 'developed' | 'developing' | 'underdeveloped'
      market_activity: 'very_high' | 'high' | 'medium' | 'low'
      popular_amenities: string[]
    }
    amenities: {
      schools: number
      hospitals: number
      supermarkets: number
      banks: number
      restaurants: number
      parks: number
      gyms: number
      shopping_centers: number
      religious_places: number
      community_centers: number
    }
    transportation: {
      bus_routes: number
      railway_stations: number
      major_roads: string[]
      distance_to_city_center_km: number
      public_transport_rating: 1 | 2 | 3 | 4 | 5
    }
    safety_security: {
      police_stations: number
      crime_rate: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
      safety_index: number     // 0-100
      street_lighting: 'excellent' | 'good' | 'average' | 'poor'
    }
    gn_divisions: string[]    // Array of gn_divisions.id
    boundaries: string        // GeoJSON polygon
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
  }

  // ==================== LAND REGISTRY OFFICES ====================
  land_offices: {
    id: string
    name_en: string
    name_si: string
    name_ta: string
    district_id: string      // Reference to districts.id
    province_id: string      // Reference to provinces.id
    city_id: string          // Reference to cities.id
    address: string
    coordinates: {
      lat: number
      lng: number
    }
    contact: {
      phone: string[]
      email: string
      website?: string
      fax?: string
    }
    jurisdiction: {
      ds_divisions: string[]  // Array of ds_divisions.id
      gn_divisions: string[]  // Array of gn_divisions.id
    }
    services: string[]        // Available services
    working_hours: {
      monday: { open: string; close: string }
      tuesday: { open: string; close: string }
      wednesday: { open: string; close: string }
      thursday: { open: string; close: string }
      friday: { open: string; close: string }
      saturday: { open: string; close: string }
      sunday: { open: string; close: string }
    }
    special_services: {
      digital_services: boolean
      online_appointment: boolean
      mobile_services: boolean
      weekend_services: boolean
    }
    status: 'active' | 'inactive' | 'under_maintenance'
    created_at: string
    updated_at: string
  }
}

// ==================== ENHANCED PROPERTY LISTING LOCATION FIELD ====================
export interface EnhancedPropertyLocationField {
  // Complete Administrative Hierarchy
  country: 'Sri Lanka'
  country_code: 'LK'
  
  province: {
    id: string
    name_en: string
    name_si: string
    name_ta: string
    code: string
  }
  
  district: {
    id: string
    name_en: string
    name_si: string
    name_ta: string
    code: string
  }
  
  ds_division: {
    id: string
    name_en: string
    name_si: string
    name_ta: string
    code: string
  }
  
  // CRITICAL: Grama Niladhari Division (Most Precise for Property)
  gn_division: {
    id: string
    gn_code: string          // Unique GN Code (e.g., "135A")
    name_en: string
    name_si: string
    name_ta: string
    area_km2: number
    population: number
    land_parcel_count: number // Total registered land parcels
    deed_types: {
      freehold: number
      leasehold: number
      permit: number
      other: number
    }
    flood_zone: 'safe' | 'moderate' | 'high_risk'
    landslide_zone: 'safe' | 'moderate' | 'high_risk'
    development_zone: 'high' | 'medium' | 'low' | 'restricted'
    protected_area: boolean
  }
  
  // Urban Hierarchy (if applicable)
  city?: {
    id: string
    name_en: string
    name_si: string
    name_ta: string
    type: string
    classification: string
  }
  
  area?: {
    id: string
    name_en: string
    name_si: string
    name_ta: string
    postal_code: string
    type: string
  }
  
  // Physical Location Details
  address: string
  house_number?: string
  street_name?: string
  landmarks: string[]
  
  // Precise Coordinates
  coordinates: {
    lat: number
    lng: number
    accuracy: 'exact' | 'approximate' | 'interpolated'
    source: 'gps' | 'map' | 'survey' | 'estimate'
  }
  
  // Accessibility & Infrastructure
  accessibility: {
    distance_to_main_road_km: number
    road_type: 'highway' | 'main' | 'secondary' | 'local' | 'estate'
    road_condition: 'excellent' | 'good' | 'average' | 'poor' | 'very_poor'
    
    distance_to_city_center_km: number
    nearest_city: string
    
    distance_to_railway_station_km: number
    nearest_railway_station?: string
    
    distance_to_airport_km: number
    nearest_airport?: string
    
    distance_to_hospital_km: number
    nearest_hospital?: string
    hospital_type: 'teaching' | 'district' | 'base' | 'rural'
    
    distance_to_school_km: number
    nearest_school?: string
    school_type: 'national' | 'provincial' | 'private' | 'international'
    
    public_transport: {
      bus_routes: string[]
      bus_frequency: 'frequent' | 'regular' | 'limited' | 'none'
      distance_to_bus_stop_km: number
    }
  }
  
  // Utilities & Services
  utilities: {
    electricity: {
      available: boolean
      connection_type: 'national_grid' | 'solar' | 'generator' | 'none'
      reliability: 'excellent' | 'good' | 'average' | 'poor'
    }
    water: {
      available: boolean
      source: 'pipe_borne' | 'well' | 'spring' | 'river' | 'rain_water'
      quality: 'excellent' | 'good' | 'average' | 'poor'
    }
    telephone: {
      available: boolean
      coverage: 'excellent' | 'good' | 'average' | 'poor'
      providers: string[]
    }
    internet: {
      available: boolean
      broadband: boolean
      fiber: boolean
      mobile_data: boolean
      providers: string[]
    }
  }
  
  // Land Registry Information
  land_registry: {
    nearest_land_office: string
    land_office_distance_km: number
    registration_status: 'registered' | 'unregistered' | 'under_process' | 'disputed'
    deed_type: 'freehold' | 'leasehold' | 'permit' | 'grant' | 'swarnabhoomi' | 'jayabhoomi' | 'other'
    survey_plan_available: boolean
    survey_plan_number?: string
    block_number?: string
    plan_number?: string
    lot_number?: string
    extent: {
      acres?: number
      roods?: number
      perches?: number
      hectares?: number
      square_meters?: number
    }
  }
  
  // Risk Assessment
  risk_assessment: {
    flood_risk: {
      level: 'safe' | 'low' | 'moderate' | 'high'
      flood_zone: string
      last_flood_year?: number
      flood_frequency: 'rare' | 'occasional' | 'frequent' | 'seasonal'
    }
    landslide_risk: {
      level: 'safe' | 'low' | 'moderate' | 'high'
      landslide_zone: string
      slope_stability: 'stable' | 'moderate' | 'unstable'
      soil_type: 'rocky' | 'clay' | 'sandy' | 'loamy' | 'mixed'
    }
    environmental: {
      protected_area: boolean
      wildlife_corridor: boolean
      forest_reserve: boolean
      archaeological_site: boolean
      buffer_zone: boolean
    }
    legal: {
      court_cases: boolean
      ownership_disputes: boolean
      boundary_disputes: boolean
      encroachments: boolean
    }
  }
  
  // Development Potential
  development: {
    zoning: 'residential' | 'commercial' | 'mixed' | 'agricultural' | 'industrial' | 'protected'
    building_regulations: {
      max_height: number      // Maximum building height (floors)
      floor_area_ratio: number
      setback_requirements: {
        front: number         // Meters
        back: number          // Meters
        sides: number         // Meters
      }
      parking_requirements: number // Minimum parking spaces
    }
    infrastructure_development: 'high' | 'medium' | 'low'
    appreciation_potential: 'excellent' | 'good' | 'average' | 'poor'
  }
}