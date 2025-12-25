"use client";

import { useState, useEffect } from "react";
import { account, databases } from "@/lib/appwrite";
import { getUserListings } from "@/lib/properties";
import { getUserFavorites } from "@/lib/favorites";
import { getKYCStatus } from "@/lib/kyc";
import { PropertyCard } from "@/components/property/PropertyCard";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
    Home, Heart, MessageCircle,
    Eye, DollarSign,
    ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Crown
} from 'lucide-react';
import { SavedSearchesWidget } from '@/components/dashboard/SavedSearchesWidget';
import { LeadStatsWidget } from '@/components/dashboard/LeadStatsWidget';
import { renewProperty } from '@/lib/properties';
import { DB_ID, COLLECTION_LISTING_OFFERS, COLLECTION_MESSAGES, COLLECTION_AGENTS } from '@/appwrite/config';
import { Query } from 'appwrite';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeSection = searchParams.get('tab') || 'overview';

    const [user, setUser] = useState(null);
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [offersReceived, setOffersReceived] = useState([]);
    const [kycStatus, setKycStatus] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [inquiriesStats, setInquiriesStats] = useState({ total: 0, change: 0 });
    const [totalViews, setTotalViews] = useState(0);

    // Stats based on actual data
    const stats = {
        totalViews: totalViews,
        viewsChange: 0,
        totalInquiries: inquiriesStats.total,
        inquiriesChange: inquiriesStats.change,
        totalListings: listings.length,
        savedHomes: favorites.length,
    };

    useEffect(() => {
        setMounted(true);
        const loadDashboardData = async () => {
            try {
                const userData = await account.get();
                setUser(userData);

                const [userListings, kycDoc, agentDocs] = await Promise.all([
                    getUserListings(userData.$id),
                    getKYCStatus(),
                    databases.listDocuments(DB_ID, COLLECTION_AGENTS, [Query.equal('user_id', userData.$id)])
                ]);

                if (agentDocs.documents.length > 0) {
                    setAgent(agentDocs.documents[0]);
                }

                setListings(userListings);
                setKycStatus(kycDoc?.status || 'unverified');

                // Calculate total views
                const views = userListings.reduce((acc, listing) => acc + (listing.views_count || 0), 0);
                setTotalViews(views);

                try {
                    const favDocs = await getUserFavorites();
                    setFavorites(favDocs);
                } catch (e) {
                    // Silent fail
                }

                // Fetch Inquiries (Messages) Stats
                try {
                    const now = new Date();
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    const sixtyDaysAgo = new Date();
                    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

                    const [totalInquiriesRes, last30DaysRes, prev30DaysRes] = await Promise.all([
                        databases.listDocuments(DB_ID, COLLECTION_MESSAGES, [Query.equal('receiver_id', userData.$id), Query.limit(1)]),
                        databases.listDocuments(DB_ID, COLLECTION_MESSAGES, [Query.equal('receiver_id', userData.$id), Query.greaterThanEqual('timestamp', thirtyDaysAgo.toISOString()), Query.limit(1)]),
                        databases.listDocuments(DB_ID, COLLECTION_MESSAGES, [Query.equal('receiver_id', userData.$id), Query.greaterThanEqual('timestamp', sixtyDaysAgo.toISOString()), Query.lessThan('timestamp', thirtyDaysAgo.toISOString()), Query.limit(1)])
                    ]);

                    const total = totalInquiriesRes.total;
                    const currentPeriodCount = last30DaysRes.total;
                    const prevPeriodCount = prev30DaysRes.total;
                    let change = 0;
                    if (prevPeriodCount > 0) {
                        change = Math.round(((currentPeriodCount - prevPeriodCount) / prevPeriodCount) * 100);
                    } else if (currentPeriodCount > 0) {
                        change = 100;
                    }
                    setInquiriesStats({ total, change });
                } catch (e) {
                    console.error("Error fetching inquiries:", e);
                }

                // Fetch Offers
                try {
                    const receivedOffersRes = await databases.listDocuments(
                        DB_ID,
                        COLLECTION_LISTING_OFFERS,
                        [Query.equal('seller_id', userData.$id), Query.orderDesc('$createdAt')]
                    );
                    setOffersReceived(receivedOffersRes.documents);
                } catch (e) {
                    // Silent fail
                }

            } catch (e) {
                console.error("Dashboard load error:", e);
                router.push("/auth/login");
            } finally {
                setLoading(false);
            }
        };

        if (mounted) {
            loadDashboardData();
        }
    }, [mounted, router]);

    const handleAcceptOffer = async (offerId) => {
        try {
            await databases.updateDocument(DB_ID, COLLECTION_LISTING_OFFERS, offerId, {
                status: 'accepted'
            });
            setOffersReceived(prev => prev.map(o =>
                o.$id === offerId ? { ...o, status: 'accepted' } : o
            ));
            toast.success('Offer accepted!');
        } catch (e) {
            toast.error('Failed to accept offer');
        }
    };

    const handleRejectOffer = async (offerId) => {
        try {
            await databases.updateDocument(DB_ID, COLLECTION_LISTING_OFFERS, offerId, {
                status: 'rejected'
            });
            setOffersReceived(prev => prev.map(o =>
                o.$id === offerId ? { ...o, status: 'rejected' } : o
            ));
            toast.success('Offer rejected');
        } catch (e) {
            toast.error('Failed to reject offer');
        }
    };

    if (!mounted || loading) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in w-full">

            {/* Overview Section */}
            {activeSection === 'overview' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                        <NotificationCenter />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Widget 1: Lead Stats or Inquiries */}
                        {agent ? (
                            <LeadStatsWidget userId={user?.$id} agentId={agent?.$id} />
                        ) : (
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
                        )}

                        {/* Widget 2: Views */}
                        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Eye className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{stats.totalViews.toLocaleString()}</div>
                                <div className="text-sm text-slate-500">Total Views</div>
                            </div>
                        </div>

                        {/* Widget 3: Saved Homes / Saved Searches */}
                        {agent ? (
                            <SavedSearchesWidget userListings={listings} />
                        ) : (
                            <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Heart className="w-5 h-5 text-red-500" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{stats.savedHomes}</div>
                                    <div className="text-sm text-slate-500">Saved Homes</div>
                                </div>
                            </div>
                        )}

                        {/* Widget 4: Active Listings */}
                        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Home className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{stats.totalListings}</div>
                                <div className="text-sm text-slate-500">Active Listings</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Listings */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">My Recent Listings</h2>
                            <Link
                                href="/dashboard?tab=listings"
                                className="text-sm text-[#10b981] font-medium hover:underline"
                            >
                                View All
                            </Link>
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
                            <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* My Listings Tab */}
            {activeSection === 'listings' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-800">My Listings</h1>
                        <Link href="/properties/create" className="bg-[#10b981] text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors">
                            + Post New
                        </Link>
                    </div>
                    {listings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map(prop => (
                                <PropertyCard key={prop.$id} property={prop} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
                            <h3 className="font-bold text-slate-700">No properties found</h3>
                            <Link href="/properties/create" className="text-emerald-500 font-bold mt-2 inline-block">Post one now</Link>
                        </div>
                    )}
                </div>
            )}

            {/* Offers Tab */}
            {activeSection === 'offers' && (
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-slate-800">Offers Received</h1>
                    {offersReceived.length > 0 ? (
                        <div className="space-y-4">
                            {offersReceived.map(offer => (
                                <div key={offer.$id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-lg">LKR {offer.amount.toLocaleString()}</div>
                                        <div className="text-slate-500">for {offer.property_title}</div>
                                        <div className="text-xs text-slate-400 mt-1">From: {offer.buyer_name}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        {offer.status === 'pending' ? (
                                            <>
                                                <button onClick={() => handleAcceptOffer(offer.$id)} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200">Accept</button>
                                                <button onClick={() => handleRejectOffer(offer.$id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200">Reject</button>
                                            </>
                                        ) : (
                                            <span className={`px-4 py-2 rounded-lg font-bold ${offer.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                            <h3 className="text-slate-500">No offers received yet</h3>
                        </div>
                    )}
                </div>
            )}

            {/* Favorites Tab */}
            {activeSection === 'favorites' && (
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-slate-800">Saved Homes</h1>
                    {favorites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map(prop => (
                                <PropertyCard key={prop.$id} property={prop} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                            <h3 className="text-slate-500">No saved homes</h3>
                            <Link href="/properties" className="text-emerald-500 font-bold mt-2 inline-block">Browse Properties</Link>
                        </div>
                    )}
                </div>
            )}

            {/* Premium Tab Placeholder */}
            {activeSection === 'premium' && (
                <div className="space-y-6 text-center py-20">
                    <Crown className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-slate-800">Premium Plans</h1>
                    <p className="text-slate-500">Coming soon</p>
                </div>
            )}
        </div>
    );
}
