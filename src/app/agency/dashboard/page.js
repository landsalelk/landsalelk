"use client";

import { useEffect, useState } from 'react';
import { account, databases, Query } from '@/lib/appwrite';
import { getAgencyByOwner } from '@/lib/agency';
import { useRouter } from 'next/navigation';
import {
    Loader2, ShieldCheck, Building2, UserCheck, Plus, LayoutDashboard,
    Users, Mail, Clock, CheckCircle, X, Send, UserPlus, Trash2, Home
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { sendAgentInvitation, getAgencyInvitations, cancelInvitation } from '@/actions/invitationActions';
import { DB_ID, COLLECTION_AGENTS } from '@/appwrite/config';

export default function AgencyDashboard() {
    const [agency, setAgency] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [agents, setAgents] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            try {
                const userData = await account.get();
                setUser(userData);
                const agencyDoc = await getAgencyByOwner(userData.$id);

                if (!agencyDoc) {
                    router.push('/agency/apply');
                    return;
                }

                setAgency(agencyDoc);

                // Fetch agents under this agency
                if (agencyDoc.status === 'approved') {
                    try {
                        const agentsRes = await databases.listDocuments(
                            DB_ID,
                            COLLECTION_AGENTS,
                            [
                                Query.equal('agency_id', agencyDoc.$id),
                                Query.limit(50)
                            ]
                        );
                        setAgents(agentsRes.documents);
                    } catch (e) {
                        console.warn("Could not fetch agents:", e);
                    }

                    // Fetch invitations
                    const inviteResult = await getAgencyInvitations(agencyDoc.$id);
                    if (inviteResult.success) {
                        setInvitations(inviteResult.invitations);
                    }
                }
            } catch (err) {
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    const handleSendInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail || !inviteEmail.includes('@')) {
            toast.error("Please enter a valid email address");
            return;
        }

        setSendingInvite(true);
        try {
            const result = await sendAgentInvitation(agency.$id, user.$id, inviteEmail);
            if (result.success) {
                toast.success(result.message);
                setInviteEmail('');
                setShowInviteModal(false);
                // Refresh invitations
                const inviteResult = await getAgencyInvitations(agency.$id);
                if (inviteResult.success) {
                    setInvitations(inviteResult.invitations);
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to send invitation");
        } finally {
            setSendingInvite(false);
        }
    };

    const handleCancelInvite = async (inviteId) => {
        if (!confirm("Cancel this invitation?")) return;

        try {
            const result = await cancelInvitation(inviteId, user.$id);
            if (result.success) {
                setInvitations(prev => prev.filter(i => i.$id !== inviteId));
                toast.success("Invitation cancelled");
            } else {
                toast.error(result.message);
            }
        } catch (e) {
            toast.error("Failed to cancel invitation");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#10b981]" /></div>;

    if (!agency) return null;

    if (agency.status === 'pending') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-xl">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Application Pending</h1>
                    <p className="text-slate-600 mb-6">
                        Your application for <strong>{agency.name}</strong> is currently under review by our admin team.
                        We will verify your lawyer details ({agency.lawyer_name}) and notify you soon.
                    </p>
                    <Link href="/dashboard" className="text-[#10b981] font-bold hover:underline">
                        Return to Main Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (agency.status === 'rejected') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-xl">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Application Rejected</h1>
                    <p className="text-slate-600">Please contact support for more information.</p>
                </div>
            </div>
        );
    }

    const pendingInvites = invitations.filter(i => i.status === 'pending');
    const acceptedInvites = invitations.filter(i => i.status === 'accepted');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-8 h-8 text-[#10b981]" />
                            <span className="text-xl font-bold text-slate-800">Partner Agency Hub</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-[#10b981]/10 text-[#10b981] px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                <UserCheck className="w-4 h-4" />
                                {agency.name} (Verified)
                            </div>
                            <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">
                                Switch to User View
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Status</h3>
                        <div className="mt-2 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-[#10b981]" />
                            <span className="text-xl font-bold text-slate-800">Verified</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">By {agency.lawyer_name}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Agents</h3>
                        <div className="mt-2 flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-500" />
                            <span className="text-2xl font-bold text-slate-800">{agents.length}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{pendingInvites.length} pending invites</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Listings</h3>
                        <div className="mt-2 flex items-center gap-2">
                            <Home className="w-6 h-6 text-purple-500" />
                            <span className="text-2xl font-bold text-slate-800">{agency.total_listings || 0}</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Public Profile</h3>
                        <Link
                            href={`/agency/${agency.slug}`}
                            className="mt-2 text-emerald-600 font-bold hover:underline flex items-center gap-1"
                        >
                            View Profile →
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link href="/properties/create" className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#10b981]/20 transition-colors">
                            <Plus className="w-6 h-6 text-[#10b981]" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">Create Listing</h3>
                        <p className="text-sm text-slate-500">Post a verified property</p>
                    </Link>

                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left"
                    >
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                            <UserPlus className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">Invite Agent</h3>
                        <p className="text-sm text-slate-500">Add agents to your team</p>
                    </button>

                    <Link href={`/agency/${agency.slug}`} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                            <LayoutDashboard className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">Public Profile</h3>
                        <p className="text-sm text-slate-500">View your agency page</p>
                    </Link>

                    <Link href="/dashboard" className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                            <Home className="w-6 h-6 text-slate-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">My Dashboard</h3>
                        <p className="text-sm text-slate-500">Go to personal dashboard</p>
                    </Link>
                </div>

                {/* Team Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Agents List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Team Members</h3>
                            <span className="text-sm text-slate-500">{agents.length} agents</span>
                        </div>

                        {agents.length > 0 ? (
                            <div className="space-y-3">
                                {agents.map(agent => (
                                    <div key={agent.$id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                            {agent.name?.charAt(0) || 'A'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-800">{agent.name}</p>
                                            <p className="text-xs text-slate-500">{agent.email}</p>
                                        </div>
                                        {agent.is_verified && (
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p>No agents yet</p>
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="mt-2 text-emerald-600 font-bold hover:underline"
                                >
                                    Invite your first agent
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pending Invitations */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Pending Invitations</h3>
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="text-sm text-emerald-600 font-bold hover:underline flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> New
                            </button>
                        </div>

                        {pendingInvites.length > 0 ? (
                            <div className="space-y-3">
                                {pendingInvites.map(invite => (
                                    <div key={invite.$id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-800">{invite.invitee_email}</p>
                                            <p className="text-xs text-amber-600 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Expires {new Date(invite.expires_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleCancelInvite(invite.$id)}
                                            className="p-2 text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Mail className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p>No pending invitations</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-800">Invite Agent</h3>
                            <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <p className="text-slate-600 mb-4">
                            Send an invitation to an agent to join <strong>{agency.name}</strong>.
                            They will receive an email with a link to accept.
                        </p>

                        <form onSubmit={handleSendInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Agent Email Address
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="agent@example.com"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingInvite}
                                    className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {sendingInvite ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Invite
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
