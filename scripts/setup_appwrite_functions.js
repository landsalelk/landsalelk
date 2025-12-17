/**
 * Setup Appwrite Functions
 * 
 * Ensures required functions exist in the Appwrite project.
 */

const { Client, Functions } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val.length && !process.env[key.trim()]) {
            process.env[key.trim()] = val.join('=').trim();
        }
    });
}

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const functions = new Functions(client);

const targetFunctions = [
    {
        id: 'send-otp-sms',
        name: 'Send OTP SMS',
        runtime: 'node-18.0',
        execute: [], // Event triggered usually, but can be empty
        events: ['databases.listings.collections.listings.documents.create'] // Auto trigger? 
        // Note: Creating events via API requires the Collection and Database ID.
        // It's safer to just create the function and let user/script configure events properly or update later.
        // But functions.create events param expects array of strings.
        // The format is `databases.[db_id].collections.[col_id].documents.create`.
    },
    {
        id: 'verify-otp',
        name: 'Verify OTP',
        runtime: 'node-18.0',
        execute: ['any'] // Public endpoint for verification
    }
];

async function main() {
    console.log('⚡ Setting up Appwrite Functions...');

    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelk';

    for (const func of targetFunctions) {
        console.log(`\nChecking function: ${func.name} (${func.id})...`);

        try {
            await functions.get(func.id);
            console.log('   ✓ Function exists.');

            // Optional: Update events for send-otp if needed
            if (func.id === 'send-otp-sms') {
                // Construct event string dynamically
                const event = `databases.${dbId}.collections.listings.documents.create`;
                try {
                    // We can't easily check *existing* events without comparing.
                    // Just update it to be sure.
                    await functions.update(func.id, func.name, func.runtime, func.execute, [event]);
                    console.log('   ✓ Updated events.');
                } catch (e) {
                    console.log('   ! Could not update events:', e.message);
                }
            }

        } catch (e) {
            if (e.code === 404) {
                console.log('   Function not found. Creating...');
                try {
                    // Update events with dynamic DB ID
                    let events = func.events || [];
                    if (func.id === 'send-otp-sms') {
                        events = [`databases.${dbId}.collections.listings.documents.create`];
                    }

                    await functions.create(
                        func.id,
                        func.name,
                        func.runtime,
                        func.execute,
                        events
                    );
                    console.log(`   ✓ Created function: ${func.name}`);
                } catch (createError) {
                    console.error(`   ✗ Failed to create function: ${createError.message}`);
                }
            } else {
                console.error(`   ✗ Error checking function: ${e.message}`);
            }
        }
    }

    console.log('\nSetup complete. You can now run "scripts/deploy-functions.js" to deploy the code.');
}

main();
