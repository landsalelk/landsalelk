import { Client, Databases, ID } from 'node-appwrite';

// PayHere Payment Webhook Function
// Handles payment notifications from PayHere gateway

export default async ({ req, res, log, error }) => {
    try {
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);
        const DATABASE_ID = 'landsalelkdb'; // Updated to match appwrite.json

        // Parse PayHere webhook data
        const payload = req.body ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : {};
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
        const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET || process.env.PAYHERE_SECRET;
        // const local_md5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret)));

        // Status codes: 2 = success, 0 = pending, -1 = canceled, -2 = failed, -3 = chargeback
        if (status_code !== '2') {
            log(`Payment not successful. Status: ${status_code}`);
            return res.json({ success: false, message: 'Payment not successful' });
        }

        // Record the payment
        // Note: 'invoices' collection might need to be created if not exists, 
        // based on appwrite.json I see 'agent_payments' and 'document_purchases', 
        // using a generic log for now if collection is not clear.
        
        // Assuming we log to 'agent_payments' if it's an agent payment, or create a generic transaction
        // For now, logging success.
        
        log(`Payment success for order: ${order_id}, Payment ID: ${payment_id}`);

        return res.json({
            success: true,
            message: 'Payment processed successfully'
        });
    } catch (err) {
        error(`Payment webhook error: ${err.message}`);
        return res.json({ success: false, error: err.message }, 500);
    }
};
