const { Client, Storage, Permission, Role } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

// All required buckets
const BUCKETS = [
    {
        id: 'kyc_documents',
        name: 'KYC Documents',
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
        maxSize: 10 * 1024 * 1024, // 10MB
    },
    {
        id: 'certificates',
        name: 'Agent Certificates',
        allowedExtensions: ['pdf', 'png'],
        maxSize: 5 * 1024 * 1024, // 5MB
    },
    {
        id: 'agent-ids',
        name: 'Digital Agent IDs',
        allowedExtensions: ['png', 'jpg', 'jpeg'],
        maxSize: 5 * 1024 * 1024, // 5MB
    },
    // ========== LEGAL VAULT BUCKETS ==========
    {
        id: 'legal_vault',
        name: 'Legal Vault (Originals)',
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSize: 20 * 1024 * 1024, // 20MB
    },
    {
        id: 'watermarked_docs',
        name: 'Watermarked Documents',
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSize: 20 * 1024 * 1024, // 20MB
    },
];

async function createBucket(bucket) {
    try {
        // Check if exists
        try {
            await storage.getBucket(bucket.id);
            console.log(`✅ Bucket '${bucket.name}' already exists.`);
            return true;
        } catch (e) {
            if (e.code !== 404) throw e;
        }

        // Create bucket with simple permissions
        await storage.createBucket(
            bucket.id,
            bucket.name,
            [
                Permission.create(Role.users()),
                Permission.read(Role.any()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ],
            false, // fileSecurity
            true,  // enabled
            bucket.maxSize,
            bucket.allowedExtensions,
            undefined, // compression
            true,  // encryption
            true   // antivirus
        );
        console.log(`✅ Created bucket '${bucket.name}'`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to create '${bucket.name}':`, error.message);
        return false;
    }
}

async function main() {
    console.log('🗄️  Setting up Storage Buckets...\n');

    let success = 0, failed = 0;
    for (const bucket of BUCKETS) {
        const result = await createBucket(bucket);
        if (result) success++;
        else failed++;
    }

    console.log(`\n📋 Storage Setup: ${success} succeeded, ${failed} failed`);
}

main().catch(console.error);

