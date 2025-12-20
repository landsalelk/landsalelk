'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, MapPin, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { account } = await import('@/lib/appwrite');
                await account.get();
                router.replace('/dashboard');
            } catch (error) {
                // Not logged in
            }
        };
        checkSession();
    }, [router]);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const { account, ID } = await import('@/lib/appwrite');

            try {
                // Try creating account
                await account.create(ID.unique(), email, password, name);
            } catch (createError) {
                // If user presumably already exists, we tried to create it. 
                // Note: creating session for existing user is a different flow (Login).
                // Let's just bubble up unless specific error we want to handle.
                throw createError;
            }

            // Login immediately
            await account.createEmailPasswordSession(email, password);
            toast.success("Account created successfully!");

            // Force redirect
            window.location.href = '/dashboard';
        } catch (error) {
            console.error(error);
            if (error?.code === 409) {
                toast.error("User with this email already exists. Please login.");
                router.push('/auth/login');
            } else {
                toast.error(error.message || "Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 live-gradient opacity-90" />
            <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-float-delayed" />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <MapPin className="text-[#10b981] w-6 h-6" />
                        </div>
                        <span className="font-bold text-2xl text-white">
                            LandSale<span className="text-yellow-300">.lk</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mt-6">Join Our Community</h1>
                    <p className="text-white/70 mt-2">Create your free account</p>
                </div>

                {/* Form */}
                <div className="glass-panel rounded-3xl p-8 shadow-2xl relative pt-14">
                    {/* User Icon */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 100 100" fill="none" className="w-12 h-12">
                            <circle cx="50" cy="50" r="45" fill="#E0F2FE" stroke="#3B82F6" strokeWidth="3" />
                            <path d="M50 95C70 95 85 80 85 65C85 50 50 50 50 50C50 50 15 50 15 65C15 80 30 95 50 95Z" fill="#3B82F6" />
                            <circle cx="50" cy="38" r="15" fill="#FDE68A" stroke="#F59E0B" strokeWidth="3" />
                            <path d="M35 38C35 23 40 13 50 13C60 13 65 23 65 38" fill="#4B5563" />
                        </svg>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="name"
                                    data-testid="register-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    required
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-bold text-slate-700 transition-all"
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
                            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat password"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#6ee7b7] focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-red-500 text-xs mt-1 font-bold">Passwords do not match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-base mt-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* OAuth Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-500 font-medium">or sign up with</span>
                        </div>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const { account } = await import('@/lib/appwrite');
                                    const { OAuthProvider } = await import('appwrite');
                                    account.createOAuth2Session(
                                        OAuthProvider.Google,
                                        `${window.location.origin}/dashboard`,
                                        `${window.location.origin}/auth/register`
                                    );
                                } catch (error) {
                                    console.error('Google OAuth error:', error);
                                    toast.error('Google sign up failed. Please try again.');
                                }
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all font-medium text-slate-700"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const { account } = await import('@/lib/appwrite');
                                    const { OAuthProvider } = await import('appwrite');
                                    account.createOAuth2Session(
                                        OAuthProvider.Facebook,
                                        `${window.location.origin}/dashboard`,
                                        `${window.location.origin}/auth/register`
                                    );
                                } catch (error) {
                                    console.error('Facebook OAuth error:', error);
                                    toast.error('Facebook sign up failed. Please try again.');
                                }
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] border-2 border-[#1877F2] rounded-xl hover:bg-[#166FE5] transition-all font-medium text-white"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link href="/auth/login" className="text-[#10b981] hover:text-[#059669] font-bold">
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Terms */}
                <div className="mt-6 text-center text-sm text-white/60">
                    By signing up, you agree to our{' '}
                    <Link href="/terms" className="text-yellow-300 hover:underline">Terms</Link> and{' '}
                    <Link href="/privacy" className="text-yellow-300 hover:underline">Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
}
