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

async function addVerificationFields() {
    console.log('🔄 Adding verification fields to listings collection...')

    try {
        // Add verification_requested field
        await databases.createBooleanAttribute(
            databaseId,
            'listings',
            'verification_requested',
            false // not required, defaults to false
        )
        console.log('✅ Added verification_requested field')

        // Add verification_paid field
        await databases.createBooleanAttribute(
            databaseId,
            'listings',
            'verification_paid',
            false // not required, defaults to false
        )
        console.log('✅ Added verification_paid field')

        // Add boost_until field
        await databases.createDatetimeAttribute(
            databaseId,
            'listings',
            'boost_until',
            false // not required
        )
        console.log('✅ Added boost_until field')

        // Add is_boosted field
        await databases.createBooleanAttribute(
            databaseId,
            'listings',
            'is_boosted',
            false // not required, defaults to false
        )
        console.log('✅ Added is_boosted field')

        console.log('✅ All verification fields added successfully!')
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  Some fields already exist')
        } else {
            console.error('❌ Error adding fields:', error.message)
        }
    }
}

addVerificationFields().catch(console.error)