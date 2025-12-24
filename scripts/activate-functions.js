
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runCommand(command) {
    try {
        const { stdout, stderr } = await execPromise(command);
        if (stderr && !stdout) {
            // Some warnings print to stderr but command succeeds
            // console.warn(`Stderr for ${command}:`, stderr);
        }
        return JSON.parse(stdout);
    } catch (error) {
        console.error(`Command failed: ${command}`, error.message);
        return null;
    }
}

async function runCommandNoJson(command) {
    try {
        const { stdout, stderr } = await execPromise(command);
        return stdout;
    } catch (error) {
        console.error(`Command failed: ${command}`, error.message);
        return null;
    }
}

async function activate() {
    console.log("Activating Functions...");
    console.log("----------------------------------------");

    // 1. List all functions
    const functionsData = await runCommand('npx appwrite functions list --json');

    if (!functionsData || !functionsData.functions) {
        console.error("Failed to fetch functions.");
        return;
    }

    for (const func of functionsData.functions) {
        const funcName = func.name;
        const funcId = func.$id;
        const currentDeploymentId = func.deployment;

        console.log(`Checking Function: ${funcName} (${funcId})`);

        // 2. Get function details again (or just use list data? list data might not have latestDeploymentId logic if it's not standard field)
        // Actually 'functions list' returns function objects which HAVE 'deployment' field (active).
        // But we need the LATEST deployment.

        // Let's list deployments for the function to find the latest
        const deploymentsData = await runCommand(`npx appwrite functions list-deployments --function-id ${funcId} --json`);

        if (deploymentsData && deploymentsData.deployments && deploymentsData.deployments.length > 0) {
            const latest = deploymentsData.deployments[0];
            const latestId = latest.$id;
            const latestStatus = latest.status;

            console.log(`  Latest Deployment: ${latestId} (${latestStatus})`);
            console.log(`  Current Active: ${currentDeploymentId}`);

            if (latestStatus === 'ready') {
                if (currentDeploymentId !== latestId) {
                    console.log(`  -> Activating ${latestId}...`);
                    // Command to activate
                    const cmd = `npx appwrite functions update-function-deployment --function-id ${funcId} --deployment-id ${latestId}`;
                    await runCommandNoJson(cmd);
                    console.log(`  -> Activated.`);
                } else {
                    console.log(`  -> Already active.`);
                }
            } else {
                console.log(`  -> Latest deployment not ready. Skipping.`);
            }

        } else {
            console.log("  No deployments found.");
        }
        console.log("----------------------------------------");
    }
}

activate();
