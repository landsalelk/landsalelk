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
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// Fallback values for build time only - these should be overridden by env vars in production
const FALLBACK_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const FALLBACK_PROJECT_ID = "landsalelkproject";

// Determine if we're in a browser or server environment
const isBrowser = typeof window !== "undefined";
const isDev = process.env.NODE_ENV === "development";

// Log warnings in development if env vars are missing (browser only to avoid SSR spam)
if (isBrowser && isDev) {
  if (!endpoint) {
    console.warn(
      "[Appwrite] NEXT_PUBLIC_APPWRITE_ENDPOINT is not set. Using fallback.",
    );
  }
  if (!projectId) {
    console.warn(
      "[Appwrite] NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set. Using fallback.",
    );
  }
}

// Create client with environment variables or fallbacks
const client = new Client()
  .setEndpoint(endpoint || FALLBACK_ENDPOINT)
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
