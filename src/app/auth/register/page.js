'use client';

import { useState } from 'react';
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

            // Check if there's an existing session and delete it first
            try {
                await account.get();
                // If we get here, user is already logged in - delete current session
                await account.deleteSession('current');
            } catch (err) {
                // No active session, proceed with registration
            }

            await account.create(ID.unique(), email, password, name);
            await account.createEmailPasswordSession(email, password);
            toast.success("ගිණුම සාර්ථකයි! Account created!");
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Registration failed");
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
