'use client';

import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { getUserListings } from '@/lib/properties';
import { getUserFavorites } from '@/lib/favorites';
import { getKYCStatus } from '@/lib/kyc';
import { PropertyCard } from '@/components/property/PropertyCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    LayoutDashboard, Home, Heart, MessageCircle, Settings, Plus,
    TrendingUp, Eye, Users, DollarSign, ShieldCheck, Clock,
    AlertCircle, ChevronRight, Bell, Search, LogOut, Loader2,
    BarChart3, ArrowUpRight, ArrowDownRight, Sparkles
} from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [kycStatus, setKycStatus] = useState(null);
    const [activeSection, setActiveSection] = useState('overview');
    const [mounted, setMounted] = useState(false);

    // Mock stats (would come from Appwrite analytics in production)
    const stats = {
        totalViews: 1234,
        viewsChange: 12.5,
        totalInquiries: 45,
        inquiriesChange: -8.2,
        totalListings: listings.length,
        savedHomes: favorites.length
    };

    useEffect(() => {
        setMounted(true);
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const userData = await account.get();
            setUser(userData);

            const [userListings, kycDoc] = await Promise.all([
                getUserListings(userData.$id),
                getKYCStatus()
            ]);

            setListings(userListings);
            setKycStatus(kycDoc?.status || 'unverified');

            try {
                const favDocs = await getUserFavorites();
                setFavorites(favDocs);
            } catch (e) {
                // Silent fail
            }
        } catch (error) {
            console.error(error);
            router.push('/auth/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            toast.success('Logged out successfully');
            router.push('/');
        } catch (e) {
            toast.error('Logout failed');
        }
    };

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
            </div>
        );
    }

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'listings', label: 'My Listings', icon: Home },
        { id: 'favorites', label: 'Saved Homes', icon: Heart },
        { id: 'messages', label: 'Messages', icon: MessageCircle, link: '/messages' },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-20 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className="lg:w-64 space-y-6">
                        {/* User Card */}
                        <div className="glass-card rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#10b981] to-[#06b6d4] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800">{user?.name}</h2>
                                    <p className="text-sm text-slate-500">{user?.email}</p>
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
                            {navItems.map(item => (
                                item.link ? (
                                    <Link
                                        key={item.id}
                                        href={item.link}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                ) : (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeSection === item.id
                                            ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30'
                                            : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </button>
                                )
                            ))}

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
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Overview Section */}
                        {activeSection === 'overview' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                                    <div className="flex items-center gap-3">
                                        <button className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50">
                                            <Bell className="w-5 h-5 text-slate-500" />
                                        </button>
                                        <button className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50">
                                            <Search className="w-5 h-5 text-slate-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="glass-card rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Eye className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className={`text-xs font-bold flex items-center gap-1 ${stats.viewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {stats.viewsChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {Math.abs(stats.viewsChange)}%
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800">{stats.totalViews.toLocaleString()}</div>
                                        <div className="text-sm text-slate-500">Total Views</div>
                                    </div>

                                    <div className="glass-card rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                <MessageCircle className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <span className={`text-xs font-bold flex items-center gap-1 ${stats.inquiriesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {stats.inquiriesChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {Math.abs(stats.inquiriesChange)}%
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800">{stats.totalInquiries}</div>
                                        <div className="text-sm text-slate-500">Inquiries</div>
                                    </div>

                                    <div className="glass-card rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Home className="w-5 h-5 text-purple-600" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800">{stats.totalListings}</div>
                                        <div className="text-sm text-slate-500">Active Listings</div>
                                    </div>

                                    <div className="glass-card rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="p-2 bg-red-100 rounded-lg">
                                                <Heart className="w-5 h-5 text-red-500" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800">{stats.savedHomes}</div>
                                        <div className="text-sm text-slate-500">Saved Homes</div>
                                    </div>
                                </div>

                                {/* Recent Listings */}
                                <div className="glass-card rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-slate-800">My Recent Listings</h2>
                                        <button
                                            onClick={() => setActiveSection('listings')}
                                            className="text-sm text-[#10b981] font-medium hover:underline"
                                        >
                                            View All
                                        </button>
                                    </div>

                                    {listings.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {listings.slice(0, 3).map(prop => (
                                                <PropertyCard key={prop.$id} property={prop} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                                            <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <h3 className="font-bold text-slate-700 mb-2">No listings yet</h3>
                                            <p className="text-slate-500 mb-4">Start selling by posting your first property</p>
                                            <Link href="/properties/create" className="text-[#10b981] font-bold hover:underline">
                                                Create Your First Listing
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Premium Upgrade */}
                                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-5 h-5 text-amber-400" />
                                                <span className="text-amber-400 font-bold text-sm">PREMIUM</span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Get 5x More Visibility</h3>
                                            <p className="text-white/70 text-sm max-w-md">
                                                Upgrade to Premium for verified badge, priority support, and featured listings
                                            </p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-amber-400 hover:text-white transition-colors shadow-lg"
                                        >
                                            Upgrade Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Listings Section */}
                        {activeSection === 'listings' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl font-bold text-slate-800">My Listings</h1>
                                    <Link
                                        href="/properties/create"
                                        className="px-4 py-2 bg-[#10b981] text-white rounded-xl font-medium flex items-center gap-2 hover:bg-[#059669] shadow-lg shadow-[#10b981]/30"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add New
                                    </Link>
                                </div>

                                {listings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {listings.map(prop => (
                                            <div key={prop.$id} className="relative group">
                                                <PropertyCard property={prop} />
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                    <Link
                                                        href={`/properties/${prop.$id}/edit`}
                                                        className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-slate-600 shadow-lg hover:bg-slate-50"
                                                    >
                                                        Edit
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="glass-card rounded-2xl p-12 text-center">
                                        <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-slate-700 mb-2">No listings yet</h3>
                                        <p className="text-slate-500 mb-6">Create your first property listing to start selling</p>
                                        <Link
                                            href="/properties/create"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-xl font-bold shadow-lg"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Create Listing
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Favorites Section */}
                        {activeSection === 'favorites' && (
                            <div className="space-y-6 animate-fade-in">
                                <h1 className="text-2xl font-bold text-slate-800">Saved Homes</h1>

                                {favorites.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {favorites.map(fav => (
                                            <PropertyCard key={fav.$id} property={fav} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="glass-card rounded-2xl p-12 text-center">
                                        <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-slate-700 mb-2">No saved homes</h3>
                                        <p className="text-slate-500 mb-6">Properties you heart will appear here</p>
                                        <Link
                                            href="/properties"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-xl font-bold shadow-lg"
                                        >
                                            Browse Properties
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Settings Section */}
                        {activeSection === 'settings' && (
                            <div className="space-y-6 animate-fade-in">
                                <h1 className="text-2xl font-bold text-slate-800">Settings</h1>

                                <div className="glass-card rounded-2xl p-6">
                                    <h3 className="font-bold text-slate-700 mb-4">Account Information</h3>
                                    <form className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                defaultValue={user?.name}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#10b981]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                                            <input
                                                type="email"
                                                defaultValue={user?.email}
                                                disabled
                                                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                placeholder="+94 77 123 4567"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#10b981]"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="px-6 py-3 bg-[#10b981] text-white rounded-xl font-bold hover:bg-[#059669] transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                    </form>
                                </div>

                                <div className="glass-card rounded-2xl p-6">
                                    <h3 className="font-bold text-slate-700 mb-4">Notifications</h3>
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between">
                                            <span className="text-slate-600">Email notifications</span>
                                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#10b981]" />
                                        </label>
                                        <label className="flex items-center justify-between">
                                            <span className="text-slate-600">SMS alerts</span>
                                            <input type="checkbox" className="w-5 h-5 accent-[#10b981]" />
                                        </label>
                                        <label className="flex items-center justify-between">
                                            <span className="text-slate-600">Marketing emails</span>
                                            <input type="checkbox" className="w-5 h-5 accent-[#10b981]" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
