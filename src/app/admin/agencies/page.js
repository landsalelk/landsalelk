"use client";

import { useState, useEffect } from 'react';
import { databases, Query } from '@/lib/appwrite';
import { DB_ID, COLLECTION_AGENCIES } from '@/appwrite/config';
import { approveAgency, rejectAgency } from '@/actions/agencyActions'; // We need a way to call these SA from client UI components
import { Loader2, Check, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAgenciesPage() {
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAgencies = async () => {
        setLoading(true);
        try {
            const result = await databases.listDocuments(
                DB_ID,
                COLLECTION_AGENCIES,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            setAgencies(result.documents);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load agencies");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgencies();
    }, []);

    const handleApprove = async (agencyId, ownerId) => {
        if (!confirm("Are you sure you want to approve this agency? This will assign the Agency Manager role.")) return;

        toast.promise(approveAgency(agencyId, ownerId), {
            loading: 'Approving...',
            success: () => {
                fetchAgencies(); // refresh
                return "Agency approved successfully";
            },
            error: (err) => `Error: ${err.message}`
        });
    };

    const handleReject = async (agencyId) => {
        if (!confirm("Reject this application?")) return;

        toast.promise(rejectAgency(agencyId), {
            loading: 'Rejecting...',
            success: () => {
                fetchAgencies();
                return "Agency rejected";
            },
            error: (err) => `Error: ${err.message}`
        });
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Agency Applications</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lawyer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {agencies.map((agency) => (
                            <tr key={agency.$id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{agency.name}</div>
                                    <div className="text-gray-500 text-sm">@{agency.slug}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{agency.contact_phone}</div>
                                    <div className="text-sm text-gray-500">{agency.contact_email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {agency.city}, {agency.district}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center gap-1">
                                        <ShieldAlert className="w-4 h-4 text-gray-400" />
                                        {agency.lawyer_name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${agency.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            agency.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {agency.status.charAt(0).toUpperCase() + agency.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {agency.status === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleApprove(agency.$id, agency.owner_id)}
                                                className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded hover:bg-green-100"
                                                title="Approve"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(agency.$id)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded hover:bg-red-100"
                                                title="Reject"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {agencies.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No agency applications found.</div>
                )}
            </div>
        </div>
    );
}
