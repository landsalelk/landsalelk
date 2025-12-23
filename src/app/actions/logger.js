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
    // Use Singapore endpoint as default if not specified or if generic cloud endpoint
    let endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
    if (endpoint === 'https://cloud.appwrite.io/v1') {
        endpoint = 'https://sgp.cloud.appwrite.io/v1';
    }

    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!projectId) {
        return { success: false, error: 'Configuration missing: NEXT_PUBLIC_APPWRITE_PROJECT_ID' };
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId);

    if (apiKey) {
      client.setKey(apiKey);
    }
    // If no API Key, we proceed. The function execution might fail if restricted,
    // but we avoid console spam here.

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
