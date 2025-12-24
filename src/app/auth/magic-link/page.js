'use client';

import { useState } from 'react';
import Link from 'next/link';
import { account } from '@/appwrite';
import { Mail, ArrowLeft, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function MagicLinkPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            // Get current URL for redirect
            const redirectUrl = `${window.location.origin}/auth/magic-link/verify`;

            await account.createMagicURLToken(
                'unique()',
                email,
                redirectUrl
            );

            setSent(true);
            toast.success('Magic link sent! Check your email.');
        } catch (error) {
            console.error('Magic link error:', error);
            if (error.code === 409) {
                toast.error('A user with this email already exists. Please login with password.');
            } else {
                toast.error(error.message || 'Failed to send magic link');
            }
        }
        setLoading(false);
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h1>
                    <p className="text-gray-600 mb-6">
                        We&apos;ve sent a magic link to <strong>{email}</strong>.
                        Click the link in the email to sign in instantly.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => setSent(false)}
                            className="w-full py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Use a different email
                        </button>
                        <Link
                            href="/auth/login"
                            className="block w-full py-3 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                {/* Back Link */}
                <Link
                    href="/auth/login"
                    className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Passwordless Login
                    </h1>
                    <p className="text-gray-600">
                        Enter your email and we&apos;ll send you a magic link to sign in.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-colors"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Send Magic Link
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="px-4 text-sm text-gray-500">or</span>
                    <div className="flex-1 border-t border-gray-200" />
                </div>

                {/* Alternative Login */}
                <Link
                    href="/auth/login"
                    className="block w-full py-3 border border-gray-200 rounded-xl text-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Login with password
                </Link>
            </div>
        </div>
    );
}
