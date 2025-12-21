'use client';

import { useState, useEffect, useCallback } from 'react';
import { databases } from '@/appwrite';
import { DB_ID, COLLECTION_AGENT_LEADS, COLLECTION_AGENTS } from '@/appwrite/config';
import { getUserListings } from '@/lib/properties';
import { Query, ID } from 'appwrite';
import { toast } from 'sonner';
import {
    Users, Phone, Mail, Calendar, MessageSquare,
    MoreHorizontal, Plus, Loader2, ArrowRight, Home
} from 'lucide-react';

const COLUMNS = [
    { id: 'new', label: 'New Leads', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'contacted', label: 'Contacted', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'viewing', label: 'Viewing Scheduled', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'negotiation', label: 'Negotiation', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'closed', label: 'Closed Deal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
];

export function LeadCRM({ userId }) {
    const [leads, setLeads] = useState([]);
    const [listings, setListings] = useState([]);
    const [agentProfile, setAgentProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // New Lead Form State
    const [newLead, setNewLead] = useState({
        name: '',
        phone: '',
        email: '',
        notes: '',
        status: 'new',
        property_id: ''
    });

    const initData = useCallback(async () => {
        try {
            setLoading(true);
            const [leadsRes, listingsRes, agentRes] = await Promise.allSettled([
                databases.listDocuments(
                    DB_ID,
                    COLLECTION_AGENT_LEADS,
                    [Query.equal('agent_user_id', userId), Query.orderDesc('$createdAt')]
                ),
                getUserListings(userId),
                databases.listDocuments(
                    DB_ID,
                    COLLECTION_AGENTS,
                    [Query.equal('user_id', userId), Query.limit(1)]
                )
            ]);

            // Handle Leads
            if (leadsRes.status === 'fulfilled') {
                setLeads(leadsRes.value.documents);
            }

            // Handle Listings
            if (listingsRes.status === 'fulfilled') {
                setListings(listingsRes.value);
            }

            // Handle Agent Profile
            if (agentRes.status === 'fulfilled' && agentRes.value.documents.length > 0) {
                setAgentProfile(agentRes.value.documents[0]);
            }
        } catch (error) {
            console.error("Error loading CRM data", error);
            toast.error("Failed to load CRM data");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            initData();
        }
    }, [userId, initData]);

    const handleCreateLead = async (e) => {
        e.preventDefault();

        if (!agentProfile) {
            toast.error("You need an Agent Profile to create leads. Please complete your profile.");
            return;
        }

        if (!newLead.property_id) {
            toast.error("Please select a property for this lead.");
            return;
        }

        const selectedProperty = listings.find(l => l.$id === newLead.property_id);

        try {
            // NOTE: The `agent_leads` collection schema does not currently support `customer_name`, `phone`, or `email` columns.
            // As a workaround, we serialize these details into the `notes` field.
            // Future schema updates should add these columns for better querying.
            const payload = {
                agent_id: agentProfile.$id,
                agent_user_id: userId,
                property_id: newLead.property_id,
                property_title: selectedProperty ? selectedProperty.title : 'Unknown Property',
                status: newLead.status,
                customer_name: newLead.name,
                customer_phone: newLead.phone,
                customer_email: newLead.email,
                notes: newLead.notes,
                created_at: new Date().toISOString()
            };

            const response = await databases.createDocument(
                DB_ID,
                COLLECTION_AGENT_LEADS,
                ID.unique(),
                payload
            );

            // Re-map for UI immediately
            const uiLead = {
                ...response,
                name: newLead.name,
                phone: newLead.phone,
                email: newLead.email
            };

            setLeads([uiLead, ...leads]);
            setIsAddModalOpen(false);
            setNewLead({ name: '', phone: '', email: '', notes: '', status: 'new', property_id: '' });
            toast.success('Lead added successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create lead');
        }
    };

    const updateLeadStatus = async (leadId, newStatus) => {
        try {
            await databases.updateDocument(
                DB_ID,
                COLLECTION_AGENT_LEADS,
                leadId,
                { status: newStatus }
            );
            setLeads(prev => prev.map(l => l.$id === leadId ? { ...l, status: newStatus } : l));
            toast.success(`Moved to ${COLUMNS.find(c => c.id === newStatus).label}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Helper to extract customer info from the notes field workaround
    const parseLead = (lead) => {
        // Optimistic check: if name is already present (e.g. from local state add), use it.
        if (lead.name) return lead;

        let name = "Unknown Lead";
        let phone = "";
        let email = "";

        // new schema check
        if (lead.customer_name) {
            name = lead.customer_name;
            phone = lead.customer_phone || "";
            email = lead.customer_email || "";
        } else {
            // Legacy Parsing logic for 'Key: Value' format stored in notes
            const noteSource = Array.isArray(lead.notes) ? lead.notes.join('\n') : (lead.notes || '');

            if (noteSource) {
                const nameMatch = noteSource.match(/Name: (.*)/);
                if (nameMatch) name = nameMatch[1];

                const phoneMatch = noteSource.match(/Phone: (.*)/);
                if (phoneMatch) phone = phoneMatch[1];

                const emailMatch = noteSource.match(/Email: (.*)/);
                if (emailMatch) email = emailMatch[1];
            }
        }

        return { ...lead, name, phone, email };
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" /></div>;

    if (!agentProfile && !loading) {
        return (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Agent Profile Required</h2>
                <p className="text-slate-500 mb-6">You need to set up your agent profile to manage leads.</p>
                <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">
                    Create Agent Profile
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in text-slate-800">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Lead CRM</h1>
                    <p className="text-slate-500 text-sm">Manage your potential clients pipeline</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200"
                >
                    <Plus className="w-5 h-5" />
                    New Lead
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-4 min-w-[1200px] h-full">
                    {COLUMNS.map(col => {
                        const colLeads = leads.filter(l => l.status === col.id).map(parseLead);
                        return (
                            <div key={col.id} className="flex-1 flex flex-col bg-slate-100 rounded-2xl min-w-[280px] max-w-xs">
                                {/* Column Header */}
                                <div className={`p-4 border-b border-black/5 rounded-t-2xl flex justify-between items-center ${col.color.split(' ')[0]}`}>
                                    <h3 className={`font-bold ${col.color.split(' ')[1]}`}>{col.label}</h3>
                                    <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs font-bold text-slate-700">
                                        {colLeads.length}
                                    </span>
                                </div>

                                {/* Cards Container */}
                                <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                    {colLeads.map(lead => (
                                        <div key={lead.$id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group relative">
                                            <h4 className="font-bold text-slate-900 mb-1">{lead.name}</h4>
                                            <div className="text-xs text-emerald-600 font-medium mb-2 flex items-center gap-1">
                                                <Home className="w-3 h-3" />
                                                <span className="truncate max-w-[150px]">{lead.property_title}</span>
                                            </div>

                                            <div className="space-y-1 mb-3">
                                                {lead.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Phone className="w-3 h-3" /> {lead.phone}
                                                    </div>
                                                )}
                                                {lead.email && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Mail className="w-3 h-3" />
                                                        <span className="truncate max-w-[180px]">{lead.email}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    {new Date(lead.$createdAt).toLocaleDateString()}
                                                </div>

                                                {/* Quick Move Actions */}
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {COLUMNS.indexOf(col) < COLUMNS.length - 1 && (
                                                        <button
                                                            onClick={() => updateLeadStatus(lead.$id, COLUMNS[COLUMNS.indexOf(col) + 1].id)}
                                                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-600"
                                                            title="Move Forward"
                                                        >
                                                            <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {colLeads.length === 0 && (
                                        <div className="text-center py-8 opacity-50">
                                            <div className="bg-black/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <Users className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <span className="text-xs font-medium text-slate-400">No leads</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Lead Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-up">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Add New Lead</h3>
                        <form onSubmit={handleCreateLead} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newLead.name}
                                    onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                                    placeholder="Jane Doe"
                                />
                            </div>

                            {/* Property Selector */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Interested Property</label>
                                <select
                                    required
                                    value={newLead.property_id}
                                    onChange={e => setNewLead({ ...newLead, property_id: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                                >
                                    <option value="">Select a property...</option>
                                    {listings.map(l => (
                                        <option key={l.$id} value={l.$id}>{l.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={newLead.phone}
                                        onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                                        placeholder="077..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={newLead.email}
                                        onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                                        placeholder="jane@..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Initial Status</label>
                                <select
                                    value={newLead.status}
                                    onChange={e => setNewLead({ ...newLead, status: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                                >
                                    {COLUMNS.map(col => (
                                        <option key={col.id} value={col.id}>{col.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
                                <textarea
                                    value={newLead.notes}
                                    onChange={e => setNewLead({ ...newLead, notes: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 h-24 resize-none"
                                    placeholder="Looking for a 3BHK in Colombo..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                                >
                                    Add Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
