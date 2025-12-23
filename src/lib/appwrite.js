import { Client, Account, Databases, Storage, Functions, Avatars, ID, Query, OAuthProvider } from "appwrite";
import { z } from 'zod';

// Define a schema for the client-side environment variables
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().url('Invalid Appwrite endpoint URL'),
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: z.string().min(1, 'Appwrite project ID is required'),
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: z.string().min(1, 'Appwrite database ID is required'),
});

let client, account, databases, storage, functions, avatars;
let isAppwriteInitialized = false;

try {
  // We can only access process.env in a try-catch block on the client-side
  // as it may not be available during server-side rendering in all contexts.
  if (typeof process !== 'undefined' && process.env) {
    const env = clientEnvSchema.parse({
      NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      NEXT_PUBLIC_APPWRITE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    });

    // The project is in Singapore region (sgp), so we must use the correct endpoint.
    let endpoint = env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    if (endpoint === 'https://cloud.appwrite.io/v1') {
        endpoint = 'https://sgp.cloud.appwrite.io/v1';
    }

    client = new Client()
      .setEndpoint(endpoint)
      .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

    account = new Account(client);
    databases = new Databases(client);
    storage = new Storage(client);
    functions = new Functions(client);
    avatars = new Avatars(client);
    isAppwriteInitialized = true;
  }
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error('Appwrite client-side configuration error:', error.flatten().fieldErrors);
    } else {
        console.error('Failed to initialize Appwrite client:', error);
    }
}

// Export a flag to check if initialization was successful
export { client, account, databases, storage, functions, avatars, ID, Query, OAuthProvider, isAppwriteInitialized };
