import { Client, Account, Databases, Storage, Functions, Avatars, ID, Query, OAuthProvider } from "appwrite";

// Environment Variable Validation
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint) {
  throw new Error('Missing NEXT_PUBLIC_APPWRITE_ENDPOINT. Please check your .env.local file.');
}

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID. Please check your .env.local file.');
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
const avatars = new Avatars(client);

export { client, account, databases, storage, functions, avatars, ID, Query, OAuthProvider };
