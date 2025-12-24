
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const VARS = {
    "DATABASE_ID": "landsalelkdb",
    "PAYHERE_MERCHANT_ID": "241842",
    "PAYHERE_MERCHANT_SECRET": "Mzg0Mzk5OTI3MjMwMjk2ODM3ODMyMTkwMzU3NDM4MzY1MzkwMDM1OA=="
};

const FUNCTION_MAP = {
    "generate-agent-id": ["DATABASE_ID"],
    "generate-pdf": ["DATABASE_ID"],
    "send-otp-sms": ["DATABASE_ID"],
    "verify-otp": ["DATABASE_ID"],
    "send-email": ["DATABASE_ID"],
    "create-checkout-session": ["DATABASE_ID"],
    "webhook-handler": ["DATABASE_ID", "PAYHERE_MERCHANT_ID", "PAYHERE_MERCHANT_SECRET"],
    "process-payment": ["DATABASE_ID", "PAYHERE_MERCHANT_ID", "PAYHERE_MERCHANT_SECRET"],
    "send-notification": ["DATABASE_ID"],
    "send-reminder-sms": ["DATABASE_ID"],
    "send-sms": ["DATABASE_ID"],
    "place-bid": ["DATABASE_ID"]
};

// Map function name to ID if needed, or query list.
// We'll query list first.

async function runCommand(command) {
    try {
        const { stdout } = await execPromise(command);
        return JSON.parse(stdout);
    } catch (e) {
        console.error(`Cmd failed: ${command}`, e.message);
        return null;
    }
}

async function runCommandNoJson(command) {
    try {
        await execPromise(command);
        return true;
    } catch (e) {
        console.error(`Cmd failed: ${command}`, e.message);
        return false;
    }
}

async function main() {
    console.log("Fetching functions list...");
    const functionsData = await runCommand('npx appwrite functions list --json');
    if (!functionsData) return;

    for (const func of functionsData.functions) {
        const name = func.name;
        const id = func.$id;

        // Match by name or partial name roughly or just iterate our map keys
        // Our map keys are roughly the filenames/names. 
        // Appwrite names seen: "Process Payment", "Send SMS", etc.
        // I need to map my keys to Appwrite names or IDs.
        // A simple normalization might work: "Process Payment" -> "process-payment"

        // Let's use the 'name' property from appwrite.json as key if possible, 
        // OR rely on the ID if we know it? No, IDs vary.
        // Let's rely on name matching.

        let mapKey = null;
        // Try exact match with keys in FUNCTION_MAP
        // FUNCTION_MAP keys are based on 'path' basenames usually.
        // Appwrite names are human readable.

        // Let's check `func.name`
        // "Process Payment"

        // Let's try to find a mapping.
        // func.name "Process Payment" -> map key "process-payment"?
        // func.name "webhook-handler" (from file) -> actual name "Webhook Handler"

        const normalized = func.name.toLowerCase().replace(/ /g, '-');
        // "process-payment"

        let requiredVars = FUNCTION_MAP[normalized];
        if (!requiredVars) {
            // Try checking if key exists in map directly?
            // "generate-pdf" might be "generate-pdf" in name too if not capitalized.
            if (FUNCTION_MAP[func.name]) requiredVars = FUNCTION_MAP[func.name];
        }

        if (requiredVars) {
            console.log(`Checking ${func.name} (${id})...`);

            // Get current vars
            const varsData = await runCommand(`npx appwrite functions list-variables --function-id ${id} --json`);
            const currentVarKeys = varsData ? varsData.variables.map(v => v.key) : [];

            for (const key of requiredVars) {
                if (!currentVarKeys.includes(key)) {
                    console.log(`  + Adding ${key}...`);
                    const val = VARS[key];
                    await runCommandNoJson(`npx appwrite functions create-variable --function-id ${id} --key ${key} --value "${val}"`);
                } else {
                    console.log(`  ✓ ${key} exists.`);
                }
            }
        } else {
            console.log(`Skipping ${func.name} (${normalized}) - no map entry.`);
        }
        console.log("---");
    }
}

main();
