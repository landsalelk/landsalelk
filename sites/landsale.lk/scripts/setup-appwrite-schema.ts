/**
 * Appwrite Schema Setup Script
 * Run with: npx tsx scripts/setup-appwrite-schema.ts
 * 
 * This script creates all necessary collections for the Agents System
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite'

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || ''
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'osclass_landsale_db'

async function main() {
    console.log('🚀 Starting Appwrite Schema Setup...')
    console.log(`   Endpoint: ${APPWRITE_ENDPOINT}`)
    console.log(`   Project: ${APPWRITE_PROJECT_ID}`)
    console.log(`   Database: ${DATABASE_ID}`)

    if (!APPWRITE_API_KEY) {
        console.error('❌ APPWRITE_API_KEY is required')
        process.exit(1)
    }

    const client = new Client()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID)
        .setKey(APPWRITE_API_KEY)

    const databases = new Databases(client)

    // ==========================================
    // 1. AGENTS COLLECTION
    // ==========================================
    console.log('\n📦 Setting up AGENTS collection...')

    try {
        await databases.createCollection(
            DATABASE_ID,
            'agents',
            'Agents',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
            ]
        )
        console.log('   ✅ Created agents collection')
    } catch (e: any) {
        if (e.code === 409) {
            console.log('   ⏭️  agents collection already exists')
        } else {
            console.error('   ❌ Failed to create agents:', e.message)
        }
    }

    // Add agents attributes
    const agentAttributes = [
        { key: 'user_id', type: 'string', size: 36, required: true },
        { key: 'name', type: 'string', size: 200, required: true },
        { key: 'email', type: 'string', size: 320, required: false },
        { key: 'phone', type: 'string', size: 20, required: true },
        { key: 'whatsapp', type: 'string', size: 20, required: false },
        { key: 'bio', type: 'string', size: 2000, required: false },
        { key: 'avatar_url', type: 'string', size: 500, required: false },
        { key: 'experience_years', type: 'integer', required: false, default: 0 },
        { key: 'service_areas', type: 'string[]', size: 100, required: false },
        { key: 'specializations', type: 'string[]', size: 100, required: false },
        { key: 'is_verified', type: 'boolean', required: false, default: false },
        { key: 'status', type: 'string', size: 20, required: false, default: 'pending' },
        { key: 'rating', type: 'float', required: false, default: 0 },
        { key: 'review_count', type: 'integer', required: false, default: 0 },
        { key: 'deals_count', type: 'integer', required: false, default: 0 },
        { key: 'verification_documents', type: 'string', size: 10000, required: false },
        { key: 'vacation_mode', type: 'boolean', required: false, default: false },
        { key: 'created_at', type: 'datetime', required: false },
        { key: 'updated_at', type: 'datetime', required: false },
    ]

    for (const attr of agentAttributes) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(
                    DATABASE_ID, 'agents', attr.key, attr.size!, attr.required, attr.default as string || undefined
                )
            } else if (attr.type === 'string[]') {
                await databases.createStringAttribute(
                    DATABASE_ID, 'agents', attr.key, attr.size!, attr.required, undefined, true
                )
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DATABASE_ID, 'agents', attr.key, attr.required, undefined, undefined, attr.default as number
                )
            } else if (attr.type === 'float') {
                await databases.createFloatAttribute(
                    DATABASE_ID, 'agents', attr.key, attr.required, undefined, undefined, attr.default as number
                )
            } else if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID, 'agents', attr.key, attr.required, attr.default as boolean
                )
            } else if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID, 'agents', attr.key, attr.required
                )
            }
            console.log(`   ✅ Created attribute: ${attr.key}`)
        } catch (e: any) {
            if (e.code === 409) {
                console.log(`   ⏭️  Attribute ${attr.key} already exists`)
            } else {
                console.error(`   ❌ Failed to create ${attr.key}:`, e.message)
            }
        }
    }

    // ==========================================
    // 2. AGENT_LEADS COLLECTION
    // ==========================================
    console.log('\n📦 Setting up AGENT_LEADS collection...')

    try {
        await databases.createCollection(
            DATABASE_ID,
            'agent_leads',
            'Agent Leads',
            [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
            ]
        )
        console.log('   ✅ Created agent_leads collection')
    } catch (e: any) {
        if (e.code === 409) {
            console.log('   ⏭️  agent_leads collection already exists')
        } else {
            console.error('   ❌ Failed to create agent_leads:', e.message)
        }
    }

    // Add agent_leads attributes
    const leadAttributes = [
        { key: 'agent_id', type: 'string', size: 36, required: true },
        { key: 'agent_user_id', type: 'string', size: 36, required: true },
        { key: 'property_id', type: 'string', size: 36, required: true },
        { key: 'property_title', type: 'string', size: 500, required: true },
        { key: 'city', type: 'string', size: 100, required: false },
        { key: 'district', type: 'string', size: 100, required: false },
        { key: 'price', type: 'integer', required: false, default: 0 },
        { key: 'seller_phone', type: 'string', size: 20, required: false },
        { key: 'status', type: 'string', size: 30, required: false, default: 'new' },
        { key: 'priority', type: 'string', size: 10, required: false, default: 'medium' },
        { key: 'notes', type: 'string[]', size: 1000, required: false },
        { key: 'created_at', type: 'datetime', required: false },
    ]

    for (const attr of leadAttributes) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(
                    DATABASE_ID, 'agent_leads', attr.key, attr.size!, attr.required, attr.default as string || undefined
                )
            } else if (attr.type === 'string[]') {
                await databases.createStringAttribute(
                    DATABASE_ID, 'agent_leads', attr.key, attr.size!, attr.required, undefined, true
                )
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DATABASE_ID, 'agent_leads', attr.key, attr.required, undefined, undefined, attr.default as number
                )
            } else if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID, 'agent_leads', attr.key, attr.required
                )
            }
            console.log(`   ✅ Created attribute: ${attr.key}`)
        } catch (e: any) {
            if (e.code === 409) {
                console.log(`   ⏭️  Attribute ${attr.key} already exists`)
            } else {
                console.error(`   ❌ Failed to create ${attr.key}:`, e.message)
            }
        }
    }

    // Wait for attributes to be ready
    console.log('\n⏳ Waiting for attributes to be processed...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // ==========================================
    // 3. CREATE INDEXES
    // ==========================================
    console.log('\n📇 Creating indexes...')

    const indexes = [
        { collection: 'agents', key: 'user_id_idx', type: 'unique', attributes: ['user_id'] },
        { collection: 'agents', key: 'status_verified_idx', type: 'key', attributes: ['status', 'is_verified'] },
        { collection: 'agent_leads', key: 'agent_user_id_idx', type: 'key', attributes: ['agent_user_id'] },
        { collection: 'agent_leads', key: 'status_idx', type: 'key', attributes: ['status'] },
    ]

    for (const idx of indexes) {
        try {
            await databases.createIndex(
                DATABASE_ID,
                idx.collection,
                idx.key,
                idx.type as any,
                idx.attributes
            )
            console.log(`   ✅ Created index: ${idx.collection}.${idx.key}`)
        } catch (e: any) {
            if (e.code === 409) {
                console.log(`   ⏭️  Index ${idx.key} already exists`)
            } else {
                console.error(`   ❌ Failed to create index ${idx.key}:`, e.message)
            }
        }
    }

    console.log('\n✅ Schema setup complete!')
    console.log('\n📋 Next steps:')
    console.log('   1. Create the agent_documents bucket in Appwrite Console')
    console.log('   2. Test agent registration at /agents')
    console.log('   3. Test leads dashboard at /dashboard/leads')
}

main().catch(console.error)
