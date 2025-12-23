
/**
 * @file deploy.js
 * @description A wrapper script to execute Appwrite CLI commands from the project root.
 * This script ensures that the `appwrite` command can always find the `appwrite.json`
 * configuration file by setting the current working directory to the project root.
 * It passes all command-line arguments directly to the Appwrite CLI.
 *
 * @example
 * // To deploy functions:
 * node scripts/deploy.js deploy function --all
 *
 * @example
 * // To push a site:
 * node scripts/deploy.js push site --site-id <YOUR_SITE_ID>
 */
const { spawn } = require('child_process');
const path = require('path');
const commandExists = require('command-exists');

// This script ensures that the appwrite command is run from the project root directory.
const projectRoot = path.resolve(__dirname, '..');

// Get the arguments passed to this script, and pass them along to the appwrite CLI
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('Error: Please provide arguments to the appwrite CLI.');
    console.error('Example: node scripts/deploy.js push site --site-id <ID>');
    process.exit(1);
}

// First, check if the `appwrite` command exists
commandExists('appwrite', (err, commandExists) => {
    if (err) {
        console.error('Error checking for Appwrite CLI:', err);
        process.exit(1);
    }

    if (!commandExists) {
        console.error('❌ Error: The Appwrite CLI is not installed or not in your system\'s PATH.');
        console.error('Please install it by following the instructions at: https://appwrite.io/docs/command-line');
        process.exit(1);
    }

    // If the command exists, proceed to execute it
    const appwriteProcess = spawn('appwrite', args, {
        cwd: projectRoot,
        stdio: 'inherit', // Pipe the output (stdout, stderr) of the child process to the parent
        shell: true      // Use shell for better cross-platform compatibility (e.g., finding `appwrite` in PATH on Windows)
    });

    appwriteProcess.on('close', (code) => {
    if (code !== 0) {
        console.error(`\n❌ Appwrite command failed with exit code ${code}`);
        process.exit(code);
    }
    console.log('\n✅ Appwrite command finished successfully.');
});

    appwriteProcess.on('error', (err) => {
        console.error('❌ Failed to start the Appwrite CLI process.', err);
        console.error('This can happen even if the CLI is installed, e.g., due to permission issues.');
        process.exit(1);
    });
});
