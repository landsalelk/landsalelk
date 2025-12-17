const { Client, Databases, ID } = require('node-appwrite')

// Appwrite configuration
const endpoint = 'https://sgp.cloud.appwrite.io/v1'
const projectId = 'landsalelkproject'
const apiKey = 'standard_6146a90a8110a94d2d6468817a644b7d6dae2ca9162600f443e56ba1239851ecf7c43600c80decb7f2da4f2ef1958cbb65cac0abb4581eac85008343d7b01a0454940859670360dace3cd37c7719d6409e4edba73144682aa9e2e2dd05d67aa9f867b977c14a15397ad08614b61b23489a998a7ab1ae6ba9be1d81688089e16c'
const databaseId = 'landsalelkdb'

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey)

const databases = new Databases(client)

async function createTransactionsCollection() {
    console.log('🔄 Creating transactions collection...')

    try {
        // Create the collection
        const collection = await databases.createCollection(
            databaseId,
            'transactions',
            'Transactions',
            [
                'read("users")',
                'create("users")',
                'update("users")',
                'delete("users")'
            ]
        )
        console.log('✅ Created transactions collection')

        // Add attributes
        const attributes = [
            { key: 'order_id', type: 'string', size: 100, required: true },
            { key: 'payment_id', type: 'string', size: 100, required: false },
            { key: 'user_id', type: 'string', size: 36, required: true },
            { key: 'property_id', type: 'string', size: 36, required: false },
            { key: 'amount', type: 'integer', required: true }, // Store in cents
            { key: 'currency', type: 'string', size: 3, required: true },
            { key: 'status', type: 'string', size: 50, required: true },
            { key: 'provider', type: 'string', size: 50, required: true },
            { key: 'created_at', type: 'datetime', required: true }
        ]

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        databaseId,
                        collection.$id,
                        attr.key,
                        attr.size,
                        attr.required
                    )
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        databaseId,
                        collection.$id,
                        attr.key,
                        attr.required
                    )
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        databaseId,
                        collection.$id,
                        attr.key,
                        attr.required
                    )
                }
                console.log(`✅ Added ${attr.key} attribute`)
            } catch (attrError) {
                if (attrError.code === 409) {
                    console.log(`ℹ️  ${attr.key} attribute already exists`)
                } else {
                    throw attrError
                }
            }
        }

        // Add indexes
        const indexes = [
            { key: 'order_id_idx', type: 'unique', attributes: ['order_id'] },
            { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
            { key: 'status_idx', type: 'key', attributes: ['status'] },
            { key: 'created_at_idx', type: 'key', attributes: ['created_at'] }
        ]

        for (const index of indexes) {
            try {
                await databases.createIndex(
                    databaseId,
                    collection.$id,
                    index.key,
                    index.type,
                    index.attributes
                )
                console.log(`✅ Added ${index.key} index`)
            } catch (indexError) {
                if (indexError.code === 409) {
                    console.log(`ℹ️  ${index.key} index already exists`)
                } else {
                    throw indexError
                }
            }
        }

        console.log('✅ Transactions collection created successfully!')
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  Transactions collection already exists')
        } else {
            console.error('❌ Error creating transactions collection:', error.message)
        }
    }
}

createTransactionsCollection().catch(console.error)