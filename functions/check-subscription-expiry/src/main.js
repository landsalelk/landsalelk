import { Client, Databases, Query, Functions } from 'node-appwrite';

/**
 * Check Subscription Expiry Function
 * 
 * Runs as a scheduled cron job (daily).
 * Checks agent_subscriptions for expired records and deactivates the associated agents.
 */

const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'landsalelkdb';
const COLLECTION_SUBSCRIPTIONS = 'agent_subscriptions';
const COLLECTION_AGENTS = 'agents';

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);
    const functions = new Functions(client);

    try {
        const now = new Date().toISOString();
        log(`Checking for expired subscriptions at ${now}`);

        // 1. Find all expired, still-active subscriptions
        const expiredSubs = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_SUBSCRIPTIONS,
            [
                Query.lessThan('expires_at', now),
                Query.equal('is_active', true),
                Query.limit(100)
            ]
        );

        log(`Found ${expiredSubs.documents.length} expired subscriptions`);

        let deactivatedCount = 0;
        let notifiedCount = 0;

        for (const sub of expiredSubs.documents) {
            try {
                // 2. Mark subscription as inactive
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTION_SUBSCRIPTIONS,
                    sub.$id,
                    { is_active: false }
                );

                // 3. Update agent status to inactive
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTION_AGENTS,
                    sub.agent_id,
                    { status: 'inactive' }
                );

                deactivatedCount++;

                // 4. Send notification email (via send-email function)
                try {
                    // Get agent details for email
                    const agent = await databases.getDocument(
                        DATABASE_ID,
                        COLLECTION_AGENTS,
                        sub.agent_id
                    );

                    if (agent.email) {
                        await functions.createExecution(
                            'send-email',
                            JSON.stringify({
                                type: 'generic',
                                email: agent.email,
                                subject: '⚠️ Subscription Expired - LandSale.lk',
                                body: `
Dear ${agent.name || 'Agent'},

Your LandSale.lk subscription has expired.

Package: ${sub.package || 'Standard'}
Expired On: ${new Date(sub.expires_at).toLocaleDateString('en-LK')}

Your agent profile is now inactive. To continue receiving leads and being visible to buyers, please renew your subscription.

Renew now: https://landsale.lk/agent/dashboard

Best regards,
LandSale.lk Team
                                `.trim()
                            }),
                            true // async
                        );
                        notifiedCount++;
                    }
                } catch (emailErr) {
                    log(`Failed to notify agent ${sub.agent_id}: ${emailErr.message}`);
                }

            } catch (updateErr) {
                error(`Failed to deactivate sub ${sub.$id}: ${updateErr.message}`);
            }
        }

        log(`Deactivated: ${deactivatedCount}, Notified: ${notifiedCount}`);

        return res.json({
            success: true,
            checked_at: now,
            expired_found: expiredSubs.documents.length,
            deactivated: deactivatedCount,
            notified: notifiedCount
        });

    } catch (e) {
        error(`Subscription Check Error: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
};
