'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_COUPONS } from '@/lib/constants';
import { ID, Query } from 'appwrite';
import { toast } from 'sonner';
import {
    Ticket, Plus, Trash2, Calendar, Percent,
    Loader2, AlertCircle, Copy
} from 'lucide-react';

export function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discount_percent: 10,
        valid_until: '',
        max_uses: 100
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            // Fetch all coupons, ordered by creation (newest first)
            const response = await databases.listDocuments(
                DB_ID,
                COLLECTION_COUPONS,
                [Query.orderDesc('$createdAt')]
            );
            setCoupons(response.documents);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon? This cannot be undone.')) return;

        try {
            await databases.deleteDocument(DB_ID, COLLECTION_COUPONS, id);
            setCoupons(prev => prev.filter(c => c.$id !== id));
            toast.success('Coupon deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete coupon');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = {
                code: formData.code.toUpperCase(),
                discount_percent: parseInt(formData.discount_percent),
                valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
                max_uses: parseInt(formData.max_uses),
                used_count: 0,
                is_active: true
            };

            const response = await databases.createDocument(
                DB_ID,
                COLLECTION_COUPONS,
                ID.unique(),
                data
            );

            setCoupons([response, ...coupons]);
            setIsCreateOpen(false);
            setFormData({ code: '', discount_percent: 10, valid_until: '', max_uses: 100 });
            toast.success('Coupon created successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create coupon. Code might be duplicate.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    const isActive = (coupon) => {
        if (!coupon.is_active) return false;
        if (coupon.max_uses && coupon.used_count >= coupon.max_uses) return false;
        if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) return false;
        return true;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Ticket className="w-6 h-6 text-emerald-600" />
                    Manage Coupons
                </h2>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    New Coupon
                </button>
            </div>

            {coupons.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ticket className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Coupons Found</h3>
                    <p className="text-slate-500 mb-6">Create your first discount coupon to get started.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Discount</th>
                                    <th className="px-6 py-4">Usage</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Expiry</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.$id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono font-bold text-slate-700 select-all">
                                                    {coupon.code}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(coupon.code);
                                                        toast.success('Copied!');
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-sm">
                                                {coupon.discount_percent}% OFF
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium text-slate-900">{coupon.used_count || 0}</span>
                                                <span className="text-slate-400">/ {coupon.max_uses || '∞'}</span>
                                            </div>
                                            {coupon.max_uses && (
                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className="h-full bg-slate-400"
                                                        style={{ width: `${Math.min((coupon.used_count / coupon.max_uses) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isActive(coupon) ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'No expiry'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(coupon.$id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete Coupon"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-up">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-emerald-600" />
                            Create New Coupon
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Coupon Code</label>
                                <div className="relative">
                                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') }))}
                                        placeholder="SUMMER-SALE-2025"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-mono uppercase"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Uppercase letters, numbers, and dashes only.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Discount (%)</label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="100"
                                            value={formData.discount_percent}
                                            onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: e.target.value }))}
                                            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Max Uses</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Valid Until (Optional)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
