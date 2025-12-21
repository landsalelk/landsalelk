'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { account } from '@/appwrite';
import { Lock, Loader2, MapPin, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    useEffect(() => {
        if (!userId || !secret) {
            toast.error('Invalid reset link. Please request a new one.');
        }
    }, [userId, secret]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await account.updateRecovery(userId, secret, password);
            setSuccess(true);
            toast.success('Password reset successfully!');
        } catch (error) {
            console.error(error);
            if (error.code === 401) {
                toast.error('Reset link expired. Please request a new one.');
            } else {
                toast.error(error.message || 'Failed to reset password');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!userId || !secret) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Reset Link</h2>
                <p className="text-slate-600 mb-6">This password reset link is invalid or has expired.</p>
                <Link
                    href="/auth/forgot-password"
                    className="text-emerald-600 font-bold hover:underline"
                >
                    Request a new reset link
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Password Reset!</h2>
                <p className="text-slate-600 mb-6">Your password has been successfully updated.</p>
                <Link
                    href="/auth/login"
                    className="inline-block px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                    Sign In Now
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        minLength={8}
                        className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
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
                        Resetting...
                    </>
                ) : (
                    'Reset Password'
                )}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
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
                    <h1 className="text-2xl font-bold text-white mt-6">Set New Password</h1>
                    <p className="text-slate-400 mt-2">Enter your new password below</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <Suspense fallback={<div className="py-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
