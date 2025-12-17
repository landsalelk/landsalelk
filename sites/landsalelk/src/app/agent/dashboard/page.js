'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { account } from '@/lib/appwrite';
import { getAgentProfile, getTrainingProgress, TRAINING_MODULES, getOverallProgress, formatTimeSpent, BADGES } from '@/lib/agent_training';
import { getUserListings } from '@/lib/properties';
import {
    Loader2, Award, BookOpen, Home, Plus, Settings,
    TrendingUp, Users, Eye, MessageSquare, Star,
    CheckCircle, Clock, AlertCircle, ChevronRight,
    GraduationCap, Trophy, BarChart3, Building2, Shield
} from 'lucide-react';
import { toast } from 'sonner';

export default function AgentDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [agentProfile, setAgentProfile] = useState(null);
    const [trainingProgress, setTrainingProgress] = useState(null);
    const [listings, setListings] = useState([]);
    const [stats, setStats] = useState({
        totalListings: 0,
        activeListings: 0,
        totalViews: 0,
        totalInquiries: 0,
    });

    useEffect(() => {
        const init = async () => {
            try {
                const u = await account.get();
                setUser(u);

                const profile = await getAgentProfile(u.$id);
                setAgentProfile(profile);

                const progress = getTrainingProgress();
                setTrainingProgress(progress);

                const userListings = await getUserListings(u.$id);
                setListings(userListings);
                setStats({
                    totalListings: userListings.length,
                    activeListings: userListings.filter(l => l.status === 'active').length,
                    totalViews: userListings.reduce((sum, l) => sum + (l.views_count || 0), 0),
                    totalInquiries: userListings.reduce((sum, l) => sum + (l.inquiry_count || 0), 0),
                });
            } catch (e) {
                console.error(e);
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const overallProgress = getOverallProgress();
    const isTrainingComplete = trainingProgress?.completedModules?.length === TRAINING_MODULES.length;
    const earnedBadges = trainingProgress?.badges || [];

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Agent Dashboard</h1>
                        <p className="text-slate-500">Welcome back, {user?.name || 'Agent'}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/properties/create"
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Listing
                        </Link>
                        <Link
                            href="/agent/training"
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            <GraduationCap className="w-5 h-5" />
                            Training
                        </Link>
                    </div>
                </div>

                {/* Training Status Banner */}
                {!isTrainingComplete && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-8 text-white">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Complete Your Training</h3>
                                    <p className="text-white/80 text-sm">
                                        {overallProgress}% complete • {TRAINING_MODULES.length - (trainingProgress?.completedModules?.length || 0)} modules remaining
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="flex-1 md:w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all"
                                        style={{ width: `${overallProgress}%` }}
                                    />
                                </div>
                                <Link
                                    href="/agent/training"
                                    className="px-6 py-2 bg-white text-amber-600 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Certified Badge */}
                {isTrainingComplete && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 mb-8 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <Shield className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-xl">Certified Agent</h3>
                                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">VERIFIED</span>
                                </div>
                                <p className="text-white/80 text-sm">
                                    You've completed all training modules • {earnedBadges.length} badges earned
                                </p>
                            </div>
                            <Link
                                href="/agent/training"
                                className="ml-auto px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-all"
                            >
                                View Certificate
                            </Link>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                <Building2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalListings}</div>
                        <div className="text-sm text-slate-500">Total Listings</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                <Eye className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalViews}</div>
                        <div className="text-sm text-slate-500">Total Views</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalInquiries}</div>
                        <div className="text-sm text-slate-500">Inquiries</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                <Trophy className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{earnedBadges.length}</div>
                        <div className="text-sm text-slate-500">Badges Earned</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* My Listings */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Home className="w-5 h-5 text-emerald-500" />
                                    My Listings
                                </h2>
                                <Link href="/properties/create" className="text-emerald-600 font-medium hover:underline text-sm">
                                    + Add New
                                </Link>
                            </div>

                            {listings.length > 0 ? (
                                <div className="space-y-4">
                                    {listings.slice(0, 5).map(listing => (
                                        <Link
                                            key={listing.$id}
                                            href={`/properties/${listing.$id}`}
                                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                                        >
                                            <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden shrink-0">
                                                {listing.images?.[0] && (
                                                    <img
                                                        src={listing.images[0].startsWith('http') ? listing.images[0] : `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/listing_images/files/${listing.images[0]}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                                                    {listing.title}
                                                </h4>
                                                <p className="text-sm text-slate-500 truncate">{listing.location}</p>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> {listing.views_count || 0}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded ${listing.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {listing.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="font-bold text-slate-700 mb-2">No listings yet</h3>
                                    <p className="text-slate-500 text-sm mb-4">Create your first property listing</p>
                                    <Link
                                        href="/properties/create"
                                        className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium"
                                    >
                                        <Plus className="w-4 h-4" /> Add Listing
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Training Progress */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <BookOpen className="w-5 h-5 text-emerald-500" />
                                Training Progress
                            </h2>

                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">Overall Progress</span>
                                    <span className="font-bold text-emerald-600">{overallProgress}%</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                                        style={{ width: `${overallProgress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                {TRAINING_MODULES.slice(0, 4).map((module, idx) => {
                                    const isComplete = trainingProgress?.completedModules?.includes(module.id);
                                    return (
                                        <div key={module.id} className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isComplete
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {isComplete ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                                            </div>
                                            <span className={`text-sm truncate ${isComplete ? 'text-slate-600' : 'text-slate-400'}`}>
                                                {module.title}
                                            </span>
                                        </div>
                                    );
                                })}
                                {TRAINING_MODULES.length > 4 && (
                                    <div className="text-xs text-slate-400 pl-9">
                                        +{TRAINING_MODULES.length - 4} more modules
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/agent/training"
                                className="block w-full py-3 text-center bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                            >
                                {isTrainingComplete ? 'View Certificate' : 'Continue Training'}
                            </Link>
                        </div>

                        {/* Badges */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                Badges
                            </h2>
                            <div className="grid grid-cols-4 gap-2">
                                {Object.values(BADGES).slice(0, 8).map(badge => {
                                    const isEarned = earnedBadges.includes(badge.id);
                                    return (
                                        <div
                                            key={badge.id}
                                            className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${isEarned
                                                    ? 'bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-200'
                                                    : 'bg-slate-100 grayscale opacity-30'
                                                }`}
                                            title={badge.name}
                                        >
                                            {badge.icon}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                            <div className="space-y-2">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <Settings className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-700">Edit Profile</span>
                                </Link>
                                <Link
                                    href="/messages"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <MessageSquare className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-700">Messages</span>
                                </Link>
                                <Link
                                    href="/kyc"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <Shield className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-700">Verification Status</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
