// Simple test to check if Appwrite connection works
import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Client, Databases } from 'node-appwrite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

console.log('Testing Appwrite connection...')

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)

try {
  const result = await databases.list()
  console.log('Success! Found', result.total, 'databases')
} catch (error) {
  console.error('Error:', error.message)
}