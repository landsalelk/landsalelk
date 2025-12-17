'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_SETTINGS, COLLECTION_SEO_META } from '@/lib/constants';
import { Query, ID } from 'appwrite';
import { Save, RefreshCw, Globe, Settings as SettingsIcon, Search, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({});
    const [seoMeta, setSeoMeta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load settings
            const settingsRes = await databases.listDocuments(DB_ID, COLLECTION_SETTINGS);
            const settingsObj = {};
            settingsRes.documents.forEach(doc => {
                settingsObj[doc.key] = { id: doc.$id, value: doc.value };
            });
            setSettings(settingsObj);

            // Load SEO meta
            const seoRes = await databases.listDocuments(DB_ID, COLLECTION_SEO_META);
            setSeoMeta(seoRes.documents);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        setLoading(false);
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], value }
        }));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            for (const [key, data] of Object.entries(settings)) {
                if (data.id) {
                    await databases.updateDocument(DB_ID, COLLECTION_SETTINGS, data.id, { value: data.value });
                } else {
                    await databases.createDocument(DB_ID, COLLECTION_SETTINGS, ID.unique(), { key, value: data.value });
                }
            }
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        }
        setSaving(false);
    };

    const updateSeoMeta = async (id, updates) => {
        try {
            await databases.updateDocument(DB_ID, COLLECTION_SEO_META, id, updates);
            setSeoMeta(prev => prev.map(m => m.$id === id ? { ...m, ...updates } : m));
            toast.success('SEO meta updated');
        } catch (error) {
            toast.error('Failed to update SEO meta');
        }
    };

    const addSeoMeta = async () => {
        try {
            const newMeta = await databases.createDocument(DB_ID, COLLECTION_SEO_META, ID.unique(), {
                page_path: '/new-page',
                title: 'Page Title',
                description: 'Page description',
                keywords: ''
            });
            setSeoMeta(prev => [...prev, newMeta]);
            toast.success('New SEO entry added');
        } catch (error) {
            toast.error('Failed to add SEO entry');
        }
    };

    const deleteSeoMeta = async (id) => {
        try {
            await databases.deleteDocument(DB_ID, COLLECTION_SEO_META, id);
            setSeoMeta(prev => prev.filter(m => m.$id !== id));
            toast.success('SEO entry deleted');
        } catch (error) {
            toast.error('Failed to delete SEO entry');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                        <div className="bg-white rounded-xl p-6 space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-10 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-10 bg-gray-200 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                        <p className="text-gray-500">Manage site configuration and SEO</p>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                            activeTab === 'general' 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <SettingsIcon className="w-4 h-4" />
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('seo')}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                            activeTab === 'seo' 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Globe className="w-4 h-4" />
                        SEO Meta
                    </button>
                </div>

                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-6">General Settings</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Site Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.site_name?.value || ''}
                                    onChange={(e) => handleSettingChange('site_name', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    placeholder="LandSale.lk"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.contact_email?.value || ''}
                                    onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    placeholder="support@landsale.lk"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    value={settings.contact_phone?.value || ''}
                                    onChange={(e) => handleSettingChange('contact_phone', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    placeholder="+94 11 234 5678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Default Currency
                                </label>
                                <select
                                    value={settings.default_currency?.value || 'LKR'}
                                    onChange={(e) => handleSettingChange('default_currency', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="LKR">LKR - Sri Lankan Rupee</option>
                                    <option value="USD">USD - US Dollar</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Listing Expiry Days
                                </label>
                                <input
                                    type="number"
                                    value={settings.listing_expiry_days?.value || '30'}
                                    onChange={(e) => handleSettingChange('listing_expiry_days', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                )}

                {/* SEO Meta */}
                {activeTab === 'seo' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">SEO Meta Tags</h2>
                            <button
                                onClick={addSeoMeta}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Page
                            </button>
                        </div>

                        {seoMeta.length > 0 ? (
                            seoMeta.map(meta => (
                                <div key={meta.$id} className="bg-white rounded-xl p-6 shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={meta.page_path}
                                                onChange={(e) => updateSeoMeta(meta.$id, { page_path: e.target.value })}
                                                className="font-medium text-lg border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none w-full"
                                                placeholder="/page-path"
                                            />
                                        </div>
                                        <button
                                            onClick={() => deleteSeoMeta(meta.$id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={meta.title || ''}
                                                onChange={(e) => updateSeoMeta(meta.$id, { title: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                                placeholder="Page Title"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Description</label>
                                            <textarea
                                                value={meta.description || ''}
                                                onChange={(e) => updateSeoMeta(meta.$id, { description: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                                rows={2}
                                                placeholder="Page description for search engines"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Keywords</label>
                                            <input
                                                type="text"
                                                value={meta.keywords || ''}
                                                onChange={(e) => updateSeoMeta(meta.$id, { keywords: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                                placeholder="keyword1, keyword2, keyword3"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl p-12 text-center">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-800 mb-2">No SEO meta entries</h3>
                                <p className="text-gray-500">Add SEO meta tags for better search engine visibility.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
