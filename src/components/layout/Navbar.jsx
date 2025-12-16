'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, User, Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils'; // We need to create this util
import { account } from '@/lib/appwrite';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const session = await account.get();
                setUser(session);
            } catch (e) {
                setUser(null);
            }
        };
        checkUser();

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Buy', href: '/properties?type=sale' },
        { name: 'Rent', href: '/properties?type=rent' },
        { name: 'lands', href: '/properties?type=land' },
        { name: 'Find Agents', href: '/agents' },
        { name: 'New Projects', href: '/projects' },
    ];

    return (
        <div className={cn(
            "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
            scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-gray-200 py-2" : "bg-transparent py-4"
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-emerald-600 p-2 rounded-lg">
                                <MapPin className="text-white w-5 h-5" />
                            </div>
                            <span className={cn("font-bold text-2xl tracking-tight", scrolled ? "text-slate-900" : "text-white")}>
                                Landsale<span className="text-emerald-500">.lk</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex space-x-8 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-emerald-500",
                                    scrolled ? "text-slate-600" : "text-white/90 hover:text-emerald-300"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button className={cn(
                            "p-2 rounded-full transition-colors",
                            scrolled ? "hover:bg-slate-100 text-slate-600" : "hover:bg-white/10 text-white"
                        )}>
                            <Search className="w-5 h-5" />
                        </button>

                        {user ? (
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold border border-emerald-200">
                                    {user.name.charAt(0)}
                                </div>
                            </Link>
                        ) : (
                            <Link
                                href="/auth/login"
                                className={cn(
                                    "px-5 py-2.5 rounded-full text-sm font-medium transition-all transform hover:scale-105",
                                    scrolled
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg"
                                        : "bg-white text-emerald-900 hover:bg-emerald-50"
                                )}
                            >
                                Sign In
                            </Link>
                        )}
                        {!user && (
                            <Link href="/auth/register" className={cn(
                                "text-sm font-medium hover:underline",
                                scrolled ? "text-slate-600" : "text-white"
                            )}>
                                Join
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn("p-2 rounded-md", scrolled ? "text-slate-900" : "text-white")}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 shadow-xl overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-3">
                                {user ? (
                                    <Link href="/dashboard" className="w-full text-center py-3 bg-emerald-600 text-white rounded-lg font-medium">
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/auth/login" className="w-full text-center py-3 bg-slate-100 text-slate-700 rounded-lg font-medium">
                                            Sign In
                                        </Link>
                                        <Link href="/auth/register" className="w-full text-center py-3 bg-emerald-600 text-white rounded-lg font-medium">
                                            Create Account
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
