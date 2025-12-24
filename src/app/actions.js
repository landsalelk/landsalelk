'use server';

import { generatePayHereHash } from '@/lib/payhere';

export async function getPayHereSignature({ amount, orderId, currency = 'LKR' }) {
    try {
        const hash = generatePayHereHash(orderId, amount, currency);

        return {
            hash,
            merchantId: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID,
            success: true
        };
    } catch (error) {
        console.error("PayHere Hash Error:", error);
        return { success: false, error: error.message };
    }
}
