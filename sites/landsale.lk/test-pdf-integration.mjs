// Integration Test: Verify PDF Generation Function Execution
// Run with: node --env-file=.env.local test-pdf-integration.mjs

import { Client, Databases, Functions, ID, ExecutionMethod } from 'node-appwrite';

// Load environment variables
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'osclass_landsale_db';
const PDF_FUNCTION_ID = process.env.APPWRITE_PDF_FUNCTION_ID || 'generate-pdf';

console.log('\n═══════════════════════════════════════════════════');
console.log('  PDF GENERATION INTEGRATION TEST');
console.log('═══════════════════════════════════════════════════\n');

// Verify environment
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   NEXT_PUBLIC_APPWRITE_ENDPOINT:', !!APPWRITE_ENDPOINT);
    console.error('   NEXT_PUBLIC_APPWRITE_PROJECT_ID:', !!APPWRITE_PROJECT_ID);
    console.error('   APPWRITE_API_KEY:', !!APPWRITE_API_KEY);
    process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`   Endpoint: ${APPWRITE_ENDPOINT}`);
console.log(`   Project: ${APPWRITE_PROJECT_ID}`);
console.log(`   Database: ${DATABASE_ID}`);
console.log(`   Function: ${PDF_FUNCTION_ID}\n`);

// Initialize client
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const functions = new Functions(client);

async function testPdfGeneration() {
    try {
        // Step 1: Check if function exists
        console.log('📡 Step 1: Checking if function exists...');
        try {
            const func = await functions.get(PDF_FUNCTION_ID);
            console.log(`   ✅ Function found: ${func.name}`);
            console.log(`   Status: ${func.status}`);
        } catch (error) {
            console.error(`   ❌ Function not found: ${PDF_FUNCTION_ID}`);
            console.error(`   Error: ${error.message}`);
            console.log('\n   📝 To create the function:');
            console.log('   1. Go to Appwrite Console → Functions');
            console.log('   2. Create a new function with ID: generate-pdf');
            console.log('   3. Upload code.tar.gz from functions/generate-pdf/');
            return;
        }

        // Step 2: Get a test property from database
        console.log('\n📡 Step 2: Fetching test property from database...');
        const properties = await databases.listDocuments(
            DATABASE_ID,
            'listings',
            []
        );

        if (properties.documents.length === 0) {
            console.error('   ❌ No properties found in database');
            return;
        }

        const testProperty = properties.documents[0];
        console.log(`   ✅ Found property: ${testProperty.title}`);
        console.log(`   Property ID: ${testProperty.$id}`);

        // Step 3: Create test purchase record
        console.log('\n📡 Step 3: Creating test purchase record...');
        const purchaseId = ID.unique();
        const purchase = await databases.createDocument(
            DATABASE_ID,
            'digital_purchases',
            purchaseId,
            {
                user_id: 'test-user-' + Date.now(),
                property_id: testProperty.$id,
                product_type: 'risk_report',
                payment_id: 'test-payment-' + Date.now(),
                status: 'processing',
                created_at: new Date().toISOString()
            }
        );
        console.log(`   ✅ Purchase created: ${purchase.$id}`);

        // Step 4: Execute function
        console.log('\n📡 Step 4: Executing PDF generation function...');
        console.log('   This may take 30-60 seconds...\n');

        const startTime = Date.now();

        const execution = await functions.createExecution(
            PDF_FUNCTION_ID,
            JSON.stringify({
                purchaseId: purchase.$id,
                propertyId: testProperty.$id,
                productType: 'risk_report',
                userId: purchase.user_id
            }),
            false, // wait for completion
            '/',
            ExecutionMethod.POST,
            { 'Content-Type': 'application/json' }
        );

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`   ✅ Execution completed in ${duration}s`);
        console.log(`   Execution ID: ${execution.$id}`);
        console.log(`   Status: ${execution.status}`);

        // Step 5: Parse response
        console.log('\n📡 Step 5: Checking execution response...');

        if (execution.status === 'completed') {
            try {
                const response = JSON.parse(execution.responseBody || '{}');

                if (response.success) {
                    console.log('   ✅ PDF Generation Successful!');
                    console.log(`   File ID: ${response.fileId}`);
                    console.log(`   File Name: ${response.fileName}`);
                    console.log(`   Data Accuracy: ${response.dataAccuracy}`);
                    console.log(`   Data Source: ${response.dataSource}`);
                } else {
                    console.error('   ❌ Function returned error:');
                    console.error(`   ${response.error}`);
                }
            } catch (parseError) {
                console.error('   ⚠️  Could not parse response body');
                console.log(`   Raw response: ${execution.responseBody}`);
            }
        } else if (execution.status === 'failed') {
            console.error('   ❌ Execution failed');
            console.error(`   Error: ${execution.responseBody}`);
        }

        // Step 6: Verify database was updated
        console.log('\n📡 Step 6: Verifying database update...');
        const updatedPurchase = await databases.getDocument(
            DATABASE_ID,
            'digital_purchases',
            purchase.$id
        );

        console.log(`   Status: ${updatedPurchase.status}`);
        if (updatedPurchase.file_id) {
            console.log(`   ✅ File ID saved: ${updatedPurchase.file_id}`);
        } else {
            console.log('   ⚠️  No file_id in purchase record');
        }

        // Summary
        console.log('\n═══════════════════════════════════════════════════');
        console.log('  TEST SUMMARY');
        console.log('═══════════════════════════════════════════════════');
        console.log(`✅ Function exists: ${PDF_FUNCTION_ID}`);
        console.log(`✅ Property retrieved from database`);
        console.log(`✅ Purchase record created`);
        console.log(`✅ Function executed: ${execution.status}`);
        console.log(`✅ Execution time: ${duration}s`);

        if (execution.status === 'completed' && updatedPurchase.file_id) {
            console.log('\n🎉 INTEGRATION TEST PASSED! 🎉');
        } else {
            console.log('\n⚠️  Integration test completed with warnings');
        }
        console.log('');

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        console.error(`Error: ${error.message}`);
        console.error(error);
    }
}

testPdfGeneration();
