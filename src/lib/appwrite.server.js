import { Client, Account, Databases, Users } from 'node-appwrite';

/**
 * createAdminClient - Initializes a server-side Appwrite client with an API Key.
 *
 * THIS MUST ONLY BE USED IN SERVER ACTIONS OR API ROUTES.
 * NEVER EXPOSE THE API KEY TO THE CLIENT.
 */
export async function createAdminClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject')
        .setKey(process.env.APPWRITE_API_KEY);

    return {
        get account() {
            return new Account(client);
        },
        get databases() {
            return new Databases(client);
        },
        get users() {
            return new Users(client);
        }
    };
}

/**
 * createSessionClient - Initializes a server-side Appwrite client using a user's session.
 *
 * @param {string} session - The session string (cookie value)
 */
export async function createSessionClient(session) {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject');

    if (session) {
        client.setSession(session);
    }

    return {
        get account() {
            return new Account(client);
        },
        get databases() {
            return new Databases(client);
        }
    };
}
