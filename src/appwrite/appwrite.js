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

// Environment variables
let endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// Fallback values for build time only - these should be overridden by env vars in production
// Enforce Singapore Region Endpoint for this project
const FALLBACK_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const FALLBACK_PROJECT_ID = "landsalelkproject";

// Override global endpoint to sgp if it's the generic one (or missing)
if (!endpoint || endpoint === 'https://cloud.appwrite.io/v1') {
    endpoint = FALLBACK_ENDPOINT;
}

let client;
let account;
let databases;
let storage;
let functions;
let avatars;

try {
  // Create client with environment variables or fallbacks
  client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId || FALLBACK_PROJECT_ID);

  // Initialize Appwrite services
  account = new Account(client);
  databases = new Databases(client);
  storage = new Storage(client);
  functions = new Functions(client);
  avatars = new Avatars(client);
} catch (error) {
  // Critical error handling for initialization failure
  console.error("Appwrite Initialization Failed:", error);
  // Re-throw or handle as critical failure depending on app needs
  // For now, we allow the app to load but subsequent calls might fail or be undefined.
  // However, since exports are const bindings in ES modules, we can't change them later easily without 'let'.
  // We switched to 'let' above, but ES module exports need to be live bindings or we export the object.
  // With the current export structure (export { client... }), we need client to be defined.

  // Minimal fallback to prevent crash on import
  client = new Client();
  account = new Account(client);
  databases = new Databases(client);
  storage = new Storage(client);
  functions = new Functions(client);
  avatars = new Avatars(client);
}

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
