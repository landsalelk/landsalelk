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
    // Use flexible check to catch http/https or trailing slashes
    if (userDefined && !userDefined.includes('cloud.appwrite.io/v1')) {
        return userDefined;
    }

    // Otherwise, enforce Singapore Region
    return FALLBACK_ENDPOINT;
};

// Singleton storage
let _client;
let _account;
let _databases;
let _storage;
let _functions;
let _avatars;

/**
 * Initialize and return Appwrite services.
 * This function handles initialization safety.
 */
function getAppwriteServices() {
    if (_client) {
        return {
            client: _client,
            account: _account,
            databases: _databases,
            storage: _storage,
            functions: _functions,
            avatars: _avatars
        };
    }

    try {
        const endpoint = getAppwriteEndpoint();
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || FALLBACK_PROJECT_ID;

        // Validation: Fail fast if configuration is critically missing
        if (!endpoint) throw new Error("Appwrite Endpoint is missing");
        if (!projectId) throw new Error("Appwrite Project ID is missing");

        // Initialize Client
        _client = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId);

        _account = new Account(_client);
        _databases = new Databases(_client);
        _storage = new Storage(_client);
        _functions = new Functions(_client);
        _avatars = new Avatars(_client);

        return {
            client: _client,
            account: _account,
            databases: _databases,
            storage: _storage,
            functions: _functions,
            avatars: _avatars
        };
    } catch (error) {
        // Log descriptive error and re-throw to crash fast during build/startup
        // Note: Using console.error here is necessary for critical startup failures
        // eslint-disable-next-line no-console
        console.error("Appwrite Initialization Failed:", error.message);
        throw error;
    }
}

// Perform initialization immediately for backward compatibility with existing imports.
// This preserves the "fail fast" behavior for build time but centralizes logic in the factory.
const services = getAppwriteServices();
const client = services.client;
const account = services.account;
const databases = services.databases;
const storage = services.storage;
const functions = services.functions;
const avatars = services.avatars;

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
  getAppwriteServices, // Export factory for future use
};
