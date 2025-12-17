/**
 * Import GN Division Data from GeoJSON - Corrected Version
 * This script processes the administrative boundary data and imports it into Appwrite
 * Uses only successfully added attributes
 */

import { Client, Databases, ID } from 'node-appwrite'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// Appwrite configuration
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const API_KEY = process.env.APPWRITE_API_KEY
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const GN_DIVISIONS_COLLECTION = 'gn_divisions'

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject(PROJECT_ID)
  .setKey(API_KEY)

const databases = new Databases(client)

// GeoJSON file path
const GEOJSON_PATH = path.join(__dirname, '..', 'docs', 'lka_admin_boundaries.geojson', 'lka_admin4.geojson')

/**
 * Process GeoJSON feature and convert to Appwrite document format
 * Uses only successfully added attributes
 */
function processGeoJSONFeature(feature) {
  const props = feature.properties
  const geometry = feature.geometry
  
  // Extract GN code and number from pcode
  const gnCode = props.adm4_pcode // e.g., "LK1103005"
  const gnNumber = gnCode.substring(6) // Extract last 3 digits: "005"
  
  // Extract parent administrative codes
  const provinceCode = gnCode.substring(0, 3) // "LK1"
  const districtCode = gnCode.substring(0, 4) // "LK11"
  const dsDivisionCode = gnCode.substring(0, 6) // "LK1103"
  
  // Get center coordinates
  const centerLat = props.center_lat
  const centerLon = props.center_lon
  
  // Calculate area (convert from sqkm to the unit we want)
  const areaKm2 = props.area_sqkm
  
  // Generate sample real estate data (this would come from actual data sources)
  const sampleRealEstateData = {
    property_count: Math.floor(areaKm2 * 50 + Math.random() * 200)
  }
  
  // Generate sample demographics (this would come from census data)
  const sampleDemographics = {
    population: Math.floor(areaKm2 * 500 + Math.random() * 2000),
    households: Math.floor(areaKm2 * 100 + Math.random() * 400)
  }
  
  // Generate sample land registry data
  const sampleLandRegistry = {
    deed_types: {
      freehold: Math.floor(Math.random() * 100) + 50,
      leasehold: Math.floor(Math.random() * 30) + 10
    }
  }
  
  // Create Appwrite document with only successfully added attributes
  const document = {
    // Basic identification (required fields)
    gn_code: gnCode,
    gn_number: gnNumber,
    name_en: props.adm4_name,
    name_si: props.adm4_name1,
    name_ta: props.adm4_name2 || props.adm4_name, // Fallback to English if Tamil not available
    
    // Administrative hierarchy (required fields)
    province_id: provinceCode,
    district_id: districtCode,
    ds_division_id: dsDivisionCode,
    
    // Geographic data (required field)
    area_km2: areaKm2,
    
    // Optional fields that were successfully added
    active: true,
    coordinates: {
      lat: centerLat,
      lng: centerLon
    },
    demographics: sampleDemographics,
    land_parcel_count: Math.floor(areaKm2 * 20 + Math.random() * 100),
    land_registry: sampleLandRegistry,
    real_estate_data: sampleRealEstateData,
    
    // Metadata
    data_source: 'HDX Administrative Boundaries',
    data_version: props.version,
    last_updated: new Date().toISOString(),
    boundary_type: 'GN Division',
    terrain_type: areaKm2 > 1 ? 'Urban' : 'Dense Urban'
  }
  
  return document
}

/**
 * Import GN division data from GeoJSON
 */
async function importGNDivisionData() {
  console.log('🚀 Starting GN Division Data Import from GeoJSON (Corrected)')
  console.log('==========================================================')
  
  try {
    // Read GeoJSON file
    console.log('\n📖 Reading GeoJSON file...')
    const geojsonContent = await readFile(GEOJSON_PATH, 'utf8')
    const geojson = JSON.parse(geojsonContent)
    
    console.log('✅ GeoJSON loaded successfully')
    console.log('📊 Total features:', geojson.features.length)
    
    // Process features
    const features = geojson.features
    let successCount = 0
    let errorCount = 0
    
    console.log('\n🔄 Processing features...')
    
    // Process only first 10 for testing
    const testLimit = 10
    const testFeatures = features.slice(0, testLimit)
    
    for (let i = 0; i < testFeatures.length; i++) {
      const feature = testFeatures[i]
      
      try {
        // Process feature
        const documentData = processGeoJSONFeature(feature)
        
        // Generate document ID from GN code
        const documentId = documentData.gn_code.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
        
        console.log(`\n📍 Processing ${i + 1}/${testFeatures.length}: ${documentData.name_en} (${documentData.gn_code})`)
        
        // Check if document already exists
        try {
          await databases.getDocument(DATABASE_ID, GN_DIVISIONS_COLLECTION, documentId)
          console.log(`   🔄 Updating existing document...`)
          
          // Update existing document
          await databases.updateDocument(
            DATABASE_ID,
            GN_DIVISIONS_COLLECTION,
            documentId,
            documentData
          )
          console.log(`   ✅ Updated: ${documentData.name_en}`)
          
        } catch (getError) {
          // Document doesn't exist, create new
          console.log(`   ➕ Creating new document...`)
          
          await databases.createDocument(
            DATABASE_ID,
            GN_DIVISIONS_COLLECTION,
            documentId,
            documentData
          )
          console.log(`   ✅ Created: ${documentData.name_en}`)
        }
        
        successCount++
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        console.error(`   ❌ Error processing ${feature.properties.adm4_name}:`, error.message)
        errorCount++
      }
    }
    
    console.log('\n🎉 Test import completed!')
    console.log('📊 Summary:')
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📈 Total processed: ${testFeatures.length}`)
    console.log(`   📊 Total in file: ${features.length}`)
    
    return { successCount, errorCount, total: testFeatures.length }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message)
    throw error
  }
}

/**
 * Verify imported data
 */
async function verifyImportedData() {
  console.log('\n🔍 Verifying imported data...')
  
  try {
    // List all documents
    const response = await databases.listDocuments(DATABASE_ID, GN_DIVISIONS_COLLECTION)
    const documents = response.documents
    
    console.log(`📊 Total documents: ${documents.length}`)
    
    if (documents.length > 0) {
      // Show sample documents
      console.log('\n📋 Sample documents:')
      documents.slice(0, 5).forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.name_en} (${doc.gn_code})`)
        console.log(`      📍 Coordinates: ${doc.coordinates?.lat}, ${doc.coordinates?.lng}`)
        console.log(`      📏 Area: ${doc.area_km2} km²`)
        console.log(`      👥 Population: ${doc.demographics?.population}`)
        console.log(`      🏠 Properties: ${doc.real_estate_data?.property_count}`)
      })
      
      // Show data quality metrics
      const withCoordinates = documents.filter(doc => doc.coordinates?.lat && doc.coordinates?.lng).length
      const withArea = documents.filter(doc => doc.area_km2 > 0).length
      const withPopulation = documents.filter(doc => doc.demographics?.population > 0).length
      
      console.log('\n📈 Data Quality Metrics:')
      console.log(`   📍 With coordinates: ${withCoordinates}/${documents.length}`)
      console.log(`   📏 With area data: ${withArea}/${documents.length}`)
      console.log(`   👥 With population: ${withPopulation}/${documents.length}`)
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    throw error
  }
}

// Main function
async function main() {
  console.log('🚀 Sri Lanka GN Division Data Import - Method 4 (HDX GeoJSON) - CORRECTED')
  console.log('======================================================================')
  
  try {
    // Import data
    const result = await importGNDivisionData()
    
    // Verify results
    await verifyImportedData()
    
    console.log('\n🎉 HDX GeoJSON import completed successfully!')
    console.log('\n💡 Next steps:')
    console.log('   1. Review imported data quality')
    console.log('   2. If test successful, run full import for all 14,043 GN divisions')
    console.log('   3. Update with real demographic data from census')
    console.log('   4. Add real estate market data')
    console.log('   5. Test platform integration')
    
  } catch (error) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

// Run the import
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})