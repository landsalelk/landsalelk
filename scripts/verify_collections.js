#!/usr/bin/env node
/**
 * Verify and report on Appwrite collections status
 * Run: node scripts/verify_collections.js
 */

import { Client, Databases, Storage } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' }); // Fallback

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const client = new Client();
client.setEndpoint(ENDPOINT);
client.setProject(PROJECT_ID);
client.setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// All required collections
const REQUIRED_COLLECTIONS = [
    { id: 'listings', name: 'Property Listings' },
    { id: 'agents', name: 'Agents' },
    { id: 'messages', name: 'Messages/Chat' },
    { id: 'favorites', name: 'User Favorites' },
    { id: 'kyc_requests', name: 'KYC Requests' },
    { id: 'training_progress', name: 'Agent Training Progress' },
    { id: 'certificates', name: 'Agent Certificates' },
    // Legal Vault
    { id: 'legal_documents', name: 'Legal Documents' },
    { id: 'document_purchases', name: 'Document Purchases' },
    { id: 'agent_subscriptions', name: 'Agent Subscriptions' },
];

// Required buckets
const REQUIRED_BUCKETS = [
    { id: 'listings', name: 'Property Images' },
    { id: 'kyc_documents', name: 'KYC Documents' },
    { id: 'certificates', name: 'Generated Certificates' },
    { id: 'agent-ids', name: 'Digital Agent IDs' },
    // Legal Vault
    { id: 'legal_vault', name: 'Legal Vault (Originals)' },
    { id: 'watermarked_docs', name: 'Watermarked Documents' },
];

async function main() {
    console.log('🔍 Appwrite Collection & Bucket Verification\n');
    console.log('═'.repeat(50));
    console.log(`Database: ${DB_ID}`);
    console.log(`Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log('═'.repeat(50));

    if (!DB_ID || !process.env.APPWRITE_API_KEY) {
        console.error('\n❌ Missing environment variables!');
        console.error('   Required: NEXT_PUBLIC_APPWRITE_DATABASE_ID, APPWRITE_API_KEY');
        process.exit(1);
    }

    let passed = 0, failed = 0;

    // Check Collections
    console.log('\n📊 COLLECTIONS:\n');
    for (const col of REQUIRED_COLLECTIONS) {
        try {
            const collection = await databases.getCollection(DB_ID, col.id);
            const docs = await databases.listDocuments(DB_ID, col.id, []);
            console.log(`  ✅ ${col.id.padEnd(20)} | ${col.name.padEnd(25)} | ${docs.total} docs`);
            passed++;
        } catch (e) {
            if (e.code === 404) {
                console.log(`  ❌ ${col.id.padEnd(20)} | ${col.name.padEnd(25)} | NOT FOUND`);
            } else {
                console.log(`  ⚠️ ${col.id.padEnd(20)} | ${col.name.padEnd(25)} | ERROR: ${e.message}`);
            }
            failed++;
        }
    }

    // Check Buckets
    console.log('\n📁 STORAGE BUCKETS:\n');
    for (const bucket of REQUIRED_BUCKETS) {
        try {
            const b = await storage.getBucket(bucket.id);
            const files = await storage.listFiles(bucket.id, []);
            console.log(`  ✅ ${bucket.id.padEnd(20)} | ${bucket.name.padEnd(25)} | ${files.total} files`);
            passed++;
        } catch (e) {
            if (e.code === 404) {
                console.log(`  ❌ ${bucket.id.padEnd(20)} | ${bucket.name.padEnd(25)} | NOT FOUND`);
            } else {
                console.log(`  ⚠️ ${bucket.id.padEnd(20)} | ${bucket.name.padEnd(25)} | ERROR: ${e.message}`);
            }
            failed++;
        }
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log(`\n📋 SUMMARY: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        console.log('\n🔧 To fix missing items, run:');
        console.log('   node scripts/setup_all_collections.js');
        console.log('   node scripts/setup_storage.js');
    } else {
        console.log('\n🎉 All collections and buckets are properly configured!');
    }

    console.log('');
}

main().catch(console.error);
