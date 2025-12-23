const { exec } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const deployCommand = 'appwrite push site --site-id 6941d9280032a28b0536 --force';

const deploy = () => {
    console.log('Starting Appwrite deployment...');
    const child = exec(deployCommand, { cwd: projectRoot }, (error, stdout, stderr) => {
        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.error(stderr);
        }
        if (error) {
            console.error(`Deployment failed with error: ${error.message}`);
            process.exit(1);
        }
        console.log('Deployment completed successfully!');
    });
};

deploy();
