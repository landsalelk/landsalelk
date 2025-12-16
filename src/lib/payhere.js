import crypto from 'crypto';

export function generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret) {
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const amountFormatted = parseFloat(amount).toFixed(2); // Ensure 2 decimal places
    const hashString = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;
    return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
}
