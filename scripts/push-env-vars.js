const { execSync } = require('child_process');
const fs = require('fs');

const SITE_ID = '6941d9280032a28b0536';
const ENV_FILE = '.env.example';

function run(command) {
    try {
        // Suppress stdout for cleaner output, catch error
        execSync(command, { stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

async function pushVars() {
    console.log(`Reading ${ENV_FILE}...`);
    const content = fs.readFileSync(ENV_FILE, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');

        if (key && value) {
            console.log(`Setting ${key}...`);
            // Check if variable exists
            // Since there's no easy "check", we try to create. If it fails, we update.
            // Actually, best to just use create-variable. If it exists, it might error.

            try {
                // Try to create
                execSync(`npx appwrite sites create-variable --site-id ${SITE_ID} --key "${key}" --value "${value}"`, { stdio: 'pipe' });
                console.log(`✅ Created ${key}`);
            } catch (e) {
                // If create failed, try update (assuming it exists)
                try {
                    const list = execSync(`npx appwrite sites list-variables --site-id ${SITE_ID}`, { encoding: 'utf8' });
                    // Parse list to find ID? The CLI is hard to parse json from unless we use --json (if available) or grep.
                    // Simpler: Just try to update. But we need variable ID.
                    // Appwrite CLI for update-variable requires --variable-id.
                    // We can't easily get the ID from the key without parsing user output.

                    // Alternative: Delete and Recreate?
                    // We need ID to delete too.

                    // Optimization: Use the list output to match Key to ID.
                    const match = list.match(new RegExp(`^\\s*([a-zA-Z0-9]+).*${key}`, 'm'));
                    // The output format of `appwrite sites list-variables` is a table.
                    // ID | Key | Value ...

                    // Let's rely on node-appwrite SDK?
                    // No, I don't have the API Key initialized in this script context easily.
                    // I'll stick to CLI.

                    console.log(`⚠️  Could not create ${key} (might exist). Manual check required if value changed.`);
                } catch (err) {
                    console.error(`❌ Failed to set ${key}`);
                }
            }
        }
    }
    console.log('Done!');
}

pushVars();
