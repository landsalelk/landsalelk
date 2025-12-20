'use client';

import { useState, useEffect } from 'react';
import { account, storage } from '@/lib/appwrite';
import { getPendingKYCRequests, updateKYCStatus, getKYCFileView } from '@/lib/kyc';
import { getPlatformStats } from '@/lib/analytics';
import { ShieldCheck, XCircle, CheckCircle, Loader2, FileText, AlertTriangle, TrendingUp, Users, Wallet, Building, MessageSquare, Star, Trash2, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { BUCKET_KYC, DB_ID, COLLECTION_REVIEWS } from '@/lib/constants';
import { AdminCoupons } from '@/components/admin/AdminCoupons';
import { AuditLogs } from '@/components/admin/AuditLogs';
import { EmailTemplates } from '@/components/admin/EmailTemplates';
import { SubscriptionPlans } from '@/components/admin/SubscriptionPlans';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminAgents } from '@/components/admin/AdminAgents';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ totalListings: 0, totalUsers: 0, verifiedUsers: 0, totalRevenue: 0 });
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('kyc');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await account.get();
                // In a real app, check user.labels.includes('admin') or team membership
                // For this demo, we'll try to fetch requests. If it fails (401/403), not admin.
                try {
                    const [pending, platformStats, pendingReviews] = await Promise.all([
                        getPendingKYCRequests(),
                        getPlatformStats(),
                        databases.listDocuments(DB_ID, COLLECTION_REVIEWS, [
                            Query.equal('is_approved', false),
                            Query.orderDesc('$createdAt')
                        ])
                    ]);
                    setRequests(pending);
                    setStats(platformStats);
                    setReviews(pendingReviews.documents);
                    setIsAdmin(true);
                } catch (err) {
                    // Not admin
                }
            } catch (e) {
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleDecision = async (id, status) => {
        try {
            await updateKYCStatus(id, status);
            toast.success(`Request ${status} successfully`);
            setRequests(prev => prev.filter(r => r.$id !== id));
        } catch (e) {
            toast.error("Action failed");
            console.error(e);
        }
    };

    const handleReviewDecision = async (id, action) => {
        try {
            if (action === 'approve') {
                await databases.updateDocument(DB_ID, COLLECTION_REVIEWS, id, { is_approved: true });
                toast.success("Review approved!");
            } else {
                await databases.deleteDocument(DB_ID, COLLECTION_REVIEWS, id);
                toast.success("Review deleted");
            }
            setReviews(prev => prev.filter(r => r.$id !== id));
        } catch (e) {
            toast.error("Failed to process review");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (!isAdmin && requests.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
                <p className="text-slate-500 mb-6 text-center max-w-md">
                    You do not have permission to view this page. Ensure you are logged in as an administrator (Label: admin or Team: admins).
                </p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-900 text-white rounded-lg">Retry</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-emerald-600" />
                        Admin Portal
                    </h1>
                    <p className="text-slate-500">Manage identity verification requests.</p>
                </header>

                {/* Analytics Cards */}
                {/* ... (leaving analytics as is for now) ... */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {/* ... (reconstruct analytics cards) ... */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="text-slate-500 font-medium">Est. Revenue</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">LKR {stats.totalRevenue.toLocaleString()}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Building className="w-6 h-6" />
                            </div>
                            <span className="text-slate-500 font-medium">Total Listings</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.totalListings}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="text-slate-500 font-medium">KYC Requests</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.totalUsers}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="text-slate-500 font-medium">Verified Members</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.verifiedUsers}</h3>
                    </div>
                </div>

                <div className="flex gap-4 mb-8 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('kyc')}
                        className={`pb-4 px-2 font-bold transition-all ${activeTab === 'kyc' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        KYC Requests ({requests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-4 px-2 font-bold transition-all ${activeTab === 'reviews' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Pending Reviews ({reviews.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('coupons')}
                        className={`pb-4 px-2 font-bold transition-all ${activeTab === 'coupons' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Coupons
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`pb-4 px-2 font-bold transition-all ${activeTab === 'logs' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Audit Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`pb-4 px-2 font-bold transition-all ${activeTab === 'templates' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Email Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`pb-4 px-2 font-bold transition-all ${activeTab === 'plans' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Plans
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 px-2 font-bold transition-all ${activeTab === 'users' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('agents')}
                        className={`pb-4 px-2 font-bold transition-all ${activeTab === 'agents' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Agents
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`pb-4 px-2 font-bold transition-all ${activeTab === 'analytics' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Analytics
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {activeTab === 'agents' && <AdminAgents />}
                    {activeTab === 'kyc' && (
                        requests.length === 0 ? (
                            <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
                                <CheckCircle className="w-16 h-16 text-emerald-100 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
                                <p className="text-slate-500">No pending KYC requests.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div key={req.$id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
                                    {/* Metadata using our storage file view logic could be added here if we had direct access to User name */}
                                    <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">
                                                {req.request_type}
                                            </span>
                                            <span className="text-slate-400 text-xs">{new Date(req.submitted_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-bold text-lg mb-1">User ID: {req.user_id}</h3>
                                        <p className="text-xs text-slate-400 font-mono mb-6">{req.$id}</p>

                                        <div className="space-y-3">
                                            <button
                                                onClick={() => handleDecision(req.$id, 'approved')}
                                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleDecision(req.$id, 'rejected')}
                                                className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                        </div>
                                    </div>

                                    {/* Images Preview */}
                                    <div className="p-6 md:w-2/3 bg-slate-50 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Front ID</p>
                                            <div className="aspect-video bg-white rounded-lg border border-slate-200 overflow-hidden relative group">
                                                {/* We use getKYCFileView to generate the URL */}
                                                <Image
                                                    src={storage.getFileView(BUCKET_KYC, req.nic_front_id)}
                                                    alt="NIC Front"
                                                    fill
                                                    className="w-full h-full object-cover"
                                                />
                                                <a
                                                    href={storage.getFileView(BUCKET_KYC, req.nic_front_id)}
                                                    target="_blank"
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FileText className="w-6 h-6" />
                                                </a>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Back ID</p>
                                            <div className="aspect-video bg-white rounded-lg border border-slate-200 overflow-hidden relative group">
                                                <Image
                                                    src={storage.getFileView(BUCKET_KYC, req.nic_back_id)}
                                                    alt="NIC Back"
                                                    fill
                                                    className="w-full h-full object-cover"
                                                />
                                                <a
                                                    href={storage.getFileView(BUCKET_KYC, req.nic_back_id)}
                                                    target="_blank"
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FileText className="w-6 h-6" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    )}

                    {activeTab === 'reviews' && (
                        reviews.length === 0 ? (
                            <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
                                <MessageSquare className="w-16 h-16 text-emerald-100 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900">No pending reviews</h3>
                                <p className="text-slate-500">All user reviews have been moderated.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Reviewer</th>
                                            <th className="px-6 py-4">Target (Agent/Listing)</th>
                                            <th className="px-6 py-4">Rating</th>
                                            <th className="px-6 py-4">Comment</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {reviews.map(rev => (
                                            <tr key={rev.$id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {rev.user_id}
                                                    <span className="block text-xs text-slate-400 font-mono mt-0.5">{new Date(rev.$createdAt).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {rev.agent_id ? 'Agent: ' + rev.agent_id : 'Listing: ' + rev.listing_id}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 text-amber-400">
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <span className="font-bold text-slate-700">{rev.rating}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                                    {rev.comment}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleReviewDecision(rev.$id, 'approve')}
                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReviewDecision(rev.$id, 'delete')}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>

                {activeTab === 'coupons' && <AdminCoupons />}
                {activeTab === 'logs' && <AuditLogs />}
                {activeTab === 'templates' && <EmailTemplates />}
                {activeTab === 'plans' && <SubscriptionPlans />}
                {activeTab === 'users' && <AdminUsers />}
                {activeTab === 'analytics' && <AnalyticsDashboard />}
            </div>
        </div>
    );
}
