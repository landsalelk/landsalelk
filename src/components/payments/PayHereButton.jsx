'use client';

import { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import Script from 'next/script';
import { toast } from 'sonner';

export function PayHereButton({ amount, orderId, items, customer, onSuccess, onDismiss }) {
    const [loading, setLoading] = useState(false);
    const [sdkLoaded, setSdkLoaded] = useState(false);

    const handlePayment = async () => {
        // Validate required fields
        if (!sdkLoaded) {
            toast.error("Payment system loading... Please try again.");
            return;
        }

        if (!process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID) {
            toast.error("Payment not configured. Please contact support.");
            console.error("Missing NEXT_PUBLIC_PAYHERE_MERCHANT_ID");
            return;
        }

        setLoading(true);
        try {
            // 1. Get Hash from API
            const res = await fetch('/api/payhere/hash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    amount: amount,
                    currency: 'LKR'
                })
            });

            if (!res.ok) {
                throw new Error('Failed to generate payment hash');
            }

            const data = await res.json();
            const hash = data.hash;

            if (!hash) {
                throw new Error('Invalid hash response');
            }

            // 2. Configure PayHere with fallbacks for missing data
            const payment = {
                sandbox: true,
                merchant_id: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID,
                return_url: window.location.origin + "/profile",
                cancel_url: window.location.origin + "/profile",
                notify_url: window.location.origin + "/api/payhere/notify",
                order_id: orderId || `ORDER-${Date.now()}`,
                items: items || "Premium Subscription",
                amount: (amount || 0).toFixed(2),
                currency: "LKR",
                hash: hash,
                first_name: customer?.first_name || "Customer",
                last_name: customer?.last_name || "User",
                email: customer?.email || "customer@example.com",
                phone: customer?.phone || "0771234567",
                address: "Colombo, Sri Lanka",
                city: "Colombo",
                country: "Sri Lanka",
            };

            // Validate all required fields have values
            const requiredFields = ['merchant_id', 'order_id', 'items', 'amount', 'currency', 'hash',
                'first_name', 'last_name', 'email', 'phone', 'address', 'city', 'country'];

            for (const field of requiredFields) {
                if (!payment[field] || payment[field] === '') {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // 3. Open PayHere
            if (window.payhere) {
                window.payhere.onCompleted = function onCompleted(orderId) {
                    if (onSuccess) onSuccess(orderId);
                    toast.success("Payment successful!");
                    setLoading(false);
                };

                window.payhere.onDismissed = function onDismissed() {
                    if (onDismiss) onDismiss();
                    setLoading(false);
                };

                window.payhere.onError = function onError(error) {
                    // Payment error occurred
                    toast.error("Payment failed: " + error);
                    setLoading(false);
                };

                // Starting PayHere payment
                window.payhere.startPayment(payment);
            } else {
                throw new Error("PayHere SDK not loaded");
            }
        } catch (err) {
            console.error("Payment error:", err);
            toast.error(err.message || "Payment failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <>
            <Script
                src="https://www.payhere.lk/lib/payhere.js"
                strategy="lazyOnload"
                onLoad={() => {
                    // PayHere SDK loaded successfully
                    setSdkLoaded(true);
                }}
                onError={() => {
                    console.error("Failed to load PayHere SDK");
                }}
            />
            <button
                onClick={handlePayment}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-3 disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <CreditCard className="w-5 h-5" />
                        Pay via PayHere
                    </>
                )}
            </button>
        </>
    );
}
