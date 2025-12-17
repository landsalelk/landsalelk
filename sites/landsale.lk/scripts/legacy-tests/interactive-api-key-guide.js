// Interactive guide to create Appwrite API key with proper scopes
// This script provides step-by-step instructions

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function displayInstructions() {
  console.log('');
  console.log('🎯 APPWRITE API KEY CREATION GUIDE');
  console.log('====================================');
  console.log('');
  console.log('To fix the 401 authentication error, you need to create a new API key');
  console.log('with the "account" scope. Follow these steps:');
  console.log('');
  console.log('1. 🌐 Open your browser and go to:');
  console.log('   https://cloud.appwrite.io/console/project-landsalelkproject/settings');
  console.log('');
  console.log('2. 🔑 Navigate to API Keys section:');
  console.log('   - Click on "API Keys" in the left sidebar');
  console.log('   - Or go directly to: https://cloud.appwrite.io/console/project-landsalelkproject/settings/api-keys');
  console.log('');
  console.log('3. ➕ Create a new API key:');
  console.log('   - Click the "Create API Key" button');
  console.log('   - Name it: "Landsale.lk Full Access"');
  console.log('   - Set expiration to: "No expiration" or "30 days"');
  console.log('');
  console.log('4. ✅ Select these required scopes (check all boxes):');
  console.log('   ☑️  account (CRITICAL - fixes 401 error)');
  console.log('   ☑️  sessions.write');
  console.log('   ☑️  users.read');
  console.log('   ☑️  users.write');
  console.log('   ☑️  databases.read');
  console.log('   ☑️  databases.write');
  console.log('   ☑️  tables.read');
  console.log('   ☑️  tables.write');
  console.log('   ☑️  rows.read');
  console.log('   ☑️  rows.write');
  console.log('   ☑️  files.read');
  console.log('   ☑️  files.write');
  console.log('   ☑️  buckets.read');
  console.log('   ☑️  buckets.write');
  console.log('   ☑️  functions.read');
  console.log('   ☑️  functions.write');
  console.log('   ☑️  execution.read');
  console.log('   ☑️  execution.write');
  console.log('   ☑️  messaging.read');
  console.log('   ☑️  messaging.write');
  console.log('   ☑️  locale.read');
  console.log('   ☑️  avatars.read');
  console.log('   ☑️  health.read');
  console.log('');
  console.log('5. 🔒 Copy the new API key (it starts with "standard_")');
  console.log('   ⚠️  Save it securely - you won\'t see it again!');
  console.log('');
}

async function testNewApiKey(apiKey) {
  console.log('');
  console.log('🧪 Testing your new API key...');
  
  const sdk = require("node-appwrite");
  
  const client = new sdk.Client();
  client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('landsalelkproject')
    .setKey(apiKey);

  try {
    // Test account access
    const account = new sdk.Account(client);
    const accountInfo = await account.get();
    console.log('✅ Account access working!');
    
    // Test database access
    const databases = new sdk.Databases(client);
    const databaseList = await databases.list();
    console.log('✅ Database access working, found', databaseList.databases.length, 'databases');
    
    return true;
  } catch (error) {
    console.log('❌ API key test failed:', error.message);
    return false;
  }
}

async function updateEnvFile(newApiKey) {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '.env.local');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the API key
    const oldKeyMatch = envContent.match(/APPWRITE_API_KEY=.*$/m);
    if (oldKeyMatch) {
      envContent = envContent.replace(/APPWRITE_API_KEY=.*$/m, `APPWRITE_API_KEY=${newApiKey}`);
    } else {
      // If no existing API key, add it
      envContent += `\nAPPWRITE_API_KEY=${newApiKey}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env.local file with new API key');
    return true;
  } catch (error) {
    console.log('❌ Failed to update .env.local file:', error.message);
    console.log('💡 Please manually update your .env.local file');
    console.log('   Add this line:');
    console.log(`   APPWRITE_API_KEY=${newApiKey}`);
    return false;
  }
}

async function main() {
  console.clear();
  displayInstructions();
  
  const confirmed = await askQuestion('Have you created the new API key? (yes/no): ');
  
  if (confirmed.toLowerCase() === 'yes' || confirmed.toLowerCase() === 'y') {
    const newApiKey = await askQuestion('Please paste your new API key: ');
    
    if (newApiKey.trim()) {
      console.log('');
      console.log('Testing your new API key...');
      
      const testResult = await testNewApiKey(newApiKey.trim());
      
      if (testResult) {
        console.log('');
        console.log('🎉 SUCCESS! Your new API key is working correctly!');
        console.log('');
        
        const updateEnv = await askQuestion('Would you like me to update your .env.local file? (yes/no): ');
        
        if (updateEnv.toLowerCase() === 'yes' || updateEnv.toLowerCase() === 'y') {
          await updateEnvFile(newApiKey.trim());
        }
        
        console.log('');
        console.log('🔄 Next steps:');
        console.log('1. Restart your development server');
        console.log('2. Test the PayHere integration again');
        console.log('3. The 401 authentication error should be resolved!');
        
      } else {
        console.log('');
        console.log('❌ The API key test failed. Please double-check:');
        console.log('1. You copied the entire API key correctly');
        console.log('2. You selected all the required scopes');
        console.log('3. The API key is active and not expired');
      }
    } else {
      console.log('❌ No API key provided. Please try again.');
    }
  } else {
    console.log('');
    console.log('👍 No problem! Take your time creating the API key.');
    console.log('Run this script again when you\'re ready to test it.');
  }
  
  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { displayInstructions, testNewApiKey, updateEnvFile };