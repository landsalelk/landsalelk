'use client';

import { useState, useEffect } from 'react';
import { account } from '@/appwrite';
import { getUserListings, getPropertyById } from '@/lib/properties';
import { getKYCStatus } from '@/lib/kyc';
import { saveTransaction } from '@/lib/transactions';
import { getUserFavorites, removeFavorite } from '@/lib/favorites';
import { PayHereButton } from '@/components/payments/PayHereButton';
import { PropertyCard } from '@/components/property/PropertyCard';
import { User, ShieldCheck, Grid, Heart, Settings, Plus, LogOut, Loader2, AlertCircle, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('listings');
    const [listings, setListings] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [kycStatus, setKycStatus] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Get User
                const userData = await account.get();
                setUser(userData);

                // 2. Get KYC Status
                const kycDoc = await getKYCStatus();
                setKycStatus(kycDoc?.status || 'unverified');

                // 3. Get Listings
                const userListings = await getUserListings(userData.$id);
                setListings(userListings);

                // 4. Get Favorites
                try {
                    const favDocs = await getUserFavorites();
                    // Fetch actual property details for each favorite
                    const favProperties = await Promise.all(
                        favDocs.map(async (fav) => {
                            try {
                                const prop = await getPropertyById(fav.property_id);
                                return { ...prop, favoriteDocId: fav.$id };
                            } catch {
                                return null;
                            }
                        })
                    );
                    setFavorites(favProperties.filter(Boolean));
                } catch (e) {
                    // Silent fail for favorites
                }

            } catch (error) {
                console.error(error);
                // Only redirect to login if it's an authentication error
                if (error.code === 401 || error.type === 'general_unauthorized_scope' || error.message?.includes('Unauthorized')) {
                    router.push('/auth/login');
                } else {
                    toast.error('Failed to load profile data. Please refresh the page.');
                }
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            toast.success("Logged out successfully");
            router.push('/');
        } catch (e) {
            toast.error("Logout failed");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!user) return null;


    // Verification Badge Logic
    const getBadge = () => {
        if (kycStatus === 'approved') return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified</span>;
        if (kycStatus === 'pending') return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
        return <Link href="/kyc" className="px-3 py-1 bg-slate-200 text-slate-600 hover:bg-slate-300 text-xs font-bold rounded-full flex items-center gap-1 transition-colors"><AlertCircle className="w-3 h-3" /> Verify Identity</Link>;
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header Profile Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">{user.name}</h1>
                        <p className="text-slate-500 mb-4">{user.email}</p>
                        <div className="flex justify-center md:justify-start gap-3">
                            {getBadge()}
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                                Member since {new Date(user.$createdAt).getFullYear()}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/properties/create" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Post Ad
                        </Link>
                        <button onClick={handleLogout} className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-red-500 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1 space-y-2">
                        {[
                            { id: 'listings', label: 'My Listings', icon: Grid },
                            { id: 'favorites', label: 'Saved Homes', icon: Heart },
                            { id: 'premium', label: 'Upgrade Premium', icon: Sparkles },
                            { id: 'settings', label: 'Settings', icon: Settings },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">

                        {/* Listings Tab */}
                        {activeTab === 'listings' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-slate-900">My Properties</h2>
                                    <span className="text-sm text-slate-500">{listings.length} Active</span>
                                </div>

                                {listings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {listings.map(prop => (
                                            <div key={prop.$id} className="relative group">
                                                <PropertyCard property={prop} />
                                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 bg-white rounded-lg shadow-sm text-slate-600 hover:text-emerald-600 font-medium text-xs">Edit</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <Grid className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 mb-2">No listings yet</h3>
                                        <p className="text-slate-500 mb-6">Start selling by posting your first property.</p>
                                        <Link href="/properties/create" className="text-emerald-600 font-bold hover:underline">Create Listing</Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Favorites Tab */}
                        {activeTab === 'favorites' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-slate-900">Saved Homes</h2>
                                    <span className="text-sm text-slate-500">{favorites.length} Saved</span>
                                </div>

                                {favorites.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {favorites.map(prop => (
                                            <div key={prop.$id} className="relative group">
                                                <PropertyCard property={prop} />
                                                <button
                                                    onClick={async () => {
                                                        await removeFavorite(prop.$id);
                                                        setFavorites(prev => prev.filter(f => f.$id !== prop.$id));
                                                        toast.success("Removed from saved homes");
                                                    }}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Heart className="w-4 h-4 fill-current" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <Heart className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 mb-2">No saved homes</h3>
                                        <p className="text-slate-500">Properties you heart will appear here.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Premium Tab */}
                        {activeTab === 'premium' && (
                            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-12 text-center relative overflow-hidden text-white">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Sparkles className="w-8 h-8 text-amber-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Become a Premium Member</h3>
                                    <p className="text-slate-300 mb-8 max-w-md mx-auto">Get verified badge, priority support, and 5x more visibility on your listings.</p>

                                    <div className="mb-8">
                                        <span className="text-4xl font-bold">LKR 5,000</span>
                                        <span className="text-slate-400"> / year</span>
                                    </div>

                                    <div className="flex justify-center">
                                        <PayHereButton
                                            orderId={`SUB-${user.$id}-${Date.now()}`}
                                            items="Premium Membership"
                                            amount={5000}
                                            customer={{
                                                first_name: user.name.split(' ')[0],
                                                last_name: user.name.split(' ').slice(1).join(' ') || 'User',
                                                email: user.email,
                                                phone: user.phone || '0777123456',
                                            }}
                                            onSuccess={async (orderId) => {
                                                toast.success("Payment Successful! Welcome to Premium.");
                                                try {
                                                    await saveTransaction({
                                                        userId: user.$id,
                                                        amount: 5000,
                                                        status: 'success',
                                                        referenceId: orderId,
                                                        type: 'subscription'
                                                    });
                                                } catch (e) {
                                                    console.error("Failed to save transaction", e);
                                                }
                                            }}
                                            onDismiss={() => toast.info("Payment Cancelled")}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="bg-white rounded-3xl p-8 border border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-6">Account Settings</h3>
                                <form className="space-y-4 max-w-md" onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const newName = formData.get('name');
                                    try {
                                        await account.updateName(newName);
                                        setUser(prev => ({ ...prev, name: newName }));
                                        toast.success("Name updated successfully!");
                                    } catch (err) {
                                        toast.error("Failed to update name");
                                    }
                                }}>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                        <input type="text" name="name" defaultValue={user.name} className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input type="email" defaultValue={user.email} disabled className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500" />
                                    </div>
                                    <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors">Save Changes</button>
                                </form>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}

function ClockIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
