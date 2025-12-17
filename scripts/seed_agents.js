#!/usr/bin/env node
/**
 * Seed sample agents data for development/testing
 * Run: node scripts/seed_agents.js
 */

import { Client, Databases, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' }); // Fallback

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

const client = new Client();
client.setEndpoint(ENDPOINT);
client.setProject(PROJECT_ID);
client.setKey(API_KEY);

const databases = new Databases(client);
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_AGENTS = 'agents';

const SAMPLE_AGENTS = [
    { user_id: 'seed_001', name: 'Rohan Perera' },
    { user_id: 'seed_002', name: 'Shalini Fernando' },
    { user_id: 'seed_003', name: 'Ajith de Silva' },
    { user_id: 'seed_004', name: 'Kumari Jayasuriya' },
    { user_id: 'seed_005', name: 'Priya Mendis' },
    { user_id: 'seed_006', name: 'Nuwan Rathnayake' },
];

async function main() {
    console.log('🌱 Seeding Sample Agents Data\n');
    console.log('═'.repeat(50));

    if (!DB_ID || !process.env.APPWRITE_API_KEY) {
        console.error('❌ Missing environment variables!');
        process.exit(1);
    }

    // Check if agents already exist
    try {
        const existing = await databases.listDocuments(DB_ID, COLLECTION_AGENTS, []);
        if (existing.total > 0) {
            console.log(`\n⚠️  Found ${existing.total} existing agents.`);
            console.log('   Skipping seed to avoid duplicates.');
            console.log('   To re-seed, delete existing agents first.\n');
            return;
        }
    } catch (e) {
        if (e.code === 404) {
            console.error('❌ Collection "agents" not found!');
            console.error('   Run: node scripts/setup_all_collections.js');
            process.exit(1);
        }
    }

    // Create agents
    console.log('\n📝 Creating agents...\n');
    for (const agent of SAMPLE_AGENTS) {
        try {
            const doc = await databases.createDocument(
                DB_ID,
                COLLECTION_AGENTS,
                ID.unique(),
                {
                    ...agent,
                    created_at: new Date().toISOString(),
                }
            );
            const status = agent.is_verified ? '✅' : '⏳';
            console.log(`  ${status} Created: ${agent.name} (${agent.location})`);
        } catch (e) {
            console.error(`  ❌ Failed: ${agent.name} - ${e.message}`);
        }
    }

    console.log('\n' + '═'.repeat(50));
    console.log('🎉 Agent seeding complete!');
    console.log('   Visit /agents to see the agents directory.\n');
}

main().catch(console.error);
