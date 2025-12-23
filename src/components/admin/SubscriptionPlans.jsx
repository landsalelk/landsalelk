'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/appwrite';
import { DB_ID, COLLECTION_SUBSCRIPTION_PLANS } from '@/appwrite/config';
import { ID, Query } from 'appwrite';
import { toast } from 'sonner';
import {
    CreditCard, Plus, Edit2, Save, Trash2,
    Loader2, Check, X, Calendar, DollarSign
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

export function SubscriptionPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await databases.listDocuments(
                DB_ID,
                COLLECTION_SUBSCRIPTION_PLANS,
                [Query.orderAsc('price')] // Sort by price usually makes sense
            );
            setPlans(response.documents);
        } catch (error) {
            // console.error('Failed to fetch plans:', error);
            toast.error('Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = {
                name: editingPlan.name,
                price: parseInt(editingPlan.price),
                duration_days: parseInt(editingPlan.duration_days),
                features: editingPlan.features,
                is_active: editingPlan.is_active
            };

            if (editingPlan.$id) {
                await databases.updateDocument(
                    DB_ID,
                    COLLECTION_SUBSCRIPTION_PLANS,
                    editingPlan.$id,
                    data
                );
                setPlans(prev => prev.map(p => p.$id === editingPlan.$id ? { ...p, ...data } : p));
                toast.success('Plan updated successfully');
            } else {
                const response = await databases.createDocument(
                    DB_ID,
                    COLLECTION_SUBSCRIPTION_PLANS,
                    ID.unique(),
                    data
                );
                setPlans([...plans, response]);
                toast.success('Plan created successfully');
            }
            setEditingPlan(null);
        } catch (error) {
            // console.error(error);
            toast.error('Failed to save plan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? Removing a plan might affect historical data if not handled carefully. Use "Deactivate" instead if possible.')) return;
        try {
            await databases.deleteDocument(DB_ID, COLLECTION_SUBSCRIPTION_PLANS, id);
            setPlans(prev => prev.filter(p => p.$id !== id));
            toast.success('Plan deleted');
        } catch (error) {
            toast.error('Failed to delete plan');
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                    Subscription Plans
                </h2>
                <button
                    onClick={() => setEditingPlan({
                        name: '', price: '0', duration_days: '30',
                        features: 'Listing: 5\nFeatured: 1\nSupport: Basic', is_active: true
                    })}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.$id} className={`bg-white p-6 rounded-2xl shadow-sm border ${plan.is_active ? 'border-slate-100' : 'border-amber-200 bg-amber-50'} hover:shadow-md transition-shadow relative group`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                                <div className="flex items-center gap-1 text-slate-500 font-medium">
                                    <span className="text-2xl font-bold text-slate-900">LKR {plan.price.toLocaleString()}</span>
                                    <span className="text-xs">/ {plan.duration_days} days</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingPlan(plan)}
                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.$id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-100">
                            <ul className="space-y-2">
                                {(plan.features || '').split('\n').filter(Boolean).map((feature, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                        <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {!plan.is_active && (
                            <div className="mt-4 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                                <X className="w-3 h-3" /> Inactive Plan
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            {editingPlan.$id ? <Edit2 className="w-5 h-5 text-emerald-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
                            {editingPlan.$id ? 'Edit Plan' : 'Create Plan'}
                        </h3>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Plan Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editingPlan.name}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-colors"
                                    placeholder="e.g., Professional Tier"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Price (LKR)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={editingPlan.price}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Duration (Days)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={editingPlan.duration_days}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, duration_days: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Features (One per line)</label>
                                <textarea
                                    required
                                    value={editingPlan.features}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value })}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-colors h-32 resize-y text-sm"
                                    placeholder="5 Listings&#10;Verified Badge&#10;Priority Support"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={editingPlan.is_active}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-slate-700">Active Plan</label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingPlan(null)}
                                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            <Save className="w-5 h-5" /> Save Plan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Plan"
                message='Are you sure? Removing a plan might affect historical data if not handled carefully. Use "Deactivate" instead if possible.'
                confirmText="Delete"
                isDanger={true}
                isLoading={deleting}
            />
        </div>
    );
}
