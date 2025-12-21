
import { Client, Databases, Users, Query, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
    try {
        const body = JSON.parse(req.body || '{}');
        const { phone, code } = body;

        if (!phone || !code) {
            return res.json({ success: false, error: 'Phone and code are required' }, 400);
        }

        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);
        const users = new Users(client);
        const DATABASE_ID = 'main';
        const COLLECTION_ID = 'phone_verifications';

        // 1. Verify Code
        let formattedPhone = phone.replace(/\s+/g, '').replace(/-/g, '').replace('+', '');

        const verifications = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('phone', formattedPhone),
                Query.equal('code', code),
                Query.greaterThan('expires_at', new Date().toISOString()),
                Query.limit(1)
            ]
        );

        if (verifications.total === 0) {
            return res.json({ success: false, error: 'Invalid or expired code' }, 401);
        }

        const verificationDoc = verifications.documents[0];

        // 2. Delete used verification (prevent replay)
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, verificationDoc.$id);

        // 3. Find or Create User
        let userId = null;
        const userList = await users.list([Query.equal('phone', '+' + formattedPhone)]); // Appwrite phone format needs +

        if (userList.total > 0) {
            userId = userList.users[0].$id;
        } else {
            // Check without + if distinct? Appwrite stores E.164.
            // Let's create if not found.
            userId = ID.unique();
            try {
                // Email is optional (undefined), Phone is required, Password ignored? 
                // users.create(userId, email, phone, password, name)
                const newMember = await users.create(
                    userId,
                    undefined, // email 
                    '+' + formattedPhone, // phone
                    undefined, // password
                    undefined // name
                );
                userId = newMember.$id;
            } catch (createError) {
                // If conflict (maybe different format?), try to fetch again or fail.
                error(`User creation failed: ${createError.message}`);
                // fallback to search by phone without +?
                return res.json({ success: false, error: 'Registration failed' }, 500);
            }
        }

        // 4. Create Session Token
        const token = await users.createToken(userId);

        return res.json({
            success: true,
            userId: userId,
            secret: token.secret
        });

    } catch (err) {
        error(err.message);
        return res.json({ success: false, error: err.message }, 500);
    }
};
