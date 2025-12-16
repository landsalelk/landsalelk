
import crypto from 'crypto';

/**
 * Generates the PayHere hash for payment security.
 * Hash = md5(merchant_id + order_id + amount + currency + md5(merchant_secret))
 * 
 * @param {string} orderId 
 * @param {number} amount 
 * @param {string} currency 
 * @returns {string} The generated hash
 */
export function generatePayHereHash(orderId, amount, currency = 'LKR') {
    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret) {
        throw new Error("PayHere credentials not configured in environment variables.");
    }

    // Amount formatting: 2 decimal places (e.g., 1000.00)
    const formattedAmount = Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).replace(/,/g, '');

    const secretHash = crypto.createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

    const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${secretHash}`;

    return crypto.createHash('md5')
        .update(hashString)
        .digest('hex')
        .toUpperCase();
}
