#!/usr/bin/env node
/**
 * Seed sample agents data for development/testing
 * Run: node scripts/seed_agents.js
 */

import { Client, Databases, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_AGENTS = 'agents';

const SAMPLE_AGENTS = [
    {
        name: 'Rohan Perera',
        email: 'rohan@landsale.lk',
        phone: '+94 77 123 4567',
        whatsapp: '+94771234567',
        location: 'Colombo',
        specialization: 'Residential Properties',
        bio: 'Experienced real estate agent with 10+ years in Colombo market. Specializing in luxury apartments and family homes.',
        verification_status: 'verified',
        training_completed: true,
        kyc_verified: true,
        is_verified: true,
        rating: 4.9,
        deals_closed: 156,
        certified_at: new Date('2024-06-15').toISOString(),
        areas_served: ['Colombo 7', 'Colombo 5', 'Rajagiriya'],
        services: ['Property Valuation', 'Legal Consultation', 'Negotiation'],
    },
    {
        name: 'Shalini Fernando',
        email: 'shalini@landsale.lk',
        phone: '+94 71 234 5678',
        whatsapp: '+94712345678',
        location: 'Kandy',
        specialization: 'Land & Tea Estates',
        bio: 'Central Province land specialist. Expert in agricultural land, tea estates, and hill country properties.',
        verification_status: 'verified',
        training_completed: true,
        kyc_verified: true,
        is_verified: true,
        rating: 4.8,
        deals_closed: 89,
        certified_at: new Date('2024-03-20').toISOString(),
        areas_served: ['Kandy', 'Nuwara Eliya', 'Matale'],
        services: ['Land Survey', 'Estate Valuation', 'Legal Documentation'],
    },
    {
        name: 'Ajith de Silva',
        email: 'ajith@landsale.lk',
        phone: '+94 76 345 6789',
        whatsapp: '+94763456789',
        location: 'Galle',
        specialization: 'Beach & Coastal Properties',
        bio: 'Southern coast property expert. Specializing in beachfront villas, tourist hotels, and coastal land.',
        verification_status: 'verified',
        training_completed: true,
        kyc_verified: true,
        is_verified: true,
        rating: 4.7,
        deals_closed: 67,
        certified_at: new Date('2024-08-10').toISOString(),
        areas_served: ['Galle Fort', 'Unawatuna', 'Hikkaduwa', 'Mirissa'],
        services: ['Tourism Property', 'Beach Land', 'Rental Management'],
    },
    {
        name: 'Kumari Jayasuriya',
        email: 'kumari@landsale.lk',
        phone: '+94 70 456 7890',
        whatsapp: '+94704567890',
        location: 'Negombo',
        specialization: 'Commercial Properties',
        bio: 'Western Province commercial property specialist. Expertise in office spaces, retail shops, and warehouses.',
        verification_status: 'verified',
        training_completed: true,
        kyc_verified: true,
        is_verified: true,
        rating: 4.6,
        deals_closed: 45,
        certified_at: new Date('2024-09-05').toISOString(),
        areas_served: ['Negombo', 'Ja-Ela', 'Katunayake'],
        services: ['Commercial Leasing', 'Business Valuation', 'Investment Consulting'],
    },
    {
        name: 'Priya Mendis',
        email: 'priya@landsale.lk',
        phone: '+94 78 567 8901',
        whatsapp: '+94785678901',
        location: 'Colombo',
        specialization: 'Luxury Apartments',
        bio: 'Colombo luxury market specialist. Focusing on high-end condominiums and premium apartments.',
        verification_status: 'pending',
        training_completed: false,
        kyc_verified: false,
        is_verified: false,
        rating: 0,
        deals_closed: 0,
        areas_served: ['Colombo 3', 'Colombo 4', 'Colombo 6'],
        services: ['Apartment Sales', 'Rental Management'],
    },
    {
        name: 'Nuwan Rathnayake',
        email: 'nuwan@landsale.lk',
        phone: '+94 75 678 9012',
        whatsapp: '+94756789012',
        location: 'Kurunegala',
        specialization: 'Agricultural Land',
        bio: 'North Western Province land expert. Specializing in coconut estates, paddy fields, and rubber plantations.',
        verification_status: 'verified',
        training_completed: true,
        kyc_verified: true,
        is_verified: true,
        rating: 4.5,
        deals_closed: 34,
        certified_at: new Date('2024-07-22').toISOString(),
        areas_served: ['Kurunegala', 'Kuliyapitiya', 'Chilaw'],
        services: ['Land Survey', 'Agricultural Valuation', 'Estate Planning'],
    },
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
