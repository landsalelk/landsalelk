import { Client, Account, Databases, Storage, Functions, Avatars, ID, Query, OAuthProvider, Permission, Role } from "appwrite";

/**
 * Appwrite Client Configuration
 * Initializes the Appwrite client and exports services.
 * Enforces strict environment variable validation to prevent runtime failures.
 */

// Validate environment variables
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!projectId) {
    throw new Error("NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined in environment variables.");
}

// Initialize Client
export const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

// Export Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const avatars = new Avatars(client);

// Export SDK Tools
export { ID, Query, OAuthProvider, Permission, Role };
