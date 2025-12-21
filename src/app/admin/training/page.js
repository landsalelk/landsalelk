'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_AGENTS, COLLECTION_CERTIFICATES } from '@/appwrite/config';
import { TRAINING_MODULES, BADGES } from '@/lib/agent_training';
import { Query } from 'appwrite';
import {
    Loader2, Users, Award, BookOpen, TrendingUp,
    CheckCircle, Clock, XCircle, Search, Filter,
    ChevronDown, Download, Eye, Shield, GraduationCap,
    BarChart3, Calendar, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTrainingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [stats, setStats] = useState({
        totalAgents: 0,
        certified: 0,
        inProgress: 0,
        notStarted: 0,
        certificatesIssued: 0,
    });
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                // Verify admin access (in real app, check roles)
                await account.get();

                // Fetch agents
                const agentsResult = await databases.listDocuments(
                    DB_ID,
                    COLLECTION_AGENTS,
                    [Query.orderDesc('$createdAt'), Query.limit(100)]
                );
                setAgents(agentsResult.documents);

                // Fetch certificates
                let certsDocuments = [];
                try {
                    const certsResult = await databases.listDocuments(
                        DB_ID,
                        COLLECTION_CERTIFICATES,
                        [Query.orderDesc('issued_at'), Query.limit(100)]
                    );
                    certsDocuments = certsResult.documents;
                    setCertificates(certsDocuments);
                } catch (e) {
                    // Collection might not exist yet
                    // Certificates collection not set up yet - continue gracefully
                }

                // Calculate stats
                const certified = agentsResult.documents.filter(a => a.training_completed || a.verification_status === 'verified').length;
                const inProgress = agentsResult.documents.filter(a => !a.training_completed && a.training_progress_id).length;
                setStats({
                    totalAgents: agentsResult.documents.length,
                    certified,
                    inProgress,
                    notStarted: agentsResult.documents.length - certified - inProgress,
                    certificatesIssued: certsDocuments.length,
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

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = !searchTerm ||
            agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.email?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'certified') return matchesSearch && (agent.training_completed || agent.verification_status === 'verified');
        if (filter === 'in-progress') return matchesSearch && !agent.training_completed && agent.training_progress_id;
        if (filter === 'not-started') return matchesSearch && !agent.training_completed && !agent.training_progress_id;
        return matchesSearch;
    });

    const getStatusBadge = (agent) => {
        if (agent.training_completed || agent.verification_status === 'verified') {
            return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Certified</span>;
        }
        if (agent.training_progress_id) {
            return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> In Progress</span>;
        }
        return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">Not Started</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-emerald-500" />
                        Training Management
                    </h1>
                    <p className="text-slate-500">Monitor agent training progress and certifications</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalAgents}</div>
                        <div className="text-sm text-slate-500">Total Agents</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{stats.certified}</div>
                        <div className="text-sm text-slate-500">Certified</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">{stats.inProgress}</div>
                        <div className="text-sm text-slate-500">In Progress</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-400">{stats.notStarted}</div>
                        <div className="text-sm text-slate-500">Not Started</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                <Award className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">{stats.certificatesIssued}</div>
                        <div className="text-sm text-slate-500">Certificates</div>
                    </div>
                </div>

                {/* Training Modules Overview */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-500" />
                        Training Modules
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {TRAINING_MODULES.map((module, idx) => (
                            <div key={module.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                    </span>
                                    {module.timedQuiz && (
                                        <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold">TIMED</span>
                                    )}
                                </div>
                                <h4 className="font-semibold text-sm text-slate-700 truncate">{module.title}</h4>
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    {module.duration}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Agents Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-slate-900">Agent Training Status</h2>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search agents..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <select
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="all">All Agents</option>
                                    <option value="certified">Certified</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="not-started">Not Started</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase">Agent</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase">Progress</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase">Joined</th>
                                    <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAgents.length > 0 ? filteredAgents.map(agent => (
                                    <tr key={agent.$id} className="hover:bg-slate-50">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                                    {agent.name?.[0]?.toUpperCase() || 'A'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{agent.name || 'Unknown'}</div>
                                                    <div className="text-sm text-slate-500">{agent.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {getStatusBadge(agent)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="w-32">
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: agent.training_completed ? '100%' : '0%' }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500">
                                            {new Date(agent.$createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500">
                                            No agents found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
