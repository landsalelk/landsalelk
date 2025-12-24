const { execSync } = require('child_process');

const SITE_ID = '6941d9280032a28b0536';

async function deleteAllSiteVars() {
    console.log('Fetching all site-level variables...');

    try {
        // Get list of variables
        const output = execSync(`npx appwrite sites list-variables --site-id ${SITE_ID}`, { encoding: 'utf8' });

        // Parse variable IDs from the table output
        // IDs are in the first column, 24-character hex strings
        const idRegex = /([a-f0-9]{24})\s+│/g;
        let match;
        const ids = [];

        while ((match = idRegex.exec(output)) !== null) {
            ids.push(match[1]);
        }

        console.log(`Found ${ids.length} site-level variables to delete.`);

        for (const id of ids) {
            console.log(`Deleting variable ${id}...`);
            try {
                execSync(`npx appwrite sites delete-variable --site-id ${SITE_ID} --variable-id ${id}`, { stdio: 'pipe' });
                console.log(`✅ Deleted ${id}`);
            } catch (e) {
                console.log(`⚠️ Failed to delete ${id}`);
            }
        }

        console.log('\nDone! All site-level variables deleted.');
        console.log('The site will now use GLOBAL project variables instead.');
        console.log('Please redeploy the site to apply changes.');

    } catch (e) {
        console.error('Error:', e.message);
    }
}

deleteAllSiteVars();
