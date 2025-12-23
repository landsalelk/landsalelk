'use server';

import { Client, Functions } from 'node-appwrite';

// Initialize Client once to reuse connections where possible in serverless environment
// Note: In Server Actions, module-level variables might be reused across invocations in the same container.
const client = new Client();

// Configure client with server-side environment variables
// Using process.env directly ensures we read from the server environment
const endpoint = process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (projectId && apiKey) {
    client
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setKey(apiKey);
}

const functions = new Functions(client);

/**
 * Server Action to log errors to GitHub via Appwrite Function
 *
 * @param {string} title - Title of the issue
 * @param {string} body - Body of the issue
 * @param {Array<string>} labels - Labels for the issue
 * @returns {Promise<{success: boolean, execution?: object, error?: string}>}
 */
export async function logErrorToGitHub(title, body, labels = ['bug', 'frontend']) {
    try {
        if (!projectId) {
            throw new Error('Configuration missing: APPWRITE_PROJECT_ID');
        }

        if (!apiKey) {
            throw new Error('Configuration missing: APPWRITE_API_KEY');
        }

        if (!title || !body) {
            throw new Error('Title and body are required');
        }

        const execution = await functions.createExecution(
            'github-logger',
            JSON.stringify({ title, body, labels }),
            false // Sync execution to get result
        );

        // Check for Appwrite execution status (failed vs completed)
        if (execution.status === 'failed') {
            return { success: false, error: `Function execution failed. Status: ${execution.status}` };
        }

        // Check for internal function error (if function returns JSON with success: false)
        try {
            const responseBody = JSON.parse(execution.responseBody);
            if (responseBody.success === false) {
                 return { success: false, error: responseBody.message || 'Function reported failure' };
            }
            return { success: true, execution: responseBody };
        } catch (parseError) {
            // Response might not be JSON if it crashed hard, or just raw text
            return { success: true, execution };
        }

    } catch (error) {
        return { success: false, error: error.message };
    }
}
