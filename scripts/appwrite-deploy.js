const util = require('util');
const { exec: execCallback } = require('child_process');
const path = require('path');

const exec = util.promisify(execCallback);
const projectRoot = path.resolve(__dirname, '..');
const siteId = process.env.APPWRITE_SITE_ID;

const main = async () => {
    try {
        // Check if the Appwrite CLI is installed and accessible.
        await exec('appwrite --version');

        // Check if the site ID is provided via environment variables.
        if (!siteId) {
            console.error('Error: APPWRITE_SITE_ID environment variable is not set.');
            process.exit(1);
        }

        const deployCommand = `appwrite push site --site-id ${siteId} --force`;

        // Execute the deployment command.
        // We will not log stdout on success to keep CI logs clean.
        await exec(deployCommand, { cwd: projectRoot });

    } catch (error) {
        // If any command fails, the promise will reject and be caught here.
        console.error('Deployment script failed.');
        if (error.stderr) {
            console.error(error.stderr);
        }
        if (error.stdout) {
            // Some CLI tools output errors to stdout
            console.error(error.stdout);
        }
        if (!error.stderr && !error.stdout) {
            console.error(error.message);
        }
        process.exit(1);
    }
};

main();
