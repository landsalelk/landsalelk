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
 * Environment variables are required for production, but fallbacks are provided
 * for build time (SSR/SSG) to prevent build failures.
 */

const FALLBACK_PROJECT_ID = "landsalelkproject";
const FALLBACK_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";

/**
 * Determines the correct Appwrite endpoint.
 * Enforces Singapore Region (sgp) if the generic endpoint is detected or environment variable is missing.
 * This is critical to prevent "Project not accessible in this region" errors.
 *
 * @returns {string} The resolved Appwrite API Endpoint
 */
const getAppwriteEndpoint = () => {
    const userDefined = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;

    // If user provided a specific endpoint that isn't the generic cloud one, use it.
    // This allows for localhost or self-hosted instances.
    if (userDefined && userDefined !== 'https://cloud.appwrite.io/v1') {
        return userDefined;
    }

    // Otherwise, enforce Singapore Region
    return FALLBACK_ENDPOINT;
};

const endpoint = getAppwriteEndpoint();
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || FALLBACK_PROJECT_ID;

// Create client with resolved configuration
// We allow this to throw if invalid configuration is provided (fail fast)
const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

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
