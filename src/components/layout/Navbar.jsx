'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, User, Search, MapPin, PlusCircle, Heart, Home } from 'lucide-react';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { account } = await import('@/lib/appwrite');
                const session = await account.get();
                setUser(session);
            } catch (e) {
                setUser(null);
            }
        };
        checkUser();
    }, []);

    const navLinks = [
        { name: 'Lands', href: '/properties?type=land' },
        { name: 'Houses', href: '/properties?type=sale' },
        { name: 'Rent', href: '/properties?type=rent' },
        { name: 'Agents', href: '/agents' },
        { name: 'Legal', href: '/legal' },
    ];

    if (!mounted) return null;

    return (
        <>
            {/* Desktop Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`glass-panel rounded-2xl px-6 transition-all duration-300 ${scrolled ? 'py-3 shadow-lg' : 'py-4'}`}>
                        <div className="flex justify-between items-center">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="w-10 h-10 bg-[#10b981] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <MapPin className="text-white w-5 h-5" />
                                </div>
                                <span className="text-2xl font-bold text-slate-800 tracking-tight">
                                    LandSale<span className="text-[#10b981]">.lk</span>
                                </span>
                            </Link>

                            {/* Desktop Nav Pills */}
                            <div className="hidden md:flex nav-pills">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="nav-pill hover:bg-white/50"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Right Side Actions */}
                            <div className="hidden md:flex items-center gap-3">
                                {user ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#d1fae5] text-slate-600 hover:text-[#10b981] transition-colors"
                                            title="Dashboard"
                                        >
                                            <Home className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href="/agent/dashboard"
                                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#d1fae5] text-slate-600 hover:text-[#10b981] transition-colors"
                                            title="Agent Dashboard"
                                        >
                                            <User className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href="/agent/my-id"
                                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#d1fae5] text-slate-600 hover:text-[#10b981] transition-colors"
                                            title="My Agent ID"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </Link>
                                        <Link
                                            href="/messages"
                                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#d1fae5] text-slate-600 hover:text-[#10b981] transition-colors relative"
                                            title="Messages"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#d1fae5] text-slate-600 hover:text-[#10b981] transition-colors"
                                            title="Saved"
                                        >
                                            <Heart className="w-5 h-5" />
                                        </Link>
                                        <Link href="/profile" className="flex items-center gap-2 group">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d1fae5] to-[#cffafe] p-0.5 group-hover:scale-110 transition-transform">
                                                <div className="w-full h-full rounded-full bg-[#10b981] flex items-center justify-center text-white font-bold">
                                                    {user.name?.charAt(0) || 'U'}
                                                </div>
                                            </div>
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        href="/auth/login"
                                        className="text-slate-600 hover:text-[#10b981] font-bold text-sm transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                )}

                                <Link
                                    href="/properties/create"
                                    className="btn-primary flex items-center gap-2 animate-jelly"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Post Ad</span>
                                </Link>
                            </div>


                            {/* Mobile Menu Button */}
                            <div className="md:hidden flex items-center gap-3">
                                <Link
                                    href="/properties/create"
                                    className="bg-[#10b981] text-white p-2 rounded-xl shadow-lg"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="p-2 rounded-xl bg-white/50 text-slate-700"
                                >
                                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="fixed top-20 left-4 right-4 z-40 glass-panel rounded-2xl shadow-xl overflow-hidden md:hidden animate-slide-up">
                    <div className="p-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:text-[#10b981] hover:bg-[#ecfdf5] transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-3">
                            {user ? (
                                <Link
                                    href="/profile"
                                    className="w-full text-center py-3 bg-[#10b981] text-white rounded-xl font-bold"
                                    onClick={() => setIsOpen(false)}
                                >
                                    My Profile
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="w-full text-center py-3 bg-slate-100 text-slate-700 rounded-xl font-bold"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        className="w-full text-center py-3 bg-[#10b981] text-white rounded-xl font-bold"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Create Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Nav */}
            <div className="md:hidden mobile-bottom-nav">
                <div className="flex justify-around items-center">
                    <Link href="/" className="mobile-nav-btn" onClick={() => setIsOpen(false)}>
                        <Home className="w-6 h-6" strokeWidth={2.5} />
                    </Link>
                    <Link href="/properties" className="mobile-nav-btn" onClick={() => setIsOpen(false)}>
                        <Search className="w-6 h-6" strokeWidth={2.5} />
                    </Link>
                    <Link
                        href="/properties/create"
                        className="mobile-nav-btn text-[#10b981] -mt-6 bg-white p-2 rounded-full shadow-lg border-4 border-[#ecfdf5]"
                        onClick={() => setIsOpen(false)}
                    >
                        <PlusCircle className="w-8 h-8" strokeWidth={2.5} />
                    </Link>
                    <Link href="/saved" className="mobile-nav-btn" onClick={() => setIsOpen(false)}>
                        <Heart className="w-6 h-6" strokeWidth={2.5} />
                    </Link>
                    <Link href="/profile" className="mobile-nav-btn" onClick={() => setIsOpen(false)}>
                        <User className="w-6 h-6" strokeWidth={2.5} />
                    </Link>
                </div>
            </div>
        </>
    );
}
