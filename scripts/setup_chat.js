const { Client, Databases } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Manually read .env file
const envPath = path.resolve(__dirname, '../.env');
const envConfig = {};
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envConfig[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
        }
    });
}

const client = new Client()
    .setEndpoint(envConfig.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(envConfig.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(envConfig.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = envConfig.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';
const COLLECTION_MESSAGES = 'messages';

async function setupChatSchema() {
    console.log("💬 Setting up Chat Schema...");

    // 1. Check/Create Collection
    try {
        await databases.getCollection(DB_ID, COLLECTION_MESSAGES);
        console.log("✅ Messages collection exists.");
    } catch (e) {
        console.log("⚠️ Messages collection missing. Creating...");
        await databases.createCollection(DB_ID, COLLECTION_MESSAGES, 'Messages', [
            'role:all', // Permissions (refine later)
        ]);
    }

    // 2. Ensure Attributes
    const requiredAttributes = [
        { key: 'sender_id', type: 'string', size: 50, required: true },
        { key: 'receiver_id', type: 'string', size: 50, required: true },
        { key: 'content', type: 'string', size: 5000, required: true },
        { key: 'is_read', type: 'boolean', required: false, default: false },
        { key: 'conversation_id', type: 'string', size: 100, required: true }, // For grouping
    ];

    for (const attr of requiredAttributes) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(DB_ID, COLLECTION_MESSAGES, attr.key, attr.size, attr.required);
            } else if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(DB_ID, COLLECTION_MESSAGES, attr.key, attr.required, attr.default);
            }
            console.log(`   + Added attribute: ${attr.key}`);
            // Wait a bit for attribute to be processed
            await new Promise(r => setTimeout(r, 500));
        } catch (error) {
            // Ignore if already exists
            if (error.code !== 409) {
                console.log(`   ! Error adding ${attr.key}: ${error.message}`);
            } else {
                console.log(`   = Attribute ${attr.key} already exists.`);
            }
        }
    }

    // 3. Create Index for Performance
    try {
        await databases.createIndex(DB_ID, COLLECTION_MESSAGES, 'by_conversation', 'key', ['conversation_id'], ['asc']);
        console.log("   + Added Index: by_conversation");
    } catch (e) {
        // Ignore if exists
    }

    console.log("✅ Chat Schema Ready.");
}

setupChatSchema();
