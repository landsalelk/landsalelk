const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('landsalelkproject')
  .setKey('standard_6146a90a8110a94d2d6468817a644b7d6dae2ca9162600f443e56ba1239851ecf7c43600c80decb7f2da4f2ef1958cbb65cac0abb4581eac85008343d7b01a0454940859670360dace3cd37c7719d6409e4edba73144682aa9e2e2dd05d67aa9f867b977c14a15397ad08614b61b23489a998a7ab1ae6ba9be1d81688089e16c');

const databases = new Databases(client);

async function auditCollections() {
  const databaseId = 'landsalelkdb';
  
  const expectedCollections = [
    { id: 'listings', name: 'Listings' },
    { id: 'categories', name: 'Categories' },
    { id: 'users_extended', name: 'Users Extended' },
    { id: 'countries', name: 'Countries' },
    { id: 'regions', name: 'Regions' },
    { id: 'cities', name: 'Cities' },
    { id: 'areas', name: 'Areas' },
    { id: 'favorites', name: 'Favorites' },
    { id: 'reviews', name: 'Reviews' },
    { id: 'saved_searches', name: 'Saved Searches' },
    { id: 'cms_pages', name: 'CMS Pages' },
    { id: 'settings', name: 'Settings' },
    { id: 'transactions', name: 'Transactions' },
    { id: 'user_wallets', name: 'User Wallets' },
    { id: 'listing_offers', name: 'Listing Offers' },
    { id: 'seo_meta', name: 'SEO Meta' },
    { id: 'blog_posts', name: 'Blog Posts' },
    { id: 'faqs', name: 'FAQs' }
  ];

  console.log('🔍 Auditing Appwrite collections and attributes...\n');

  for (const collection of expectedCollections) {
    try {
      console.log(`📋 Checking ${collection.name} (${collection.id}):`);
      
      const collectionData = await databases.getCollection(databaseId, collection.id);
      console.log(`  ✅ Collection exists: ${collectionData.name}`);
      
      // Get attributes
      const attributes = await databases.listAttributes(databaseId, collection.id);
      console.log(`  📊 Attributes (${attributes.total}):`);
      
      attributes.attributes.forEach(attr => {
        console.log(`    - ${attr.key}: ${attr.type}${attr.required ? ' (required)' : ''}${attr.array ? ' (array)' : ''}`);
      });
      
      console.log('');
      
    } catch (error) {
      console.log(`  ❌ Error with ${collection.name}: ${error.message}`);
      console.log('');
    }
  }
}

async function auditListingsCollection() {
  console.log('🔍 Detailed audit of listings collection...\n');
  
  try {
    const attributes = await databases.listAttributes('landsalelkdb', 'listings');
    console.log('Listings collection attributes:');
    
    const expectedAttributes = [
      'user_id', 'category_id', 'title', 'description', 'slug', 'listing_type', 
      'status', 'price', 'currency_code', 'price_negotiable', 'location', 
      'contact', 'attributes', 'features', 'images', 'is_premium', 'views_count', 
      'expires_at', 'ip_address', 'auction_enabled', 'bid_count'
    ];
    
    attributes.attributes.forEach(attr => {
      const isExpected = expectedAttributes.includes(attr.key);
      console.log(`  ${isExpected ? '✅' : '⚠️'} ${attr.key}: ${attr.type}${attr.required ? ' (required)' : ''}`);
    });
    
    // Check for missing attributes
    const existingKeys = attributes.attributes.map(attr => attr.key);
    const missingAttributes = expectedAttributes.filter(key => !existingKeys.includes(key));
    
    if (missingAttributes.length > 0) {
      console.log(`\n  ❌ Missing attributes: ${missingAttributes.join(', ')}`);
    } else {
      console.log('\n  ✅ All expected attributes present');
    }
    
  } catch (error) {
    console.error('Error auditing listings collection:', error.message);
  }
}

async function runAudit() {
  await auditCollections();
  console.log('\n' + '='.repeat(50) + '\n');
  await auditListingsCollection();
  console.log('\n✅ Appwrite collections audit complete!');
}

runAudit().catch(console.error);