/**
 * Check GN Divisions Collection Structure
 * This script verifies the current collection attributes
 */

import { Client, Databases } from 'node-appwrite'
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

/**
 * Check collection structure
 */
async function checkCollectionStructure() {
  console.log('🔍 Checking GN Divisions Collection Structure')
  console.log('==============================================')
  
  try {
    // Get collection
    const collection = await databases.getCollection(DATABASE_ID, GN_DIVISIONS_COLLECTION)
    
    console.log('\n📋 Collection Info:')
    console.log(`   Name: ${collection.name}`)
    console.log(`   ID: ${collection.$id}`)
    console.log(`   Total attributes: ${collection.attributes.length}`)
    
    console.log('\n📊 Current Attributes:')
    collection.attributes.forEach((attr, index) => {
      console.log(`   ${index + 1}. ${attr.key} (${attr.type})${attr.required ? ' (required)' : ''}`)
      console.log(`      Size: ${attr.size || 'N/A'}`)
      console.log(`      Default: ${attr.default || 'N/A'}`)
      console.log(`      Array: ${attr.array ? 'Yes' : 'No'}`)
    })
    
    // Check which attributes we need for import
    const requiredAttributes = [
      'gn_code', 'gn_number', 'name_en', 'name_si', 'name_ta',
      'province_id', 'district_id', 'ds_division_id', 'area_km2'
    ]
    
    const optionalAttributes = [
      'active', 'coordinates', 'demographics', 'land_parcel_count',
      'land_registry', 'real_estate_data', 'data_source', 'data_version',
      'last_updated', 'boundary_type', 'terrain_type'
    ]
    
    console.log('\n✅ Required Attributes Status:')
    requiredAttributes.forEach(attrName => {
      const exists = collection.attributes.some(attr => attr.key === attrName)
      console.log(`   ${exists ? '✅' : '❌'} ${attrName}`)
    })
    
    console.log('\n🔍 Optional Attributes Status:')
    optionalAttributes.forEach(attrName => {
      const exists = collection.attributes.some(attr => attr.key === attrName)
      console.log(`   ${exists ? '✅' : '❌'} ${attrName}`)
    })
    
    // Check indexes
    console.log('\n📈 Indexes:')
    collection.indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.key} (${index.type})`)
      console.log(`      Attributes: ${index.attributes.join(', ')}`)
    })
    
  } catch (error) {
    console.error('❌ Failed to check collection:', error.message)
    throw error
  }
}

/**
 * Test document creation with minimal data
 */
async function testDocumentCreation() {
  console.log('\n🧪 Testing Document Creation')
  console.log('============================')
  
  try {
    // Minimal test data
    const testDocument = {
      gn_code: 'LK1103005',
      gn_number: '005',
      name_en: 'Sammanthranapura',
      name_si: 'සම්මන්ත්‍රණපුර',
      name_ta: 'Sammanthranapura', // Fallback
      province_id: 'LK1',
      district_id: 'LK11',
      ds_division_id: 'LK1103',
      area_km2: 0.17851654,
      active: true,
      data_source: 'HDX Administrative Boundaries',
      data_version: '2022-08-16',
      last_updated: new Date().toISOString(),
      boundary_type: 'GN Division',
      terrain_type: 'Urban'
    }
    
    console.log('\n📄 Test Document Data:')
    Object.entries(testDocument).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`)
    })
    
    // Try to create document
    const documentId = 'test_gn_001'
    
    try {
      // First try to delete if exists
      try {
        await databases.deleteDocument(DATABASE_ID, GN_DIVISIONS_COLLECTION, documentId)
        console.log('\n🗑️  Deleted existing test document')
      } catch (deleteError) {
        // Document doesn't exist, continue
      }
      
      // Create new document
      const result = await databases.createDocument(
        DATABASE_ID,
        GN_DIVISIONS_COLLECTION,
        documentId,
        testDocument
      )
      
      console.log('\n✅ Test document created successfully!')
      console.log(`   Document ID: ${result.$id}`)
      console.log(`   Created at: ${result.$createdAt}`)
      
      // Clean up
      await databases.deleteDocument(DATABASE_ID, GN_DIVISIONS_COLLECTION, documentId)
      console.log('🧹 Test document cleaned up')
      
    } catch (createError) {
      console.error('\n❌ Test document creation failed:')
      console.error(`   Error: ${createError.message}`)
      console.error(`   Code: ${createError.code}`)
      console.error(`   Type: ${createError.type}`)
      
      if (createError.response) {
        console.error(`   Response: ${JSON.stringify(createError.response, null, 2)}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    throw error
  }
}

// Main function
async function main() {
  console.log('🔍 GN Divisions Collection Analysis')
  console.log('===================================')
  
  try {
    // Check collection structure
    await checkCollectionStructure()
    
    // Test document creation
    await testDocumentCreation()
    
    console.log('\n🎉 Collection analysis completed!')
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
    process.exit(1)
  }
}

// Run the analysis
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})