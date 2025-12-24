'use server'

import { Client, Functions } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // Ensure you have a server-side API Key

const functions = new Functions(client);

export async function logErrorToGitHub(errorMessage, errorStack, path) {
    try {
        const execution = await functions.createExecution(
            'github-logger', // The Function ID from appwrite.json
            JSON.stringify({
                errorMessage,
                errorStack,
                path
            })
        );
        
        if (execution.status === 'completed') {
            return { success: true };
        } else {
            console.error('Logging function failed:', execution.responseBody);
            return { success: false };
        }
    } catch (e) {
        console.error('Failed to execute logging function:', e);
        return { success: false };
    }
}
