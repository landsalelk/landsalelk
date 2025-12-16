'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Script from 'next/script';

export default function PayHereButton({ amount, orderId, items, customer, onSuccess, onDismiss }) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Get Hash
            const res = await fetch('/api/payhere/hash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    amount: amount,
                    currency: 'LKR'
                })
            });
            const { hash } = await res.json();

            // 2. Configure PayHere
            const payment = {
                "sandbox": true,
                "merchant_id": process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID,
                "return_url": "http://localhost:3000/profile", // Testing URL
                "cancel_url": "http://localhost:3000/profile",
                "notify_url": "http://localhost:3000/api/payhere/notify", // Needs public URL for real test
                "order_id": orderId,
                "items": items,
                "amount": amount.toFixed(2),
                "currency": "LKR",
                "hash": hash,
                "first_name": customer.first_name,
                "last_name": customer.last_name,
                "email": customer.email,
                "phone": customer.phone,
                "address": "Colombo, Sri Lanka",
                "city": "Colombo",
                "country": "Sri Lanka",
            };

            // 3. Open PayHere
            if (window.payhere) {
                window.payhere.onCompleted = function onCompleted(orderId) {
                    console.log("Payment completed. OrderID:" + orderId);
                    if (onSuccess) onSuccess(orderId);
                    setLoading(false);
                };

                window.payhere.onDismissed = function onDismissed() {
                    console.log("Payment dismissed");
                    if (onDismiss) onDismiss();
                    setLoading(false);
                };

                window.payhere.onError = function onError(error) {
                    console.log("Error:" + error);
                    setLoading(false);
                };

                window.payhere.startPayment(payment);
            } else {
                console.error("PayHere SDK not loaded");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <>
            <Script src="https://www.payhere.lk/lib/payhere.js" strategy="lazyOnload" />
            <button
                onClick={handlePayment}
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Pay via PayHere"}
            </button>
        </>
    );
}
