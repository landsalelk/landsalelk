/**
 * Verification script for Sri Lankan location collections
 * Checks if all collections were created successfully
 */

import { config } from 'dotenv'
import { Client, Databases, Query } from 'node-appwrite'

// Load environment variables
config({ path: '.env.local' })

// Environment variables
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || ''
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || ''
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb'

// Collection IDs to verify
const LOCATION_COLLECTIONS = {
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
 * Verify collections exist and have proper attributes
 */
async function verifyCollections() {
  console.log('🔍 Verifying Sri Lankan location collections...\n')
  
  const results = {
    success: [],
    failed: [],
    details: {}
  }

  for (const [key, collectionId] of Object.entries(LOCATION_COLLECTIONS)) {
    try {
      console.log(`Checking ${key} (${collectionId})...`)
      
      // Get collection info
      const collection = await databases.getCollection(DATABASE_ID, collectionId)
      
      // Get attributes
      const attributes = await databases.listAttributes(DATABASE_ID, collectionId)
      
      // Get indexes
      const indexes = await databases.listIndexes(DATABASE_ID, collectionId)
      
      results.success.push(key)
      results.details[key] = {
        collectionId,
        name: collection.name,
        attributesCount: attributes.total,
        indexesCount: indexes.total,
        created: collection.$createdAt,
        updated: collection.$updatedAt
      }
      
      console.log(`✅ ${key}: ${collection.name} (${attributes.total} attributes, ${indexes.total} indexes)`)
      
    } catch (error) {
      results.failed.push(key)
      console.log(`❌ ${key}: ${error.message}`)
    }
  }
  
  console.log('\n📊 Verification Summary:')
  console.log(`✅ Successfully created: ${results.success.length}/7 collections`)
  console.log(`❌ Failed: ${results.failed.length}/7 collections`)
  
  if (results.success.length > 0) {
    console.log('\n📋 Collection Details:')
    results.success.forEach(key => {
      const detail = results.details[key]
      console.log(`  • ${key}: ${detail.name}`)
      console.log(`    - Attributes: ${detail.attributesCount}`)
      console.log(`    - Indexes: ${detail.indexesCount}`)
      console.log(`    - Created: ${new Date(detail.created).toLocaleString()}`)
    })
  }
  
  if (results.failed.length > 0) {
    console.log('\n⚠️  Failed Collections:')
    results.failed.forEach(key => {
      console.log(`  • ${key}`)
    })
  }
  
  return results
}

/**
 * Sample data insertion test
 */
async function testSampleData() {
  console.log('\n🧪 Testing sample data insertion...')
  
  try {
    // Test inserting a province
    const provinceData = {
      code: 'WP',
      name_en: 'Western Province',
      name_si: 'බස්නාහිර පළාත',
      name_ta: 'மேல் மாகாணம்',
      capital_en: 'Colombo',
      capital_si: 'කොළඹ',
      capital_ta: 'கொழும்பு',
      area_sq_km: 3684,
      population_2021: 5984000,
      districts_count: 3,
      gnd_count: 0 // Will be updated
    }
    
    const province = await databases.createDocument(
      DATABASE_ID,
      LOCATION_COLLECTIONS.PROVINCES,
      'western-province',
      provinceData
    )
    
    console.log('✅ Sample province inserted successfully')
    console.log(`   ID: ${province.$id}`)
    console.log(`   Name: ${province.name_en}`)
    
    // Clean up
    await databases.deleteDocument(
      DATABASE_ID,
      LOCATION_COLLECTIONS.PROVINCES,
      'western-province'
    )
    
    console.log('✅ Sample data cleaned up')
    
  } catch (error) {
    console.log(`❌ Sample data test failed: ${error.message}`)
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting verification...')
  console.log(`📍 Endpoint: ${APPWRITE_ENDPOINT}`)
  console.log(`🆔 Project: ${APPWRITE_PROJECT_ID}`)
  console.log(`🗃️ Database: ${DATABASE_ID}`)
  
  try {
    const results = await verifyCollections()
    
    if (results.success.length === 7) {
      console.log('\n🎉 All collections verified successfully!')
      await testSampleData()
    } else {
      console.log('\n⚠️  Some collections need attention')
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Run verification
main().catch(error => {
  console.error('❌ Script failed:', error.message)
  process.exit(1)
})