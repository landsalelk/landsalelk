const { Client, Databases } = require('node-appwrite')

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

async function addMissingAttributes() {
    console.log('🔄 Adding missing attributes to agents collection...')

    try {
        // Add email attribute
        await databases.createStringAttribute(
            databaseId,
            'agents',
            'email',
            255,
            false // not required
        )
        console.log('✅ Added email attribute')

        // Add status index if not exists
        try {
            await databases.createIndex(
                databaseId,
                'agents',
                'email_idx',
                'key',
                ['email']
            )
            console.log('✅ Added email index')
        } catch (indexError) {
            if (indexError.code === 409) {
                console.log('ℹ️  Email index already exists')
            } else {
                throw indexError
            }
        }

        console.log('✅ All attributes added successfully!')
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  Email attribute already exists')
        } else {
            console.error('❌ Error adding attributes:', error.message)
        }
    }
}

addMissingAttributes().catch(console.error)