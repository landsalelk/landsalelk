import { Client, Account, Databases, Storage, Functions, Avatars, ID, Query, OAuthProvider } from "appwrite";
import { APPWRITE_ENDPOINT } from "@/appwrite/config";

const endpoint = APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!projectId && typeof window !== 'undefined') {
    console.warn('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set. Appwrite features may not work correctly.');
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId || '');

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
const avatars = new Avatars(client);

export { client, account, databases, storage, functions, avatars, ID, Query, OAuthProvider };
