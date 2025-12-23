import { Client, Account, Databases, Storage, Functions, Avatars, ID, Query, Permission, Role } from 'node-appwrite';
import { z } from 'zod';

// Zod schema for environment variables
const envSchema = z.object({
  APPWRITE_ENDPOINT: z.string().url(),
  APPWRITE_PROJECT_ID: z.string().min(1),
  APPWRITE_API_KEY: z.string().min(1),
  APPWRITE_DATABASE_ID: z.string().min(1),
});

let client, account, databases, storage, functions, avatars;

try {
  const env = envSchema.parse(process.env);

  client = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);

  account = new Account(client);
  databases = new Databases(client);
  storage = new Storage(client);
  functions = new Functions(client);
  avatars = new Avatars(client);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Missing or invalid Appwrite environment variables:', error.errors);
  } else {
    console.error('Failed to initialize Appwrite server client:', error);
  }
}

export { client, account, databases, storage, functions, avatars, ID, Query, Permission, Role };
