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

import { APPWRITE_ENDPOINT } from "./config";

// Environment variables
const endpoint = APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// Fallback values for build time only - these should be overridden by env vars in production
// Enforcing Singapore region endpoint for this project as per requirements
const FALLBACK_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const FALLBACK_PROJECT_ID = "landsalelkproject";

// Unused browser/dev checks were removed for code cleanliness.

// Logic to ensure we use the correct endpoint
let effectiveEndpoint = endpoint || FALLBACK_ENDPOINT;

// Override global endpoint to sgp if it's the generic one, because we know this project is in SGP.
if (effectiveEndpoint === 'https://cloud.appwrite.io/v1') {
    effectiveEndpoint = 'https://sgp.cloud.appwrite.io/v1';
}

// Create client with environment variables or fallbacks
const client = new Client()
  .setEndpoint(effectiveEndpoint)
  .setProject(projectId || FALLBACK_PROJECT_ID);

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
