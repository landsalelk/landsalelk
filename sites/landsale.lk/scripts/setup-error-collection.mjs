import { Client, Databases, Permission, Role } from 'node-appwrite';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.EXT_PUBLIC_APPWRITE_DATABASE_ID || 'osclass_landsale_db';
const COLLECTION_ID = 'system_errors';

if (!API_KEY) {
    console.error('Error: APPWRITE_API_KEY environment variable is not set.');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function setupErrorCollection() {
    try {
        console.log(`Checking if collection '${COLLECTION_ID}' exists in database '${DATABASE_ID}'...`);
        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_ID);
            console.log(`Collection '${COLLECTION_ID}' already exists.`);
        } catch (error) {
            if (error.code === 404) {
                console.log(`Collection '${COLLECTION_ID}' does not exist. Creating it...`);
                await databases.createCollection(
                    DATABASE_ID,
                    COLLECTION_ID,
                    'System Errors',
                    [
                        Permission.create('users'), // Authenticated users can create
                        Permission.read('any'),     // (Optional) Anyone can read, or restrict to admins
                        // For system errors, maybe we only want admins to read.
                        // But for "create", client-side errors need to be written by the user.
                        // However, strictly speaking, client-side errors might happen to unauthenticated users too.
                        // Ideally, we use a server-function or an API key with specific scope,
                        // but for client-side direct access, we need 'any' can create or 'users' can create.
                        // Let's allow 'any' to create for now so guest users errors are captured.
                        Permission.create('any'),
                        Permission.read(Role.team('admins')), // Only admins can read
                        Permission.update(Role.team('admins')),
                        Permission.delete(Role.team('admins')),
                    ]
                );
                console.log(`Collection '${COLLECTION_ID}' created.`);
            } else {
                throw error;
            }
        }

        console.log('Ensuring attributes...');

        // Define attributes
        const attributes = [
            { key: 'message', type: 'string', size: 5000, required: true },
            { key: 'stack', type: 'string', size: 10000, required: false },
            { key: 'component_stack', type: 'string', size: 10000, required: false },
            { key: 'url', type: 'string', size: 2000, required: false },
            { key: 'user_agent', type: 'string', size: 1000, required: false },
            { key: 'user_id', type: 'string', size: 36, required: false },
            { key: 'timestamp', type: 'string', size: 100, required: true }, // ISO string
            { key: 'environment', type: 'string', size: 50, required: false },
        ];

        for (const attr of attributes) {
            try {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTION_ID,
                    attr.key,
                    attr.size,
                    attr.required
                );
                console.log(`Attribute '${attr.key}' created.`);
            } catch (error) {
                // Ignore if attribute already exists (409 Conflict)
                if (error.code === 409) {
                    console.log(`Attribute '${attr.key}' already exists.`);
                } else {
                    console.error(`Error creating attribute '${attr.key}':`, error);
                }
            }
        }

        // Wait a bit for attributes to be processed if we were to create indexes, but we aren't creating indexes right now.
        console.log('Setup complete.');

    } catch (error) {
        console.error('Setup failed:', error);
    }
}

setupErrorCollection();
