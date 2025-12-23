
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
const util = require('util');
const commandExists = util.promisify(require('command-exists'));

const CONSTANTS = {
    ERROR_NO_ARGS: 'Error: Please provide arguments to the appwrite CLI.\nExample: node scripts/deploy.js push site --site-id <ID>',
    ERROR_CLI_NOT_FOUND: '❌ Error: The Appwrite CLI is not installed or not in your system\'s PATH.\nPlease install it by following the instructions at: https://appwrite.io/docs/command-line',
    ERROR_SPAWN_FAILED: '❌ Failed to start the Appwrite CLI process.',
    SUCCESS_MESSAGE: '\n✅ Appwrite command finished successfully.',
};

/**
 * Executes the Appwrite CLI command with the given arguments.
 * @param {string[]} args - The arguments to pass to the Appwrite CLI.
 * @returns {Promise<void>} A promise that resolves when the command completes successfully, and rejects on error.
 */
function executeAppwriteCommand(args) {
    return new Promise((resolve, reject) => {
        // Set the current working directory to the project root.
        const projectRoot = path.resolve(__dirname, '..');

        try {
            const appwriteProcess = spawn('appwrite', args, {
                cwd: projectRoot,
                stdio: 'inherit',
                shell: true,
            });

            appwriteProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Appwrite command failed with exit code ${code}`));
                } else {
                    resolve();
                }
            });

            appwriteProcess.on('error', (err) => {
                reject(new Error(`${CONSTANTS.ERROR_SPAWN_FAILED}\n${err.message}`));
            });
        } catch (err) {
            // Catch synchronous errors (e.g., executable not found)
            reject(new Error(`${CONSTANTS.ERROR_SPAWN_FAILED}\n${err.message}`));
        }
    });
}

/**
 * The main function of the script.
 */
async function main() {
    try {
        const args = process.argv.slice(2);
        if (args.length === 0) {
            throw new Error(CONSTANTS.ERROR_NO_ARGS);
        }

        const cliExists = await commandExists('appwrite');
        if (!cliExists) {
            throw new Error(CONSTANTS.ERROR_CLI_NOT_FOUND);
        }

        await executeAppwriteCommand(args);
        console.log(CONSTANTS.SUCCESS_MESSAGE);

    } catch (error) {
        console.error(`\n❌ ${error.message}`);
        process.exit(1);
    }
}

main();
