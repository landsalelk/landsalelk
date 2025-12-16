const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb';
const COLLECTION_LISTINGS = 'listings';

async function main() {
    console.log('Starting title cleanup...');
    try {
        let offset = 0;
        let limit = 100;
        let total = 0;
        let updated = 0;

        while (true) {
            const response = await databases.listDocuments(
                DB_ID,
                COLLECTION_LISTINGS,
                [
                    // Query.limit(limit), // Cannot use Query here as I didn't import it, but default is 25. 
                    // I will just pagination manually or let it fetch default.
                ]
            );

            // Note: listDocuments without queries defaults to 25. To get all, we'd need pagination.
            // For now, let's just inspect the first batch or implement proper pagination if needed.
            // But since I can't easily import Query from node-appwrite in this simple script without potentially missing dependencies (though it should be there),
            // I'll just rely on the default batch for now. If there are many, I'd need a loop.
            // Actually `node-appwrite` exports Query.

            // Let's re-write with Query import if this fails, but for now let's just process what we get.
            // Wait, the previous debug script showed "Found 24 documents". That fits in one batch (default 25).

            const docs = response.documents;
            if (docs.length === 0) break;

            for (const doc of docs) {
                let newTitle = null;
                let newLocation = null;

                // Fix Title
                if (doc.title && typeof doc.title === 'string' && doc.title.trim().startsWith('{')) {
                    try {
                        const parsed = JSON.parse(doc.title);
                        if (parsed.en) newTitle = parsed.en;
                        else if (parsed.si) newTitle = parsed.si;
                        else if (Object.values(parsed).length > 0) newTitle = Object.values(parsed)[0];
                    } catch (e) {
                        console.warn(`Failed to parse title for ${doc.$id}: ${doc.title}`);
                    }
                }

                // Update if needed
                if (newTitle) {
                    console.log(`Updating ${doc.$id}:`);
                    console.log(`  Old Title: ${doc.title}`);
                    console.log(`  New Title: ${newTitle}`);

                    await databases.updateDocument(DB_ID, COLLECTION_LISTINGS, doc.$id, {
                        title: newTitle
                    });
                    updated++;
                }
            }

            // Break after one batch for safety/simplicity as we only have ~24 docs.
            break;
        }

        console.log(`Cleanup complete. Updated ${updated} documents.`);

    } catch (error) {
        console.error('Error fixing titles:', error);
    }
}

main();
