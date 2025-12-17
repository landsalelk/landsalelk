'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { account } = await import('@/lib/appwrite');
            const session = await account.createEmailPasswordSession(email, password);
            const user = await account.get();

            toast.success("ආයුබෝවන්! Welcome back!");

            // Check for admin/agent roles or labels
            if (user.labels && user.labels.includes('admin')) {
                router.push('/admin');
            } else if (user.prefs && (user.prefs.role === 'agent' || user.prefs.agent_profile_created)) {
                router.push('/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 live-gradient opacity-90" />
            <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-float-delayed" />

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
                    <h1 className="text-2xl font-bold text-white mt-6">Welcome Back!</h1>
                    <p className="text-white/70 mt-2">Sign in to continue</p>
                </div>

                {/* Form */}
                <div className="glass-panel rounded-3xl p-8 shadow-2xl relative pt-14">
                    {/* Lock Icon */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                        <svg viewBox="0 0 200 200" fill="none" className="w-10 h-10">
                            <path d="M60 90V60C60 30 80 20 100 20C120 20 140 30 140 60V90" stroke="#9CA3AF" strokeWidth="15" strokeLinecap="round" />
                            <rect x="40" y="90" width="120" height="90" rx="15" fill="#FCD34D" stroke="#F59E0B" strokeWidth="5" />
                            <circle cx="100" cy="130" r="12" fill="#FFF" stroke="#F59E0B" strokeWidth="3" />
                            <path d="M100 130V150" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
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
                                    placeholder="••••••••"
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

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#10b981] focus:ring-[#10b981]" />
                                <span className="text-slate-600 font-medium">Remember me</span>
                            </label>
                            <Link href="/auth/forgot-password" className="text-[#10b981] hover:text-[#059669] font-bold">
                                Forgot?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-base"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-slate-500">Don&apos;t have an account? </span>
                        <Link href="/auth/register" className="text-[#10b981] hover:text-[#059669] font-bold">
                            Sign Up
                        </Link>
                    </div>
                </div>

                {/* Terms */}
                <div className="mt-6 text-center text-sm text-white/60">
                    By signing in, you agree to our{' '}
                    <Link href="/terms" className="text-yellow-300 hover:underline">Terms</Link> and{' '}
                    <Link href="/privacy" className="text-yellow-300 hover:underline">Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
}
