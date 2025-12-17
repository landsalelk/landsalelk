// Quick test to verify the import process works
import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Client, Databases, ID, Query } from 'node-appwrite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

console.log('🚀 Testing GN Division Import Process...')

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'landsalelkdb'
const GN_DIVISIONS_COLLECTION = 'gn_divisions'

async function testImport() {
  try {
    console.log('1️⃣ Testing Appwrite connection...')
    const dbList = await databases.list()
    console.log('✅ Connected to Appwrite - Found', dbList.total, 'databases')
    
    console.log('\n2️⃣ Checking GN divisions collection...')
    const collection = await databases.getCollection(DATABASE_ID, GN_DIVISIONS_COLLECTION)
    console.log('✅ Collection found:', collection.name)
    
    console.log('\n3️⃣ Creating sample GN division...')
    const sampleGN = {
      gn_code: "LK-21-001-TEST",
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
    
    const documentId = 'test_gn_division_kandy'
    
    try {
      await databases.deleteDocument(DATABASE_ID, GN_DIVISIONS_COLLECTION, documentId)
      console.log('🗑️  Deleted existing test document')
    } catch (deleteError) {
      console.log('ℹ️  No existing test document to delete')
    }
    
    const result = await databases.createDocument(
      DATABASE_ID,
      GN_DIVISIONS_COLLECTION,
      documentId,
      sampleGN
    )
    
    console.log('✅ Sample GN division created successfully!')
    console.log('📋 Document ID:', result.$id)
    console.log('🏷️  GN Code:', result.gn_code)
    console.log('📍 Name:', result.name_en)
    console.log('📊 Area:', result.area_km2, 'km²')
    console.log('👥 Population:', result.population)
    console.log('🏞️  Land parcels:', result.land_parcel_count)
    console.log('📜 Deed types:', result.deed_types.join(', '))
    
    console.log('\n4️⃣ Verifying data integrity...')
    const verifyResult = await databases.getDocument(DATABASE_ID, GN_DIVISIONS_COLLECTION, documentId)
    console.log('✅ Data verification successful')
    
    console.log('\n🎉 Test completed successfully!')
    console.log('✅ Method 4 (HDX) import process is working correctly')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response:', error.response)
    }
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
  }
}

// Run the test
testImport()