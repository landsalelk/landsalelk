const { Client, Functions, ID } = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const functions = new Functions(client);

const FUNCTION_ID = 'place-bid';
const SOURCE_DIR = path.join(__dirname, '../functions/place-bid');
const OUTPUT_ZIP = path.join(__dirname, 'place-bid.tar.gz');

async function zipDirectory(source, out) {
    const archive = archiver('tar', { gzip: true });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

async function deployFunction() {
    console.log(`📦 Zipping ${FUNCTION_ID}...`);
    try {
        await zipDirectory(SOURCE_DIR, OUTPUT_ZIP);
        console.log('✅ Zip created:', OUTPUT_ZIP);

        // Check if function exists, create if not
        try {
            await functions.get(FUNCTION_ID);
            console.log('ℹ️ Function exists.');
        } catch (e) {
            // Check for 404 (Not Found)
            if (e.code === 404) {
                console.log('ℹ️ Creating function...');
                await functions.create(
                    FUNCTION_ID,
                    'Place Bid', // name
                    'node-18.0'  // runtime
                );
                console.log('✅ Function created.');
            } else {
                console.error("Error getting function:", e.message);
                throw e;
            }
        }

        console.log('☁️ Uploading to Appwrite...');

        try {
            const deployment = await functions.createDeployment(
                FUNCTION_ID,
                InputFile.fromPath(OUTPUT_ZIP, 'place-bid.tar.gz'),
                true // Activate immediately
            );

            console.log(`🎉 Function Deployed! Deployment ID: ${deployment.$id}`);
            console.log(`✅ Status: ${deployment.status}`);
            console.log('ℹ️ Build is now processing on Appwrite Cloud.');
        } catch (uploadError) {
            console.error("Upload failed:", uploadError);
            throw uploadError;
        }

    } catch (err) {
        console.error('❌ Deployment Failed:', err.message);
    } finally {
        // Cleanup
        if (fs.existsSync(OUTPUT_ZIP)) {
            fs.unlinkSync(OUTPUT_ZIP);
        }
    }
}

deployFunction();
