
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

/**
 * Verifies the PayHere notification signature.
 * md5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchant_secret))
 * 
 * @param {Object} data - The POST data from PayHere
 * @returns {boolean} True if signature is valid
 */
export function verifyPayHereSignature(data) {
    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret) return false;

    const {
        merchant_id,
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig
    } = data;

    // Verify merchant ID matches
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
