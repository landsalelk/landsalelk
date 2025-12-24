import { Client, Account, Databases, Storage, Functions, Avatars, ID, Query, OAuthProvider } from "appwrite";

// Environment Variable Validation - Non-blocking for cold start optimization
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject';

// Warn but don't throw - prevents cold start crashes
if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  console.warn('[Appwrite] NEXT_PUBLIC_APPWRITE_ENDPOINT not set, using default');
}

if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  console.warn('[Appwrite] NEXT_PUBLIC_APPWRITE_PROJECT_ID not set, using default');
}

// Lazy client initialization
let _client = null;

function getClient() {
  if (!_client) {
    _client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId);
  }
  return _client;
}

// Lazy service initialization
const client = getClient();
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
const avatars = new Avatars(client);

export { client, account, databases, storage, functions, avatars, ID, Query, OAuthProvider };
