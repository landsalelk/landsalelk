'use client';

import { useState } from 'react';
import { account } from '@/appwrite';
import { Mail, Loader2, MapPin, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await account.createRecovery(
                email,
                `${window.location.origin}/auth/reset-password`
            );
            setSent(true);
            toast.success("Recovery email sent!");
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to send recovery email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="bg-emerald-600 p-2 rounded-lg">
                            <MapPin className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-2xl text-white">
                            Landsale<span className="text-emerald-500">.lk</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mt-6">Reset Password</h1>
                    <p className="text-slate-400 mt-2">We'll send you a recovery link</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {sent ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Check Your Email</h2>
                            <p className="text-slate-600 mb-6">
                                We've sent a password reset link to<br />
                                <strong>{email}</strong>
                            </p>
                            <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Recovery Link'
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
