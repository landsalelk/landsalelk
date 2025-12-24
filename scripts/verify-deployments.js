
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runCommand(command) {
    try {
        const { stdout, stderr } = await execPromise(command);
        if (stderr && !stdout) {
            console.error(`Error executing ${command}:`, stderr);
            return null;
        }
        return JSON.parse(stdout);
    } catch (error) {
        console.error(`Command failed: ${command}`, error.message);
        return null;
    }
}

async function verify() {
    console.log("Checking Appwrite Function Deployments...");
    console.log("----------------------------------------");

    const functionsData = await runCommand('npx appwrite functions list --json');

    if (!functionsData || !functionsData.functions) {
        console.error("Failed to fetch functions.");
        return;
    }

    for (const func of functionsData.functions) {
        const funcName = func.name;
        const funcId = func.$id;
        const activeDeploymentId = func.deployment;

        process.stdout.write(`Function: ${funcName} (${funcId})`);

        const deploymentsData = await runCommand(`npx appwrite functions list-deployments --function-id ${funcId} --json`);

        if (deploymentsData && deploymentsData.deployments) {
            if (deploymentsData.deployments.length > 0) {
                const latest = deploymentsData.deployments[0];
                const latestId = latest.$id;
                const latestStatus = latest.status;
                const createdAt = latest.$createdAt;

                if (activeDeploymentId === latestId) {
                    console.log(` [OK]`);
                    console.log(`  - Active Deployment: ${activeDeploymentId}`);
                    console.log(`  - Created: ${createdAt}`);
                } else {
                    console.log(` [UPDATE AVAILABLE]`);
                    console.log(`  - Active: ${activeDeploymentId}`);
                    console.log(`  - Latest: ${latestId} (Status: ${latestStatus})`);

                    if (latestStatus === 'ready') {
                        console.log(`  - The latest deployment is READY but not active.`);
                    } else if (latestStatus === 'building') {
                        console.log(`  - The latest deployment is still BUILDING.`);
                    } else if (latestStatus === 'failed') {
                        console.log(`  - The latest deployment FAILED.`);
                    }
                }
            } else {
                console.log(` [NO DEPLOYMENTS]`);
            }
        } else {
            console.log(` [ERROR FETCHING DEPLOYMENTS]`);
        }
        console.log("");
    }
}

verify();
