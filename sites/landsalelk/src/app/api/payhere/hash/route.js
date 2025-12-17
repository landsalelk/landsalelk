import { NextResponse } from 'next/server';
import { generatePayHereHash } from '@/lib/payhere';

export async function POST(request) {
    try {
        const body = await request.json();
        const { order_id, amount, currency } = body;

        const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        if (!merchantId || !merchantSecret) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const hash = generatePayHereHash(merchantId, order_id, amount, currency, merchantSecret);

        return NextResponse.json({ hash });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
