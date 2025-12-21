import { Client, Databases, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
    try {
        // Initialize Appwrite SDK
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);

        // Your function logic here
        // Example: Create a PayHere checkout hash

        return res.json({
            success: true,
            message: 'Checkout session created successfully'
        });
    } catch (err) {
        error(`Error creating checkout session: ${err.message}`);
        return res.json({
            success: false,
            message: 'Failed to create checkout session'
        }, 500);
    }
};
