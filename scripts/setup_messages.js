const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';
const COLLECTION_MESSAGES = 'messages';

async function setupMessages() {
    try {
        console.log('Checking Messages Collection...');
        try {
            await databases.getCollection(DB_ID, COLLECTION_MESSAGES);
            console.log('Messages collection already exists.');
        } catch (error) {
            console.log('Creating Messages collection...');
            await databases.createCollection(
                DB_ID,
                COLLECTION_MESSAGES,
                'Messages',
                [
                    Permission.create(Role.users()),
                    Permission.read(Role.users()),
                    Permission.update(Role.users()),
                ]
            );

            console.log('Creating Attributes...');
            await databases.createStringAttribute(DB_ID, COLLECTION_MESSAGES, 'sender_id', 100, true);
            await databases.createStringAttribute(DB_ID, COLLECTION_MESSAGES, 'receiver_id', 100, true);
            await databases.createStringAttribute(DB_ID, COLLECTION_MESSAGES, 'content', 2000, true);
            await databases.createStringAttribute(DB_ID, COLLECTION_MESSAGES, 'conversation_id', 255, true);
            await databases.createBooleanAttribute(DB_ID, COLLECTION_MESSAGES, 'is_read', false, false);
            await databases.createDatetimeAttribute(DB_ID, COLLECTION_MESSAGES, 'timestamp', true);

            // Wait for attributes to be available
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Creating Index...');
            await databases.createIndex(DB_ID, COLLECTION_MESSAGES, 'by_conversation', 'key', ['conversation_id']);

            console.log('Messages collection setup complete.');
        }
    } catch (error) {
        console.error('Error setting up messages:', error);
    }
}

setupMessages();
