'use client';

import { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { databases } from '@/appwrite';
import { DB_ID, COLLECTION_AUDIT_LOGS } from '@/appwrite/config';
=======
import { databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_AUDIT_LOGS } from '@/lib/constants';
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d
import { Query } from 'appwrite';
import { toast } from 'sonner';
import {
    FileText, Loader2, Search, User, Globe, Calendar,
    ArrowRight, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const queries = [
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE),
                Query.offset(offset)
            ];

            if (searchQuery) {
                // Ideally we'd search, but Appwrite search requires specific index configuration
                // For now, we'll rely on recent logs. 
                // Alternatively, we could filter client-side if dataset was small, but it's not.
                // Or search by user_id if query matches UUID format.
            }

            const response = await databases.listDocuments(
                DB_ID,
                COLLECTION_AUDIT_LOGS,
                queries
            );
            setLogs(response.documents);
            setTotal(response.total);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
<<<<<<< HEAD
    }, [offset]);
=======
    }, [offset, searchQuery]);
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleNext = () => {
        if (offset + ITEMS_PER_PAGE < total) {
            setOffset(prev => prev + ITEMS_PER_PAGE);
        }
    };

    const handlePrev = () => {
        if (offset - ITEMS_PER_PAGE >= 0) {
            setOffset(prev => prev - ITEMS_PER_PAGE);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-emerald-600" />
                    System Audit Logs
                </h2>
                <div className="text-sm text-slate-500">
                    Showing {offset + 1}-{Math.min(offset + ITEMS_PER_PAGE, total)} of {total}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Resource</th>
                                <th className="px-6 py-4">IP Address</th>
                                <th className="px-6 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.$id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                {new Date(log.$createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600" title={log.user_id}>
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                {log.user_id.substring(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`
                                                inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                                                ${log.action.includes('delete') ? 'bg-red-100 text-red-700' : ''}
                                                ${log.action.includes('create') ? 'bg-emerald-100 text-emerald-700' : ''}
                                                ${log.action.includes('update') ? 'bg-blue-100 text-blue-700' : ''}
                                                ${!['create', 'update', 'delete'].some(a => log.action.includes(a)) ? 'bg-slate-100 text-slate-700' : ''}
                                            `}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="font-medium text-slate-900">{log.resource_type}</span>
                                            {log.resource_id && <span className="text-slate-400 ml-1 text-xs">#{log.resource_id.substring(0, 6)}</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-3.5 h-3.5 text-slate-300" />
                                                {log.ip_address || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={offset === 0 || loading}
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={offset + ITEMS_PER_PAGE >= total || loading}
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    Log Details
                                    <span className="text-sm font-normal text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                                        {selectedLog.$id}
                                    </span>
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">{new Date(selectedLog.$createdAt).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 rotate-90" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Actor</h4>
                                    <p className="font-mono text-sm">{selectedLog.user_id}</p>
                                    <p className="text-sm text-slate-600 mt-1">{selectedLog.ip_address}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Action</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{selectedLog.action}</span>
                                        <ArrowRight className="w-4 h-4 text-slate-400" />
                                        <span className="font-bold text-slate-900">{selectedLog.resource_type}</span>
                                    </div>
                                    <p className="text-xs font-mono text-slate-500 mt-1">Ref: {selectedLog.resource_id}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Raw Details</h4>
                                <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                                    {selectedLog.details ?
                                        JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2)
                                        : 'No additional details provided.'
                                    }
                                </pre>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
