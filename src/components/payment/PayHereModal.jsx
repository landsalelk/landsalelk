'use client';

import { useState } from 'react';
import Script from 'next/script';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { getPayHereSignature } from '@/app/actions';

/**
 * PayHere Modal Component
 * Triggers the PayHere payment gateway.
 * 
 * Config:
 * Ensure NEXT_PUBLIC_PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET are set.
 */
export default function PayHereModal({
    amount,
    items,
    orderId,
    customerInfo = {},
    onCompleted
}) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (loading) return;
        setLoading(true);

        try {
            // 1. Get Signature from Server
            const { hash, merchantId, success, error } = await getPayHereSignature({
                amount,
                orderId,
                currency: 'LKR'
            });

            if (!success || !merchantId) {
                throw new Error(error || 'Payment configuration missing (Merchant ID/Secret).');
            }

            // 2. Prepare PayHere Payment Object
            const payment = {
                sandbox: process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true', // Controlled by env var
                merchant_id: merchantId,
                return_url: window.location.origin + '/dashboard', // Fallback
                cancel_url: window.location.origin + '/dashboard',
                notify_url: window.location.origin + '/api/payhere/notify', // Needs API route
                order_id: orderId,
                items: items,
                amount: amount.toFixed(2),
                currency: 'LKR',
                hash: hash,
                first_name: customerInfo.first_name || 'Guest',
                last_name: customerInfo.last_name || 'User',
                email: customerInfo.email || 'user@example.com',
                phone: customerInfo.phone || '0777123456',
                address: 'No.1, Galle Road',
                city: 'Colombo',
                country: 'Sri Lanka'
            };

            // 3. Open PayHere Modal
            if (window.payhere) {
                window.payhere.startPayment(payment);

                // Bind callbacks
                window.payhere.onCompleted = function (orderId) {
                    // Payment completed successfully
                    toast.success("Payment Successful!");
                    setLoading(false);
                    if (onCompleted) onCompleted(orderId);
                };

                window.payhere.onDismissed = function () {
                    // Payment dismissed by user
                    setLoading(false);
                };

                window.payhere.onError = function (error) {
                    // Payment error occurred
                    toast.error("Payment Error: " + error);
                    setLoading(false);
                };
            } else {
                throw new Error("PayHere SDK not loaded.");
            }

        } catch (err) {
            // console.error(err);
            toast.error(err.message || "Failed to start payment");
            setLoading(false);
        }
    };

    return (
        <>
            <Script src="https://www.payhere.lk/lib/payhere.js" />

            <button
                onClick={handlePayment}
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                Pay LKR {amount.toLocaleString()}
            </button>
        </>
    );
}
