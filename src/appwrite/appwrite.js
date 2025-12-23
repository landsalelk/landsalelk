import {
  Client,
  Account,
  Databases,
  Storage,
  Functions,
  Avatars,
  ID,
  Query,
  Permission,
  Role,
} from "appwrite";

/**
 * Appwrite Client Configuration
 *
 * This file initializes the Appwrite client for use throughout the application.
 * It prioritizes environment variables, falling back to defaults strictly for local
 * development or build-time where env vars might not be present.
 */

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

const FALLBACK_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const FALLBACK_PROJECT_ID = "landsalelkproject";

/**
 * Configuration Resolution
 * Prioritizes environment variables, falling back to defaults.
 * Production builds should fail if critical env vars are missing.
 */
let effectiveEndpoint = endpoint || FALLBACK_ENDPOINT;
const effectiveProjectId = projectId || FALLBACK_PROJECT_ID;

// Final validation to prevent client initialization with empty strings
if (!effectiveEndpoint || !effectiveProjectId) {
    throw new Error("Appwrite Configuration Error: Missing Endpoint or Project ID. Check your .env file or deployment variables.");
}

// Override global endpoint to sgp if it's the generic one, as this project is hosted in Singapore.
if (effectiveEndpoint === 'https://cloud.appwrite.io/v1') {
    effectiveEndpoint = 'https://sgp.cloud.appwrite.io/v1';
}

// Create client with the resolved configuration
const client = new Client()
  .setEndpoint(effectiveEndpoint)
  .setProject(effectiveProjectId);

// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
const avatars = new Avatars(client);

// Export all services and utilities
export {
  client,
  account,
  databases,
  storage,
  functions,
  avatars,
  ID,
  Query,
  Permission,
  Role,
};
