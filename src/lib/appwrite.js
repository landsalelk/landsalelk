import { Client, Account, Databases, Storage, Functions, Avatars, ID, Query, OAuthProvider, Permission, Role } from "appwrite";
import { APPWRITE_ENDPOINT } from "@/appwrite/config";

/**
 * Core Appwrite Client & Services
 * @module Appwrite
 */

const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!projectId) {
    throw new Error("NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined in environment variables.");
}

// Initialize Client
export const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(projectId);

// Export Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const avatars = new Avatars(client);

// Export SDK Tools
export { ID, Query, OAuthProvider, Permission, Role };
