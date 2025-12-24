/**
 * Schema Audit Script
 * Compares attributes used in code vs attributes defined in Appwrite
 * 
 * Run: node scripts/schema_audit.js
 */

const fs = require('fs');
const path = require('path');

// Load appwrite.json
const appwritePath = path.join(__dirname, '..', 'appwrite.json');
const appwriteConfig = JSON.parse(fs.readFileSync(appwritePath, 'utf8'));

// Extract collection schemas
const collections = {};
for (const collection of appwriteConfig.collections || []) {
    const attrs = new Set();
    for (const col of collection.columns || []) {
        attrs.add(col.key);
    }
    collections[collection.$id] = {
        name: collection.name,
        attributes: attrs,
        raw: collection.columns || []
    };
}

console.log('📋 Schema Audit Report\n');
console.log('='.repeat(60));
console.log(`Found ${Object.keys(collections).length} collections in appwrite.json\n`);

// Attributes used in code but might be missing from schema
const potentialMismatches = {
    'agents': [
        'user_id', 'name', 'phone', 'email', 'experience_years',
        'service_areas', 'license_number', 'bio', 'nic_doc_id',
        'is_verified', 'status', 'rating', 'review_count', 'deals_count',
        'points', 'listings_uploaded', 'total_earnings', 'created_at',
        'training_completed', 'certificate_id', 'vacation_mode'
    ],
    'listings': [
        'user_id', 'category_id', 'title', 'description', 'slug',
        'listing_type', 'status', 'price', 'currency_code', 'price_negotiable',
        'location', 'district', 'city', 'latitude', 'longitude', 'land_area',
        'area_unit', 'perches', 'images', 'featured', 'premium', 'promoted',
        'views', 'contact_views', 'created_at', 'updated_at', 'expires_at',
        'owner_verified', 'rejection_reason', 'auction_end_time'
    ],
    'agent_leads': [
        'agent_id', 'name', 'phone', 'email', 'message', 'listing_id',
        'status', 'source', 'notes', 'created_at', 'updated_at'
    ],
    'transactions': [
        'user_id', 'type', 'amount', 'currency', 'description',
        'reference_id', 'status', 'created_at'
    ],
    'notifications': [
        'user_id', 'title', 'message', 'type', 'is_read',
        'link', 'created_at'
    ],
    'kyc': [
        'user_id', 'document_type', 'front_image', 'back_image',
        'selfie_image', 'status', 'rejection_reason', 'created_at', 'updated_at'
    ],
    'favorites': [
        'user_id', 'listing_id', 'created_at'
    ],
    'messages': [
        'sender_id', 'receiver_id', 'listing_id', 'content',
        'is_read', 'created_at'
    ]
};

// Check each collection
const issues = [];

for (const [collectionId, expectedAttrs] of Object.entries(potentialMismatches)) {
    const collection = collections[collectionId];

    if (!collection) {
        console.log(`⚠️  Collection "${collectionId}" not found in appwrite.json`);
        issues.push({ collection: collectionId, type: 'missing_collection' });
        continue;
    }

    console.log(`\n📁 ${collection.name} (${collectionId}):`);

    const missingAttrs = [];
    for (const attr of expectedAttrs) {
        if (!collection.attributes.has(attr)) {
            missingAttrs.push(attr);
        }
    }

    if (missingAttrs.length === 0) {
        console.log('   ✅ All expected attributes present');
    } else {
        console.log(`   ❌ Missing ${missingAttrs.length} attributes:`);
        for (const attr of missingAttrs) {
            console.log(`      - ${attr}`);
            issues.push({ collection: collectionId, type: 'missing_attribute', attribute: attr });
        }
    }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('SUMMARY:\n');

if (issues.length === 0) {
    console.log('✅ No schema mismatches found!');
} else {
    console.log(`❌ Found ${issues.length} potential issues:\n`);

    const byCollection = {};
    for (const issue of issues) {
        if (!byCollection[issue.collection]) {
            byCollection[issue.collection] = [];
        }
        if (issue.attribute) {
            byCollection[issue.collection].push(issue.attribute);
        }
    }

    for (const [coll, attrs] of Object.entries(byCollection)) {
        if (attrs.length > 0) {
            console.log(`   ${coll}: ${attrs.join(', ')}`);
        }
    }

    console.log('\n💡 To fix: Run scripts to add missing attributes or update appwrite.json');
}

// Export issues for programmatic use
module.exports = { issues, collections };
