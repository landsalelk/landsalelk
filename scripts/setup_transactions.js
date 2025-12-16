const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';
const COLLECTION_TRANSACTIONS = 'transactions';

async function setupTransactions() {
    try {
        console.log('Checking Transactions Collection...');
        try {
            await databases.getCollection(DB_ID, COLLECTION_TRANSACTIONS);
            console.log('Transactions collection already exists.');
        } catch (error) {
            console.log('Creating Transactions collection...');
            await databases.createCollection(
                DB_ID,
                COLLECTION_TRANSACTIONS,
                'Transactions',
                [
                    Permission.read(Role.any()), // Admin view
                    Permission.create(Role.users()), // Authenticated users can create
                    Permission.read(Role.users()), // Own transactions
                    Permission.update(Role.team('admins')),
                    Permission.delete(Role.team('admins')),
                ]
            );

            console.log('Creating Attributes...');
            await databases.createStringAttribute(DB_ID, COLLECTION_TRANSACTIONS, 'user_id', 100, true);
            await databases.createFloatAttribute(DB_ID, COLLECTION_TRANSACTIONS, 'amount', true);
            await databases.createStringAttribute(DB_ID, COLLECTION_TRANSACTIONS, 'status', 50, true); // success, failed, pending
            await databases.createStringAttribute(DB_ID, COLLECTION_TRANSACTIONS, 'reference_id', 100, false); // PayHere ID
            await databases.createStringAttribute(DB_ID, COLLECTION_TRANSACTIONS, 'type', 50, true); // subscription, boost, etc.
            await databases.createDatetimeAttribute(DB_ID, COLLECTION_TRANSACTIONS, 'timestamp', true);

            console.log('Transactions collection setup complete.');
        }
    } catch (error) {
        console.error('Error setting up transactions:', error);
    }
}

setupTransactions();
