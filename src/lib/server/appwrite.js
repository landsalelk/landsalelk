import { Client, Databases, Functions, Storage, Users } from 'node-appwrite';
import { APPWRITE_ENDPOINT } from '@/appwrite/config';

let client;
let databases;
let functions;
let storage;
let users;

if (process.env.APPWRITE_API_KEY) {
  client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  databases = new Databases(client);
  functions = new Functions(client);
  storage = new Storage(client);
  users = new Users(client);
} else {
  console.warn("Appwrite Admin API Key is not set. Server-side Appwrite functionality will be disabled.");
  // Set to null so that any attempt to use them will fail loudly.
  databases = null;
  functions = null;
  storage = null;
  users = null;
}

export { client, databases, functions, storage, users };
