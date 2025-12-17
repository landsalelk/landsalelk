import { Client, Databases, Users, Messaging, Query, ID } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const users = new Users(client);
const messaging = new Messaging(client);

const DATABASE_ID = process.env.DATABASE_ID;
const COLLECTIONS = {
    SAVED_SEARCHES: 'saved_searches',
    LISTINGS: 'listings'
};

/**
 * Saved Search Alerts Function
 * Runs daily to notify users about new properties matching their saved searches
 */
export default async function main({ req, res, log, error }) {
    log('Starting saved search alerts job...');

    try {
        // Get all saved searches with notifications enabled
        const savedSearches = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.SAVED_SEARCHES,
            [
                Query.equal('notifications_enabled', true),
                Query.limit(100)
            ]
        );

        log(`Found ${savedSearches.documents.length} saved searches with notifications`);

        for (const search of savedSearches.documents) {
            try {
                await processSearch(search, log, error);
            } catch (e) {
                error(`Error processing search ${search.$id}: ${e.message}`);
            }
        }

        return res.json({
            success: true,
            processed: savedSearches.documents.length,
            timestamp: new Date().toISOString()
        });

    } catch (e) {
        error(`Fatal error: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
}

async function processSearch(search, log, error) {
    const { user_id, search_params, last_notified_at, frequency } = search;

    // Check if it's time to notify based on frequency
    if (!shouldNotify(frequency, last_notified_at)) {
        return;
    }

    // Build query from saved search params
    const queries = buildQueryFromParams(JSON.parse(search_params), last_notified_at);

    // Find new matching properties
    const matches = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.LISTINGS,
        queries
    );

    if (matches.documents.length === 0) {
        log(`No new matches for search ${search.$id}`);
        return;
    }

    log(`Found ${matches.documents.length} new matches for search ${search.$id}`);

    // Get user details
    const user = await users.get(user_id);

    if (!user.email) {
        error(`User ${user_id} has no email`);
        return;
    }

    // Send notification email
    const subject = `${matches.documents.length} new properties match your saved search!`;
    const content = buildEmailContent(search.name, matches.documents);

    await messaging.createEmail(
        ID.unique(),
        subject,
        content,
        [],      // topics
        [user_id] // targets
    );

    // Update last notified timestamp
    await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SAVED_SEARCHES,
        search.$id,
        { last_notified_at: new Date().toISOString() }
    );

    log(`Notified user ${user_id} about ${matches.documents.length} properties`);
}

function shouldNotify(frequency, lastNotified) {
    if (!lastNotified) return true;

    const lastTime = new Date(lastNotified);
    const now = new Date();
    const hoursSince = (now - lastTime) / (1000 * 60 * 60);

    switch (frequency) {
        case 'instant':
            return true;
        case 'daily':
            return hoursSince >= 24;
        case 'weekly':
            return hoursSince >= 168;
        default:
            return hoursSince >= 24;
    }
}

function buildQueryFromParams(params, since) {
    const queries = [
        Query.equal('status', 'active'),
        Query.orderDesc('$createdAt'),
        Query.limit(10)
    ];

    // Only get properties created after last notification
    if (since) {
        queries.push(Query.greaterThan('$createdAt', since));
    }

    if (params.province) {
        queries.push(Query.equal('district', params.province));
    }
    if (params.city) {
        queries.push(Query.equal('city', params.city));
    }
    if (params.type && params.type !== 'all') {
        queries.push(Query.equal('type', params.type));
    }
    if (params.minPrice) {
        queries.push(Query.greaterThanEqual('price', parseInt(params.minPrice)));
    }
    if (params.maxPrice) {
        queries.push(Query.lessThanEqual('price', parseInt(params.maxPrice)));
    }

    return queries;
}

function buildEmailContent(searchName, properties) {
    const propertyList = properties.map(p => `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
            <h3 style="margin: 0 0 8px 0; color: #10b981;">${p.title}</h3>
            <p style="margin: 0; color: #6b7280;">${p.city}, ${p.district}</p>
            <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: bold;">LKR ${p.price.toLocaleString()}</p>
            <a href="https://landsale.lk/properties/${p.$id}" 
               style="display: inline-block; margin-top: 12px; padding: 8px 16px; background: #10b981; color: white; text-decoration: none; border-radius: 6px;">
                View Property
            </a>
        </div>
    `).join('');

    return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0;">🏡 New Properties Found!</h1>
            </div>
            <div style="padding: 24px;">
                <p style="color: #374151; font-size: 16px;">
                    Great news! We found <strong>${properties.length} new properties</strong> matching your saved search 
                    "<strong>${searchName}</strong>".
                </p>
                
                ${propertyList}
                
                <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <a href="https://landsale.lk/dashboard/saved-searches" 
                       style="color: #10b981; text-decoration: none;">
                        Manage your saved searches
                    </a>
                </div>
            </div>
            <div style="background: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} LandSale.lk - Sri Lanka's Premier Property Platform
            </div>
        </div>
    `;
}
