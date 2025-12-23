import { Client, Databases, Query, ID } from 'node-appwrite';
import crypto from 'crypto';

// Environment Variables
const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'landsalelkdb';

const COLLECTIONS = {
    TRANSACTIONS: "transactions",
    ACCOUNTS: "user_wallets",
    LISTINGS: "listings",
    AGENTS: "agents",
    DIGITAL_PURCHASES: "digital_purchases",
    AGENT_PAYMENTS: "agent_payments",
};

/**
 * Verifies PayHere Signature
 */
function verifySignature(data, merchantSecret, merchantId) {
    if (!merchantId || !merchantSecret) return false;

    const {
        merchant_id,
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig
    } = data;

    if (merchant_id !== merchantId) return false;

    const secretHash = crypto.createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

    const signString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`;

    const calculatedSig = crypto.createHash('md5')
        .update(signString)
        .digest('hex')
        .toUpperCase();

    return calculatedSig === md5sig;
}

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);

    try {
        let body = req.body;
        // Handle payload parsing
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                // If parsing fails, it might be URL encoded or raw
                // For simplicity in this function, we expect JSON or pre-parsed object
                // If post-processing x-www-form-urlencoded is needed, we'd need 'querystring' module
            }
        }

        log(`Processing payment for Order: ${body.order_id}`);

        // 1. Verify Signature
        const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
        const MERCHANT_ID = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || process.env.PAYHERE_MERCHANT_ID;

        if (!verifySignature(body, MERCHANT_SECRET, MERCHANT_ID)) {
            error('Invalid PayHere Signature');
            return res.json({ success: false, message: 'Invalid signature' }, 400);
        }

        const {
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            custom_1, // usage: user_id
            custom_2, // usage: payment_type
        } = body;

        // Status code 2 is Success
        if (status_code !== "2") {
            log(`Payment ${payment_id} failed or cancelled. Status: ${status_code}`);
            return res.json({ success: true, message: 'Ignored non-success status' });
        }

        // 2. Idempotency Check
        // Check by payment_id in transactions
        const existingTrans = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TRANSACTIONS,
            [Query.search('description', payment_id), Query.limit(1)]
        );

        if (existingTrans.total > 0) {
            log(`Payment ${payment_id} already processed`);
            return res.json({ success: true, message: 'Already processed' });
        }

        const userId = custom_1 || "anonymous";
        const type = custom_2 || "payment";
        const amount = parseFloat(payhere_amount) || 0;

        // 3. Record Transaction
        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.TRANSACTIONS,
            ID.unique(),
            {
                user_id: userId,
                type: type,
                amount: amount,
                currency_code: payhere_currency,
                status: "completed",
                description: `PayHere ID: ${payment_id} | Order: ${order_id}`,
                created_at: new Date().toISOString(),
            }
        );

        // 4. Handle Logic based on Type
        if (type === "wallet_deposit") {
            const wallets = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.ACCOUNTS,
                [Query.equal("user_id", userId)]
            );

            if (wallets.total > 0) {
                const wallet = wallets.documents[0];
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.ACCOUNTS,
                    wallet.$id,
                    {
                        balance: wallet.balance + amount,
                        total_deposits: (wallet.total_deposits || 0) + amount,
                    }
                );
            } else {
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.ACCOUNTS,
                    ID.unique(),
                    {
                        user_id: userId,
                        balance: amount,
                        currency_code: payhere_currency,
                        total_deposits: amount,
                        is_active: true,
                    }
                );
            }
        }

        // 5. Handle Agent Hiring Payment
        if (order_id && order_id.startsWith("HIRE_")) {
            const parts = order_id.split("_");
            if (parts.length >= 2) {
                const listingId = parts[1];

                // Get listing
                const listing = await databases.getDocument(DATABASE_ID, COLLECTIONS.LISTINGS, listingId);
                const agentId = listing.agent_id;

                const platformFee = amount * 0.2; // 20%
                const agentShare = amount - platformFee;

                // Create agent_payment
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.AGENT_PAYMENTS,
                    ID.unique(),
                    {
                        agent_id: agentId || "unknown",
                        listing_id: listingId,
                        amount: amount,
                        platform_fee: platformFee,
                        agent_share: agentShare,
                        status: "completed",
                        payhere_order_id: order_id,
                        paid_at: new Date().toISOString(),
                    }
                );

                // Activate Listing
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.LISTINGS,
                    listingId,
                    {
                        status: 'active',
                        verification_code: null
                    }
                );

                // Update Agent Stats
                if (agentId) {
                    try {
                        const agent = await databases.getDocument(DATABASE_ID, COLLECTIONS.AGENTS, agentId);
                        await databases.updateDocument(
                            DATABASE_ID,
                            COLLECTIONS.AGENTS,
                            agentId,
                            {
                                total_earnings: (agent.total_earnings || 0) + agentShare,
                                listings_uploaded: (agent.listings_uploaded || 0) + 1
                            }
                        );
                    } catch (e) {
                        log(`Agent update failed: ${e.message}`);
                    }
                }
            }
        }

        return res.json({
            success: true,
            message: 'Payment processed successfully'
        });

    } catch (err) {
        error(`Error processing payment: ${err.message}`);
        return res.json({
            success: false,
            message: 'Failed to process payment',
            error: err.message
        }, 500);
    }
};
