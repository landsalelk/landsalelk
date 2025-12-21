// PayHere Payment Webhook Function
// Handles payment notifications from PayHere gateway

export default async ({ req, res, log, error }) => {
    try {
        const { Client, Databases, ID } = await import('node-appwrite');

        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);
        const DATABASE_ID = 'main';

        // Parse PayHere webhook data
        const payload = JSON.parse(req.body || '{}');
        const {
            merchant_id,
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig,
            custom_1, // user_id
            custom_2  // property_id or service type
        } = payload;

        log(`Received payment webhook for order: ${order_id}`);

        // Verify MD5 signature (in production)
        const merchant_secret = process.env.PAYHERE_SECRET;
        // const local_md5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret)));

        // Status codes: 2 = success, 0 = pending, -1 = canceled, -2 = failed, -3 = chargeback
        if (status_code !== '2') {
            log(`Payment not successful. Status: ${status_code}`);
            return res.json({ success: false, message: 'Payment not successful' });
        }

        // Record the payment
        const invoice = await databases.createDocument(
            DATABASE_ID,
            'invoices',
            ID.unique(),
            {
                user_id: custom_1,
                property_id: custom_2,
                amount: parseFloat(payhere_amount),
                currency: payhere_currency,
                payment_method: 'payhere',
                transaction_id: payment_id,
                status: 'paid'
            }
        );

        log(`Invoice created: ${invoice.$id}`);

        // If this is a listing payment, update property status
        if (custom_2) {
            try {
                await databases.updateDocument(
                    DATABASE_ID,
                    'properties',
                    custom_2,
                    { status: 'published' }
                );
                log(`Property ${custom_2} published after payment`);
            } catch (err) {
                error(`Failed to update property: ${err.message}`);
            }
        }

        // Add credits to user wallet if applicable
        if (custom_1) {
            try {
                const user = await databases.getDocument(DATABASE_ID, 'users', custom_1);
                await databases.updateDocument(
                    DATABASE_ID,
                    'users',
                    custom_1,
                    { credits: (user.credits || 0) + Math.floor(parseFloat(payhere_amount) / 10) }
                );
            } catch (err) {
                log(`Credits update skipped: ${err.message}`);
            }
        }

        return res.json({
            success: true,
            message: 'Payment processed successfully',
            invoice_id: invoice.$id
        });
    } catch (err) {
        error(`Payment webhook error: ${err.message}`);
        return res.json({ success: false, error: err.message }, 500);
    }
};
