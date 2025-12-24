'use client';

import { useState } from 'react';
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function NewsletterForm() {
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        if (email && !submitting) {
            setSubmitting(true);
            try {
                const result = await subscribeToNewsletter(email);
                if (result.success) {
                    toast.success(result.message);
                    e.target.reset();
                } else {
                    toast.error(result.error);
                }
            } catch (error) {
                toast.error("Something went wrong. Please try again.");
            } finally {
                setSubmitting(false);
            }
        }
    };

    return (
        <form
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            onSubmit={handleSubmit}
        >
            <input
                type="email"
                name="email"
                required
                disabled={submitting}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white rounded-2xl border border-slate-200 outline-none focus:border-[#10b981] font-medium disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={submitting}
                className="px-8 py-4 bg-[#10b981] text-white rounded-2xl font-bold hover:bg-[#059669] transition-colors shadow-lg shadow-[#10b981]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
            >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Subscribe"}
            </button>
        </form>
    );
}
