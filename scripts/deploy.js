
const { spawn } = require('child_process');
const path = require('path');

// This script ensures that the appwrite command is run from the project root directory.
const projectRoot = path.resolve(__dirname, '..');
console.log(`Running Appwrite command from project root: ${projectRoot}`);

// Get the arguments passed to this script, and pass them along to the appwrite CLI
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('Error: Please provide arguments to the appwrite CLI.');
    console.error('Example: node scripts/deploy.js push site --site-id <ID>');
    process.exit(1);
}

console.log(`Executing: appwrite ${args.join(' ')}`);

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
    console.error('Please ensure the Appwrite CLI is installed and accessible in your system\'s PATH.');
    process.exit(1);
});
