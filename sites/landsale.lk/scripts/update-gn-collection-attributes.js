/**
 * Update GN Divisions Collection with Missing Attributes
 * This script adds the missing attributes to support full GN division data
 * including coordinates, demographics, land registry, and real estate fields
 */

import { Client, Databases, ID } from 'node-appwrite'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

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

// Attributes to add
const ATTRIBUTES_TO_ADD = [
  // Basic fields
  { key: 'active', type: 'boolean', required: false, default: true },
  { key: 'coordinates', type: 'object', required: false },
  
  // Nested demographics
  { key: 'demographics', type: 'object', required: false },
  { key: 'demographics.population', type: 'integer', required: false, parent: 'demographics' },
  { key: 'demographics.households', type: 'integer', required: false, parent: 'demographics' },
  
  // Land registry
  { key: 'land_parcel_count', type: 'integer', required: false },
  { key: 'land_registry', type: 'object', required: false },
  { key: 'land_registry.deed_types', type: 'object', required: false, parent: 'land_registry' },
  { key: 'land_registry.deed_types.freehold', type: 'integer', required: false, parent: 'land_registry.deed_types' },
  { key: 'land_registry.deed_types.leasehold', type: 'integer', required: false, parent: 'land_registry.deed_types' },
  
  // Real estate specific
  { key: 'real_estate_data', type: 'object', required: false },
  { key: 'real_estate_data.avg_land_price', type: 'double', required: false, parent: 'real_estate_data' },
  { key: 'real_estate_data.avg_house_price', type: 'double', required: false, parent: 'real_estate_data' },
  { key: 'real_estate_data.property_count', type: 'integer', required: false, parent: 'real_estate_data' },
  
  // Administrative metadata
  { key: 'data_source', type: 'string', required: false },
  { key: 'data_version', type: 'string', required: false },
  { key: 'last_updated', type: 'datetime', required: false },
  
  // Geographic metadata
  { key: 'boundary_type', type: 'string', required: false },
  { key: 'elevation_avg', type: 'double', required: false },
  { key: 'terrain_type', type: 'string', required: false }
]

async function addCollectionAttributes() {
  console.log('🚀 Starting GN Divisions Collection Update')
  console.log('================================================')
  
  try {
    // Get current collection
    console.log('\n📋 Getting current collection structure...')
    const collection = await databases.getCollection(DATABASE_ID, GN_DIVISIONS_COLLECTION)
    console.log('✅ Collection found:', collection.name)
    
    // Get existing attributes
    const existingAttrs = collection.attributes || []
    const existingKeys = existingAttrs.map(attr => attr.key)
    console.log('📊 Current attributes:', existingKeys.length)
    
    // Filter out already existing attributes
    const newAttributes = ATTRIBUTES_TO_ADD.filter(attr => !existingKeys.includes(attr.key))
    console.log('➕ New attributes to add:', newAttributes.length)
    
    if (newAttributes.length === 0) {
      console.log('✅ All attributes already exist!')
      return
    }
    
    // Add attributes one by one
    console.log('\n🔧 Adding new attributes...')
    for (const attr of newAttributes) {
      try {
        console.log(`  Adding: ${attr.key} (${attr.type})`)
        
        switch (attr.type) {
          case 'string':
            await databases.createStringAttribute(
              DATABASE_ID,
              GN_DIVISIONS_COLLECTION,
              attr.key,
              255, // size
              attr.required,
              attr.default
            )
            break
            
          case 'integer':
            await databases.createIntegerAttribute(
              DATABASE_ID,
              GN_DIVISIONS_COLLECTION,
              attr.key,
              attr.required,
              attr.default
            )
            break
            
          case 'double':
            await databases.createDoubleAttribute(
              DATABASE_ID,
              GN_DIVISIONS_COLLECTION,
              attr.key,
              attr.required,
              attr.default
            )
            break
            
          case 'boolean':
            await databases.createBooleanAttribute(
              DATABASE_ID,
              GN_DIVISIONS_COLLECTION,
              attr.key,
              attr.required
            )
            break
            
          case 'datetime':
            await databases.createDatetimeAttribute(
              DATABASE_ID,
              GN_DIVISIONS_COLLECTION,
              attr.key,
              attr.required
            )
            break
            
          case 'object':
            await databases.createUrlAttribute(
              DATABASE_ID,
              GN_DIVISIONS_COLLECTION,
              attr.key,
              attr.required
            )
            break
            
          default:
            console.log(`    ⚠️  Skipping unsupported type: ${attr.type}`)
            continue
        }
        
        console.log(`    ✅ Added: ${attr.key}`)
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`    ❌ Failed to add ${attr.key}:`, error.message)
        // Continue with other attributes even if one fails
      }
    }
    
    console.log('\n🎉 Collection update completed!')
    
    // Verify final structure
    console.log('\n🔍 Verifying final collection structure...')
    const finalCollection = await databases.getCollection(DATABASE_ID, GN_DIVISIONS_COLLECTION)
    const finalAttrs = finalCollection.attributes || []
    console.log('📊 Total attributes:', finalAttrs.length)
    
    finalAttrs.forEach(attr => {
      console.log(`  - ${attr.key}: ${attr.type}${attr.required ? ' (required)' : ''}`)
    })
    
  } catch (error) {
    console.error('❌ Collection update failed:', error.message)
    throw error
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Sri Lanka GN Division Collection Update')
  console.log('====================================================')
  
  try {
    await addCollectionAttributes()
    
    console.log('\n🎉 Collection update process completed successfully!')
    console.log('\n💡 Next steps:')
    console.log('   1. Test data insertion with new attributes')
    console.log('   2. Import actual GN division data from geojson')
    console.log('   3. Verify data integrity')
    
  } catch (error) {
    console.error('❌ Update failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})