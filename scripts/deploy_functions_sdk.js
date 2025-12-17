/**
 * Deploy Appwrite Functions via SDK (Bypassing CLI)
 * 
 * Packages code using 'tar' and uploads via Appwrite SDK.
 */

const { Client, Functions, ID } = require('node-appwrite');
// Workaround: InputFile might be missing in root package or different version
const { InputFile } = require('../functions/send-otp-sms/node_modules/node-appwrite');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const targetFunctions = ['send-otp-sms', 'verify-otp'];

async function main() {
    console.log('🚀 Deploying Functions via SDK...');

    for (const funcId of targetFunctions) {
        console.log(`\n📦 Processing: ${funcId}`);
        const funcPath = path.join(__dirname, '..', 'functions', funcId);

        if (!fs.existsSync(funcPath)) {
            console.error(`   ! Function path not found: ${funcPath}`);
            continue;
        }

        // Install deps
        console.log('   Dependencies...');
        try {
            execSync('npm install', { cwd: funcPath, stdio: 'ignore' });
        } catch (e) {
            console.error('   ! Failed to install deps');
        }

        // Create Tarball
        console.log('   Packaging...');
        const tarPath = path.join(funcPath, 'code.tar.gz');
        try {
            // Check if tar exists
            if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);

            // Windows tar might need specific flags or just works. 
            // 'tar -czf code.tar.gz .' inside the directory.
            execSync('tar -czf code.tar.gz .', { cwd: funcPath });
        } catch (e) {
            console.error(`   ! Failed to create tarball: ${e.message}`);
            continue;
        }

        if (!fs.existsSync(tarPath)) {
            console.error('   ! Tarball not created.');
            continue;
        }

        // Deploy
        console.log('   Uploading...');
        try {
            const inputFile = InputFile.fromPath(tarPath, 'code.tar.gz');

            const deployment = await functions.createDeployment(
                funcId,
                inputFile, // code
                true, // activate
                'src/main.js' // entrypoint
            );

            console.log(`   ✅ Deployed! ID: ${deployment.$id}`);
            console.log(`      Status: ${deployment.status}`);

        } catch (e) {
            console.error(`   ✗ Deployment failed: ${e.message}`);
        }

        // Cleanup
        try {
            fs.unlinkSync(tarPath);
        } catch (e) { }
    }
}

main();
