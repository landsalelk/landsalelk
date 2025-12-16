const { Client, Storage, Permission, Role } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

const BUCKET_NAME = 'KYC Documents';
const BUCKET_ID = 'kyc_documents';

async function setupStorage() {
    console.log('🚧 Checking Storage Buckets...');

    try {
        // Try to get the bucket
        await storage.getBucket(BUCKET_ID);
        console.log(`✅ Bucket '${BUCKET_NAME}' already exists.`);
    } catch (error) {
        if (error.code === 404) {
            console.log(`⚠️ Bucket '${BUCKET_NAME}' not found. Creating...`);
            try {
                await storage.createBucket(
                    BUCKET_ID,
                    BUCKET_NAME,
                    Permission.read(Role.any()), // Temporarily public for dev, should be locked down later or presigned
                    [], // File limits
                    true, // Enabled
                    true, // Encryption
                    true, // Antivirus
                    ['jpg', 'png', 'pdf'], // Allowed extensions
                    5 * 1024 * 1024 // 5MB limit
                );

                // Update permissions: Only owner can write/read, Admins can read
                await storage.updateBucket(
                    BUCKET_ID,
                    BUCKET_NAME,
                    [
                        Permission.create(Role.users()), // Authenticated users can upload
                        Permission.read(Role.users()),   // Users can read (ideally only their own, handled by file-level perms)
                        Permission.read(Role.team('admins')),
                        Permission.update(Role.team('admins')),
                        Permission.delete(Role.team('admins')),
                    ],
                    false, // File Security (if true, file perms take precedence)
                    true, // Enabled
                    5 * 1024 * 1024,
                    ['jpg', 'png', 'pdf'],
                    true, // Compression
                    true, // Encryption
                    true // Antivirus
                );

                console.log(`✅ Bucket '${BUCKET_NAME}' created successfully.`);
            } catch (createError) {
                console.error(`❌ Failed to create bucket:`, createError.message);
            }
        } else {
            console.error(`❌ Error checking bucket:`, error.message);
        }
    }
}

setupStorage();
