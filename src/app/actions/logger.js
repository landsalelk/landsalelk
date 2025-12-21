'use server';

import { Client, Functions } from 'node-appwrite';

/**
 * Server Action to log errors to GitHub via Appwrite Function
 *
 * @param {string} title - Title of the issue
 * @param {string} body - Body of the issue
 * @param {Array<string>} labels - Labels for the issue
 */
export async function logErrorToGitHub(title, body, labels = ['bug', 'frontend']) {
  try {
    // Appwrite configuration
    // Use Singapore endpoint as default for this project
    let endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
    if (endpoint === 'https://cloud.appwrite.io/v1') {
        endpoint = 'https://sgp.cloud.appwrite.io/v1';
    }
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    // We need API Key to execute function if it's restricted (recommended)
    // Or if execute permission is [], we MUST use API Key.
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!projectId) {
        console.error('Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID');
        return { success: false, error: 'Configuration missing' };
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId);

    if (apiKey) {
      client.setKey(apiKey);
    } else {
       console.warn("APPWRITE_API_KEY not found. Logging might fail if function execution is restricted.");
       // If no API key, we rely on the client being unauthenticated (if permission is "any")
       // or we fail if permission is "users" (and we are in server context without user session forwarding).
    }

    const functions = new Functions(client);

    // Call the 'github-logger' function
    // We use async=false (sync) to catch immediate errors during dev/monitoring
    // but in high load, async=true might be better. Keeping false for reliability now.
    const execution = await functions.createExecution(
      'github-logger',
      JSON.stringify({ title, body, labels }),
      false
    );

    if (execution.status === 'failed') {
        console.error('GitHub Logger Function failed:', execution.response);
        return { success: false, error: execution.response };
    }

    return { success: true, execution };
  } catch (error) {
    console.error('Failed to invoke GitHub Logger:', error);
    return { success: false, error: error.message };
  }
}
