import { Client, Account, Databases, Storage, Functions, Avatars, ID, Query, OAuthProvider } from "appwrite";
import logger from "./logger";

// Validate environment variables
// Fix: Use Singapore endpoint if global one fails or as default if not specified
// The project is in Singapore region (sgp), so we must use the correct endpoint.
let endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';

// Override global endpoint to sgp if it's the generic one, because we know this project is in SGP.
// This fixes the "Project is not accessible in this region" error.
if (endpoint === 'https://cloud.appwrite.io/v1') {
    endpoint = 'https://sgp.cloud.appwrite.io/v1';
}

const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!projectId && typeof window !== 'undefined') {
    logger.warn('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set. Appwrite features may not work correctly.');
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId || 'landsalelkproject');

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
const avatars = new Avatars(client);

export { client, account, databases, storage, functions, avatars, ID, Query, OAuthProvider };
