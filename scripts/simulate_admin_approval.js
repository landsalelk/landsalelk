const { Client, Databases, Users, Query } = require('node-appwrite');

// Config
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject';
const API_KEY = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb';
const COLLECTION_AGENCIES = 'agencies';

if (!API_KEY) {
    console.error("Error: APPWRITE_API_KEY not found in environment.");
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);
const users = new Users(client);

async function approvePendingAgencies() {
    console.log("Searching for pending agency applications...");

    try {
        const result = await databases.listDocuments(
            DB_ID,
            COLLECTION_AGENCIES,
            [
                Query.equal('status', 'pending'),
                Query.limit(10)
            ]
        );

        if (result.documents.length === 0) {
            console.log("No pending applications found.");
            return;
        }

        console.log(`Found ${result.documents.length} pending application(s). Approving...`);

        for (const doc of result.documents) {
            console.log(`Approving agency: ${doc.name} (${doc.$id})...`);

            // 1. Update Status
            await databases.updateDocument(
                DB_ID,
                COLLECTION_AGENCIES,
                doc.$id,
                {
                    status: 'approved',
                    verified_at: new Date().toISOString()
                }
            );

            // 2. Add Label
            console.log(`Assigning 'agency_manager' label to user: ${doc.owner_id}...`);
            const user = await users.get(doc.owner_id);
            const labels = user.labels || [];

            if (!labels.includes('agency_manager')) {
                const newLabels = [...labels, 'agency_manager'];
                await users.updateLabels(doc.owner_id, newLabels);
                console.log("Label assigned.");
            } else {
                console.log("User already has label.");
            }
        }

        console.log("Done.");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

approvePendingAgencies();
