'use server';

import { Client, Functions } from 'node-appwrite';

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
    // Appwrite configuration
    // Using server-side environment variables directly
    const endpoint = process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
    const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!projectId) {
        throw new Error('Configuration missing: APPWRITE_PROJECT_ID');
    }

    if (!apiKey) {
        throw new Error('Configuration missing: APPWRITE_API_KEY');
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const functions = new Functions(client);

    const execution = await functions.createExecution(
      'github-logger',
      JSON.stringify({ title, body, labels }),
      false
    );

    if (execution.status === 'failed') {
        return { success: false, error: `Function execution failed: ${execution.response}` };
    }

    return { success: true, execution };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
