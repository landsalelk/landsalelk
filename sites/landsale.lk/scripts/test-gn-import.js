/**
 * Simple GN Division Data Import Test
 * Test script to verify Appwrite connection and data import
 */

import { config } from 'dotenv'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { Client, Databases, ID } from 'node-appwrite'
import { mkdir, writeFile } from 'fs/promises'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env.local') })

console.log('🚀 Starting GN Division Data Import Test...')
console.log('📋 Environment check:')
console.log('  - Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
console.log('  - Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
console.log('  - API Key:', process.env.APPWRITE_API_KEY ? '✅ Set' : '❌ Missing')

// Appwrite configuration
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)

// Database and collection IDs
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'landsalelkdb'
const GN_DIVISIONS_COLLECTION = 'gn_divisions'

/**
 * Main test function
 */
async function main() {
  try {
    console.log('\n🔍 Step 1: Testing Appwrite connection...')
    
    // Test connection by listing databases
    const dbList = await databases.list()
    console.log('✅ Appwrite connection successful')
    console.log('📊 Found databases:', dbList.total)
    
    console.log('\n🔍 Step 2: Checking GN divisions collection...')
    
    // Check if collection exists
    try {
      const collection = await databases.getCollection(DATABASE_ID, GN_DIVISIONS_COLLECTION)
      console.log('✅ GN divisions collection found:', collection.name)
      console.log('📋 Collection attributes:', collection.attributes?.length || 0)
      
      console.log('\n🔍 Step 3: Testing sample data insertion...')
      
      // Create sample GN division data
      const sampleData = {
        gn_code: "LK-21-001-001",
        gn_number: "001",
        name_en: "Test GN Division - Kandy",
        name_si: "පරීක්ෂණ ග්‍රාම නිලධාරී කොට්ඨාසය - මහනුවර",
        name_ta: "சோதனை கிராம நிலாதாரி பிரிவு - கண்டி",
        ds_division_id: "ds_kandy_test",
        district_id: "district_kandy",
        province_id: "province_central",
        area_km2: 2.5,
        population: 1500,
        centroid_lat: 7.2955,
        centroid_lng: 80.6350,
        boundary_data: "POLYGON((80.63 7.29, 80.64 7.30, 80.65 7.29, 80.64 7.28, 80.63 7.29))",
        deed_types: ["FREEHOLD", "LEASEHOLD"],
        land_parcel_count: 350,
        flood_risk: "LOW",
        earthquake_risk: "MEDIUM",
        active: true
      }
      
      // Try to insert sample data
      const documentId = sampleData.gn_code.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      
      try {
        // First try to delete if it exists
        await databases.deleteDocument(DATABASE_ID, GN_DIVISIONS_COLLECTION, documentId)
        console.log('🗑️  Deleted existing test document')
      } catch (deleteError) {
        // Document might not exist, that's okay
        console.log('ℹ️  No existing test document to delete')
      }
      
      // Insert new document
      const result = await databases.createDocument(
        DATABASE_ID,
        GN_DIVISIONS_COLLECTION,
        documentId,
        sampleData
      )
      
      console.log('✅ Sample data inserted successfully!')
      console.log('📊 Document ID:', result.$id)
      console.log('🏷️  GN Code:', result.gn_code)
      console.log('📍 Name:', result.name_en)
      
      console.log('\n🔍 Step 4: Verifying data integrity...')
      
      // Verify the inserted data
      const verifyResult = await databases.getDocument(DATABASE_ID, GN_DIVISIONS_COLLECTION, documentId)
      console.log('✅ Data verification successful')
      console.log('📊 Verified fields:', Object.keys(verifyResult).length)
      
      console.log('\n🎉 Test completed successfully!')
      console.log('📋 Summary:')
      console.log('  - Appwrite connection: ✅ Working')
      console.log('  - GN collection: ✅ Found')
      console.log('  - Data insertion: ✅ Successful')
      console.log('  - Data verification: ✅ Successful')
      
      // Save sample data for reference
      const DATA_DIR = join(__dirname, 'data')
      await mkdir(DATA_DIR, { recursive: true })
      await writeFile(
        join(DATA_DIR, 'gn_division_test_sample.json'),
        JSON.stringify(sampleData, null, 2)
      )
      
      console.log('\n💾 Sample data saved to:', join(DATA_DIR, 'gn_division_test_sample.json'))
      
    } catch (collectionError) {
      console.error('❌ GN divisions collection error:', collectionError.message)
      console.log('💡 Please run setup-sri-lanka-locations.js first to create the collections')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}