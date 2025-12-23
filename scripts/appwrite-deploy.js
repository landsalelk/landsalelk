const { exec } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const siteId = process.env.APPWRITE_SITE_ID;

// Function to check if the Appwrite CLI is available
const checkCliExists = (callback) => {
    exec('appwrite --version', (error) => {
        if (error) {
            callback(false);
        } else {
            callback(true);
        }
    });
};

const deploy = () => {
    // First, check if the Appwrite CLI is installed and accessible.
    checkCliExists((exists) => {
        if (!exists) {
            console.error('Error: Appwrite CLI not found.');
            console.error('Please install the CLI globally via `npm install -g appwrite-cli` and ensure it is in your system\'s PATH.');
            process.exit(1);
            return;
        }

        // Next, check if the site ID is provided via environment variables.
        if (!siteId) {
            console.error('Error: APPWRITE_SITE_ID environment variable is not set.');
            process.exit(1);
            return;
        }

        const deployCommand = `appwrite push site --site-id ${siteId} --force`;
        console.log(`Starting Appwrite deployment for site ID: ${siteId}...`);

        const child = exec(deployCommand, { cwd: projectRoot }, (error, stdout, stderr) => {
            if (stdout) {
                console.log(stdout);
            }
            if (stderr) {
                console.error(stderr);
            }
            if (error) {
                console.error(`Deployment failed with error: ${error.message}`);
                process.exit(1); // Exit with a non-zero code to indicate failure in CI
            } else {
                console.log('Deployment completed successfully!');
            }
        });
    });
};

deploy();
