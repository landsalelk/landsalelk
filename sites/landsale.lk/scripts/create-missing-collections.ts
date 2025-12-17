import { Client, Databases, ID } from 'node-appwrite'

// Appwrite configuration
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '693962bb002fb1f881bd'
const apiKey = process.env.APPWRITE_API_KEY || ''
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'osclass_landsale_db'

if (!apiKey) {
    console.error('❌ APPWRITE_API_KEY is required')
    process.exit(1)
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey)

const databases = new Databases(client)

// Missing collections to create
const missingCollections = [
    {
        id: 'agents',
        name: 'Agents',
        attributes: [
            { key: 'user_id', type: 'string', size: 36, required: true },
            { key: 'name', type: 'string', size: 200, required: true },
            { key: 'phone', type: 'string', size: 45, required: true },
            { key: 'whatsapp', type: 'string', size: 45, required: false },
            { key: 'bio', type: 'string', size: 2000, required: false },
            { key: 'experience_years', type: 'integer', required: false, default: 0 },
            { key: 'service_areas', type: 'string', size: 2000, array: true, required: false },
            { key: 'specializations', type: 'string', size: 2000, array: true, required: false },
            { key: 'is_verified', type: 'boolean', required: true, default: false },
            { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
            { key: 'rating', type: 'double', required: false, default: 0 },
            { key: 'review_count', type: 'integer', required: false, default: 0 },
            { key: 'deals_count', type: 'integer', required: false, default: 0 },
            { key: 'created_at', type: 'datetime', required: true }
        ],
        indexes: [
            { key: 'user_id_idx', type: 'unique', attributes: ['user_id'] },
            { key: 'status_idx', type: 'key', attributes: ['status'] },
            { key: 'verified_idx', type: 'key', attributes: ['is_verified'] }
        ],
        permissions: {
            read: ['any'],
            create: ['users'],
            update: ['users'],
            delete: ['users']
        }
    },
    {
        id: 'digital_purchases',
        name: 'Digital Purchases',
        attributes: [
            { key: 'user_id', type: 'string', size: 36, required: true },
            { key: 'property_id', type: 'string', size: 36, required: true },
            { key: 'product_type', type: 'string', size: 100, required: true },
            { key: 'payment_id', type: 'string', size: 100, required: true },
            { key: 'status', type: 'string', size: 50, required: true, default: 'processing' },
            { key: 'file_id', type: 'string', size: 255, required: false },
            { key: 'created_at', type: 'datetime', required: true },
            { key: 'completed_at', type: 'datetime', required: false }
        ],
        indexes: [
            { key: 'user_property_idx', type: 'unique', attributes: ['user_id', 'property_id', 'product_type'] },
            { key: 'user_idx', type: 'key', attributes: ['user_id'] },
            { key: 'property_idx', type: 'key', attributes: ['property_id'] },
            { key: 'status_idx', type: 'key', attributes: ['status'] }
        ],
        permissions: {
            read: ['users'],
            create: ['users'],
            update: ['users'],
            delete: ['users']
        }
    }
]

async function createCollection(collection: any) {
    try {
        console.log(`🔄 Creating collection: ${collection.name} (${collection.id})`)

        // Create collection
        await databases.createCollection(
            databaseId,
            collection.id,
            collection.name,
            collection.permissions
        )

        // Create attributes
        for (const attr of collection.attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        databaseId,
                        collection.id,
                        attr.key,
                        attr.size,
                        attr.required,
                        attr.default
                    )
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        databaseId,
                        collection.id,
                        attr.key,
                        attr.required,
                        attr.default
                    )
                } else if (attr.type === 'double') {
                    await databases.createFloatAttribute(
                        databaseId,
                        collection.id,
                        attr.key,
                        attr.required,
                        attr.default
                    )
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        databaseId,
                        collection.id,
                        attr.key,
                        attr.required,
                        attr.default
                    )
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        databaseId,
                        collection.id,
                        attr.key,
                        attr.required
                    )
                }

                if (attr.array) {
                    // Wait a bit for attribute creation to complete
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
            } catch (error: any) {
                if (error.code === 409) {
                    console.log(`   ℹ️  Attribute ${attr.key} already exists`)
                } else {
                    throw error
                }
            }
        }

        // Create indexes
        for (const index of collection.indexes) {
            try {
                await databases.createIndex(
                    databaseId,
                    collection.id,
                    index.key,
                    index.type,
                    index.attributes
                )
            } catch (error: any) {
                if (error.code === 409) {
                    console.log(`   ℹ️  Index ${index.key} already exists`)
                } else {
                    throw error
                }
            }
        }

        console.log(`✅ Collection ${collection.name} created successfully`)
    } catch (error: any) {
        if (error.code === 409) {
            console.log(`ℹ️  Collection ${collection.name} already exists`)
        } else {
            console.error(`❌ Error creating collection ${collection.name}:`, error.message)
            throw error
        }
    }
}

async function main() {
    console.log('🚀 Starting Appwrite collections setup...')
    console.log(`📍 Database: ${databaseId}`)
    console.log(`🔗 Endpoint: ${endpoint}`)

    for (const collection of missingCollections) {
        await createCollection(collection)
    }

    console.log('✅ All collections setup completed!')
}

main().catch(console.error)