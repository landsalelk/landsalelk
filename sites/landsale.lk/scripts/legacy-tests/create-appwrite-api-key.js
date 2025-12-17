// Script to create a new Appwrite API key with proper scopes
// This will fix the 401 authentication error

const https = require('https');

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

function createApiKey(name, scopes) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: name,
      scopes: scopes,
      expire: null // No expiration
    });

    const options = {
      hostname: 'sgp.cloud.appwrite.io',
      port: 443,
      path: '/v1/keys',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${response.message || responseData}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Creating new Appwrite API key with proper scopes...');
  console.log('Required scopes:', REQUIRED_SCOPES.join(', '));
  
  try {
    const result = await createApiKey('Landsale.lk Full Access Key', REQUIRED_SCOPES);
    console.log('✅ API key created successfully!');
    console.log('Key ID:', result.$id);
    console.log('Key Name:', result.name);
    console.log('Scopes:', result.scopes.join(', '));
    console.log('');
    console.log('🔑 NEW API KEY (SAVE THIS SECURELY):');
    console.log(result.secret);
    console.log('');
    console.log('⚠️  IMPORTANT: Update your .env.local file with this new API key:');
    console.log('APPWRITE_API_KEY=' + result.secret);
    console.log('');
    console.log('📝 This will fix the 401 authentication error you were experiencing.');
  } catch (error) {
    console.error('❌ Failed to create API key:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Make sure your current API key has admin permissions');
    console.log('2. Check that the project ID is correct');
    console.log('3. Verify the Appwrite endpoint URL');
  }
}

if (require.main === module) {
  main();
}

module.exports = { createApiKey, REQUIRED_SCOPES };