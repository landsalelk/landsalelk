// Script to fix Appwrite authentication issues
// This will check current API key scopes and create a new one if needed

const sdk = require("node-appwrite");

const APPWRITE_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'landsalelkproject';
const APPWRITE_API_KEY = 'standard_6146a90a8110a94d2d6468817a644b7d6dae2ca9162600f443e56ba1239851ecf7c43600c80decb7f2da4f2ef1958cbb65cac0abb4581eac85008343d7b01a0454940859670360dace3cd37c7719d6409e4edba73144682aa9e2e2dd05d67aa9f867b977c14a15397ad08614b61b23489a998a7ab1ae6ba9be1d81688089e16c';

// Required scopes to fix the 401 error
const REQUIRED_SCOPES = [
  'account',           // Access to account information (fixes 401 error)
  'sessions.write',    // Create user sessions
  'users.read',        // Read user information
  'users.write',       // Create/update users
  'databases.read',    // Read databases
  'databases.write',   // Create/update databases
  'tables.read',       // Read collections
  'tables.write',      // Create/update collections
  'rows.read',         // Read documents
  'rows.write',        // Create/update documents
  'files.read',        // Read files
  'files.write',       // Create/update files
  'buckets.read',      // Read storage buckets
  'buckets.write',     // Create/update storage buckets
  'functions.read',    // Read functions
  'functions.write',   // Create/update functions
  'execution.read',    // Read function executions
  'execution.write',   // Execute functions
  'messaging.read',  // Read messaging
  'messaging.write',   // Send messages
  'locale.read',       // Access locale services
  'avatars.read',      // Access avatar services
  'health.read'        // Access health status
];

async function checkCurrentApiKey() {
  console.log('🔍 Checking current API key configuration...');
  
  const client = new sdk.Client();
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  try {
    // Test account access (this should fail with 401 if account scope is missing)
    const account = new sdk.Account(client);
    const accountInfo = await account.get();
    console.log('✅ Account access working:', accountInfo.$id);
    return true;
  } catch (error) {
    console.log('❌ Account access failed:', error.message);
    if (error.code === 401) {
      console.log('💡 Missing account scope in API key');
      return false;
    }
    throw error;
  }
}

async function testBasicFunctionality() {
  console.log('🧪 Testing basic Appwrite functionality...');
  
  const client = new sdk.Client();
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  try {
    // Test database access
    const databases = new sdk.Databases(client);
    const databaseList = await databases.list();
    console.log('✅ Database access working, found', databaseList.databases.length, 'databases');

    // Test users access
    const users = new sdk.Users(client);
    const userList = await users.list();
    console.log('✅ Users access working, found', userList.users.length, 'users');

    return true;
  } catch (error) {
    console.log('❌ Basic functionality test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Appwrite authentication fix...');
  console.log('');
  
  try {
    // Test basic functionality first
    const basicTest = await testBasicFunctionality();
    
    if (!basicTest) {
      console.log('❌ Basic API key functionality is broken. Please check your API key in the Appwrite console.');
      return;
    }

    // Test account-specific access
    const accountTest = await checkCurrentApiKey();
    
    if (accountTest) {
      console.log('');
      console.log('✅ Your current API key is working correctly!');
      console.log('🎉 No changes needed.');
    } else {
      console.log('');
      console.log('⚠️  Your current API key is missing the "account" scope.');
      console.log('');
      console.log('🔧 To fix this issue, you need to:');
      console.log('1. Go to your Appwrite console at https://cloud.appwrite.io');
      console.log('2. Navigate to your project settings');
      console.log('3. Go to the "API Keys" section');
      console.log('4. Create a new API key with the following scopes:');
      console.log('   - account (this is the critical one for fixing 401 errors)');
      console.log('   - sessions.write');
      console.log('   - users.read, users.write');
      console.log('   - databases.read, databases.write');
      console.log('   - tables.read, tables.write');
      console.log('   - rows.read, rows.write');
      console.log('   - And any other scopes you need');
      console.log('');
      console.log('5. Update your .env.local file with the new API key');
      console.log('6. Restart your development server');
      console.log('');
      console.log('📋 Required scopes for full functionality:');
      REQUIRED_SCOPES.forEach(scope => console.log(`   - ${scope}`));
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Make sure your Appwrite project is accessible');
    console.log('2. Check that your current API key is valid');
    console.log('3. Verify the Appwrite endpoint URL is correct');
    console.log('4. Ensure your project ID is correct');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkCurrentApiKey, testBasicFunctionality };