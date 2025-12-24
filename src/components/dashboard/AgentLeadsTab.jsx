'use client';

import { useState, useEffect, useCallback } from 'react';
import { account } from '@/appwrite';
import { getAgentLeads, updateLeadStatus, LeadStatus } from '@/lib/agentLeads';
import { Phone, Mail, Calendar, Clock, User, ChevronDown, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentLeadsTab() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [user, setUser] = useState(null);

    const loadUser = useCallback(async () => {
        try {
            const userData = await account.get();
            setUser(userData);
            loadLeads(userData.$id);
        } catch {
            setUser(null);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const loadLeads = async (agentId) => {
        setLoading(true);
        const result = await getAgentLeads(agentId);
        setLeads(result);
        setLoading(false);
    };

    const handleStatusChange = async (leadId, newStatus) => {
        const success = await updateLeadStatus(leadId, newStatus);
        if (success) {
            setLeads(prev => prev.map(l =>
                l.$id === leadId ? { ...l, status: newStatus } : l
            ));
            toast.success(`Lead status updated to ${newStatus}`);
        } else {
            toast.error('Failed to update lead status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case LeadStatus.NEW: return 'bg-blue-100 text-blue-700';
            case LeadStatus.CONTACTED: return 'bg-yellow-100 text-yellow-700';
            case LeadStatus.INTERESTED: return 'bg-purple-100 text-purple-700';
            case LeadStatus.NEGOTIATING: return 'bg-orange-100 text-orange-700';
            case LeadStatus.CONVERTED: return 'bg-green-100 text-green-700';
            case LeadStatus.LOST: return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredLeads = filter === 'all'
        ? leads
        : leads.filter(l => l.status === filter);

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === LeadStatus.NEW).length,
        converted: leads.filter(l => l.status === LeadStatus.CONVERTED).length,
        active: leads.filter(l => ![LeadStatus.CONVERTED, LeadStatus.LOST].includes(l.status)).length
    };

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">New</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.active}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Converted</p>
                    <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['all', ...Object.values(LeadStatus)].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === status
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {status === 'all' ? 'All Leads' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Leads List */}
            {filteredLeads.length > 0 ? (
                <div className="space-y-4">
                    {filteredLeads.map(lead => (
                        <div key={lead.$id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Avatar & Name */}
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {lead.name || 'Unknown'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {lead.property_interest || 'Property inquiry'}
                                        </p>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    {lead.phone && (
                                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-emerald-600">
                                            <Phone className="w-4 h-4" />
                                            {lead.phone}
                                        </a>
                                    )}
                                    {lead.email && (
                                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-emerald-600">
                                            <Mail className="w-4 h-4" />
                                            {lead.email}
                                        </a>
                                    )}
                                </div>

                                {/* Status & Actions */}
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                        {lead.status || 'new'}
                                    </span>

                                    <div className="relative group">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border py-2 min-w-[150px] hidden group-hover:block z-10">
                                            {Object.values(LeadStatus).map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusChange(lead.$id, status)}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes & Date */}
                            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(lead.$createdAt)}
                                </span>
                                {lead.notes && (
                                    <span className="flex items-center gap-1">
                                        <MessageCircle className="w-4 h-4" />
                                        {lead.notes}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl p-12 text-center">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No leads yet</h3>
                    <p className="text-gray-500">
                        When buyers inquire about properties, their leads will appear here.
                    </p>
                </div>
            )}
        </div>
    );
}
