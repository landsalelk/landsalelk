'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/appwrite';
import { DB_ID, COLLECTION_EMAIL_TEMPLATES } from '@/appwrite/config';
import { ID, Query } from 'appwrite';
import { toast } from 'sonner';
import {
    Mail, Plus, Edit2, Save, Trash2,
    Loader2, Variable, Info
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

export function EmailTemplates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await databases.listDocuments(
                DB_ID,
                COLLECTION_EMAIL_TEMPLATES,
                [Query.orderAsc('name')]
            );
            setTemplates(response.documents);
        } catch (error) {
            // console.error('Failed to fetch templates:', error);
            toast.error('Failed to load email templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = {
                name: editingTemplate.name,
                subject: editingTemplate.subject,
                body: editingTemplate.body,
                variables: editingTemplate.variables
            };

            if (editingTemplate.$id) {
                await databases.updateDocument(
                    DB_ID,
                    COLLECTION_EMAIL_TEMPLATES,
                    editingTemplate.$id,
                    data
                );
                setTemplates(prev => prev.map(t => t.$id === editingTemplate.$id ? { ...t, ...data } : t));
                toast.success('Template updated successfully');
            } else {
                const response = await databases.createDocument(
                    DB_ID,
                    COLLECTION_EMAIL_TEMPLATES,
                    ID.unique(),
                    data
                );
                setTemplates([...templates, response]);
                toast.success('Template created successfully');
            }
            setEditingTemplate(null);
        } catch (error) {
            // console.error(error);
            toast.error('Failed to save template');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this template? System emails depending on it may fail.')) return;
        try {
            await databases.deleteDocument(DB_ID, COLLECTION_EMAIL_TEMPLATES, id);
            setTemplates(prev => prev.filter(t => t.$id !== id));
            toast.success('Template deleted');
        } catch (error) {
            toast.error('Failed to delete template');
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Mail className="w-6 h-6 text-emerald-600" />
                    Email Templates
                </h2>
                <button
                    onClick={() => setEditingTemplate({ name: '', subject: '', body: '', variables: '' })}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    New Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.$id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{template.name}</h3>
                                <p className="text-xs text-slate-500 font-mono mt-1">ID: {template.$id}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingTemplate(template)}
                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(template.$id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase">Subject</span>
                                <p className="text-sm text-slate-700 font-medium truncate">{template.subject}</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase">Variables</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {(template.variables || '').split(',').map(v => v.trim()).filter(Boolean).map((v, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono rounded">
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            {editingTemplate.$id ? <Edit2 className="w-5 h-5 text-emerald-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
                            {editingTemplate.$id ? 'Edit Template' : 'Create Template'}
                        </h3>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Template Name (Internal)</label>
                                <input
                                    type="text"
                                    required
                                    value={editingTemplate.name}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-colors"
                                    placeholder="e.g., welcome_email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={editingTemplate.subject}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-colors"
                                    placeholder="Welcome to LandSale.lk!"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Available Variables (comma separated)</label>
                                <div className="relative">
                                    <Variable className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        value={editingTemplate.variables}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, variables: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-colors font-mono tfext-sm"
                                        placeholder="{name}, {link}"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    Define placeholders used in the body.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">HTML Body</label>
                                <textarea
                                    required
                                    value={editingTemplate.body}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-colors font-mono text-sm h-64 resize-y"
                                    placeholder="<h1>Hello {name}</h1>..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingTemplate(null)}
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
                                            <Save className="w-5 h-5" /> Save Template
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
                title="Delete Template"
                message="Delete this template? System emails depending on it may fail."
                confirmText="Delete"
                isDanger={true}
                isLoading={deleting}
            />
        </div>
    );
}
