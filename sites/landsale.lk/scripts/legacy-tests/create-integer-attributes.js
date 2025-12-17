const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('landsalelkproject')
  .setKey('standard_6146a90a8110a94d2d6468817a644b7d6dae2ca9162600f443e56ba1239851ecf7c43600c80decb7f2da4f2ef1958cbb65cac0abb4581eac85008343d7b01a0454940859670360dace3cd37c7719d6409e4edba73144682aa9e2e2dd05d67aa9f867b977c14a15397ad08614b61b23489a998a7ab1ae6ba9be1d81688089e16c');

const databases = new Databases(client);

async function createIntegerAttributes() {
  const databaseId = 'landsalelkdb';
  const collectionId = 'listings';
  
  console.log('🔧 Creating integer attributes...\n');
  
  try {
    // Create views_count
    console.log('Creating views_count...');
    await databases.createIntegerAttribute(
      databaseId, 
      collectionId, 
      'views_count', 
      false, // required
      0,     // default value
      false  // array
    );
    console.log('  ✅ Created views_count (integer)');
    
    // Create bid_count
    console.log('Creating bid_count...');
    await databases.createIntegerAttribute(
      databaseId, 
      collectionId, 
      'bid_count', 
      false, // required
      0,     // default value
      false  // array
    );
    console.log('  ✅ Created bid_count (integer)');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('  ⚠️  Attribute already exists');
    } else {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Integer attributes creation complete!');
}

createIntegerAttributes().catch(console.error);