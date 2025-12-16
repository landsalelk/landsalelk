'use client';

import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { getPendingKYCRequests, updateKYCStatus, getKYCFileView } from '@/lib/kyc';
import { getPlatformStats } from '@/lib/analytics';
import { ShieldCheck, XCircle, CheckCircle, Loader2, FileText, AlertTriangle, TrendingUp, Users, Wallet, Building } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({ totalListings: 0, totalUsers: 0, verifiedUsers: 0, totalRevenue: 0 });
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const user = await account.get();
            // In a real app, check user.labels.includes('admin') or team membership
            // For this demo, we'll try to fetch requests. If it fails (401/403), not admin.
            try {
                const [pending, platformStats] = await Promise.all([
                    getPendingKYCRequests(),
                    getPlatformStats()
                ]);
                setRequests(pending);
                setStats(platformStats);
                setIsAdmin(true);
            } catch (err) {
                console.error("Not admin");
                // router.push('/'); // Uncomment to enforce redirect
            }
        } catch (e) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
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

                <div className="grid grid-cols-1 gap-6">
                    {requests.length === 0 ? (
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
                                            <img src={`https://cloud.appwrite.io/v1/storage/buckets/kyc_documents/files/${req.nic_front_id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`} className="w-full h-full object-cover" />
                                            <a
                                                href={`https://cloud.appwrite.io/v1/storage/buckets/kyc_documents/files/${req.nic_front_id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
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
                                            <img src={`https://cloud.appwrite.io/v1/storage/buckets/kyc_documents/files/${req.nic_back_id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`} className="w-full h-full object-cover" />
                                            <a
                                                href={`https://cloud.appwrite.io/v1/storage/buckets/kyc_documents/files/${req.nic_back_id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
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
                    )}
                </div>
            </div>
        </div>
    );
}
