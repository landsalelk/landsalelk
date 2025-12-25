"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { account, databases } from "@/lib/appwrite";
import { getKYCStatus } from "@/lib/kyc";
import { DB_ID, COLLECTION_AGENTS } from "@/appwrite/config";
import { Query } from "appwrite";
import { toast } from "sonner";
import {
    LayoutDashboard, Home, Heart, MessageCircle, Settings, Plus,
    Users, Sparkles, Wallet, HandCoins, Calendar, Crown,
    ShieldCheck, Clock, AlertCircle, LogOut, ChevronRight, Loader2
} from 'lucide-react';

export function Sidebar({ className = "" }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    // State
    const [user, setUser] = useState(null);
    const [agent, setAgent] = useState(null);
    const [kycStatus, setKycStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const activeTab = searchParams.get('tab') || 'overview';
    const isSettingsPage = pathname.includes('/settings');

    useEffect(() => {
        const loadSidebarData = async () => {
            try {
                const userData = await account.get();
                setUser(userData);

                const [kycDoc, agentDocs] = await Promise.all([
                    getKYCStatus(),
                    databases.listDocuments(DB_ID, COLLECTION_AGENTS, [Query.equal('user_id', userData.$id)])
                ]);

                if (agentDocs.documents.length > 0) {
                    setAgent(agentDocs.documents[0]);
                }
                setKycStatus(kycDoc?.status || 'unverified');
            } catch (e) {
                // Silent fail or redirect if not logged in
            } finally {
                setLoading(false);
            }
        };
        loadSidebarData();
    }, []);

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            toast.success('Logged out successfully');
            router.push('/');
        } catch (e) {
            toast.error('Logout failed');
        }
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, tab: 'overview', isTab: true },
        { id: 'listings', label: 'My Listings', icon: Home, tab: 'listings', isTab: true },
        ...(agent ? [
            { id: 'leads', label: 'Leads CRM', icon: Users, link: '/dashboard/leads' },
            { id: 'marketing', label: 'Marketing', icon: Sparkles, link: '/dashboard/marketing' },
            { id: 'open-house', label: 'Open Houses', icon: Calendar, link: '/dashboard/open-houses' },
        ] : []),
        { id: 'offers', label: 'Offers', icon: HandCoins, tab: 'offers', isTab: true },
        { id: 'wallet', label: 'My Wallet', icon: Wallet, link: '/dashboard/wallet' },
        { id: 'favorites', label: 'Saved Homes', icon: Heart, tab: 'favorites', isTab: true },
        { id: 'premium', label: 'Go Premium', icon: Crown, tab: 'premium', isTab: true },
        { id: 'messages', label: 'Messages', icon: MessageCircle, link: '/messages' },
        { id: 'settings', label: 'Settings', icon: Settings, link: '/dashboard/settings' },
    ];

    if (loading) {
        return (
            <aside className={`lg:w-64 space-y-6 ${className}`}>
                <div className="glass-card rounded-2xl p-6 h-[200px] animate-pulse bg-slate-100/50" />
                <div className="glass-card rounded-2xl p-3 h-[400px] animate-pulse bg-slate-100/50" />
            </aside>
        );
    }

    return (
        <aside className={`lg:w-64 space-y-6 ${className}`}>
            {/* User Card */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#10b981] to-[#06b6d4] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 line-clamp-1">{user?.name}</h2>
                        <p className="text-sm text-slate-500 line-clamp-1">{user?.email}</p>
                    </div>
                </div>

                {/* KYC Status */}
                {kycStatus === 'approved' ? (
                    <div className="p-3 bg-green-50 rounded-xl flex items-center gap-2 text-green-700 text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-medium">Verified Account</span>
                    </div>
                ) : kycStatus === 'pending' ? (
                    <div className="p-3 bg-amber-50 rounded-xl flex items-center gap-2 text-amber-700 text-sm">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Verification Pending</span>
                    </div>
                ) : (
                    <Link href="/kyc" className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-slate-600 text-sm hover:bg-slate-200 transition-colors">
                        <span className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">Verify Identity</span>
                        </span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                )}
            </div>

            {/* Navigation */}
            <nav className="glass-card rounded-2xl p-3 space-y-1">
                {navItems.map(item => {
                    // Logic to determine active state
                    let isActive = false;

                    if (item.link) {
                        // For direct links (Settings, Wallet, etc), check pathname
                        if (item.link === '/dashboard/settings') {
                            isActive = pathname.startsWith('/dashboard/settings');
                        } else if (item.link === '/dashboard') {
                            isActive = pathname === '/dashboard' && activeTab === 'overview';
                        } else {
                            isActive = pathname.startsWith(item.link);
                        }
                    } else if (item.isTab) {
                        // For Tabs on the main dashboard page
                        // Only active if we are on the main dashboard page AND the tab matches
                        isActive = pathname === '/dashboard' && activeTab === item.tab;
                    }

                    // Render Link
                    // If it's a tab, verify we link to /dashboard?tab=x. If it's a link, use link.
                    const href = item.link || `/dashboard?tab=${item.tab}`;

                    return (
                        <Link
                            key={item.id}
                            href={href}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                                ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}

                <hr className="my-2 border-slate-100" />

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </nav>

            {/* Quick Action */}
            <Link
                href="/properties/create"
                className="block p-4 bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-2xl text-white text-center font-bold shadow-lg shadow-[#10b981]/30 hover:shadow-xl transition-all"
            >
                <Plus className="w-5 h-5 inline mr-2" />
                Post New Listing
            </Link>

            {!agent && !loading && (
                <Link
                    href="/auth/register/agent"
                    className="block p-4 bg-slate-800 rounded-2xl text-white text-center font-bold shadow-lg hover:bg-slate-700 transition-all"
                >
                    <span className="block text-amber-400 text-xs uppercase mb-1">Earn Commission</span>
                    Become an Agent
                </Link>
            )}
        </aside>
    );
}
