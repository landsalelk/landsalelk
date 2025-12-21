"use client";

import { useState, useEffect } from 'react';
import { databases, storage } from '@/lib/appwrite';
import { DB_ID, COLLECTION_AGENTS } from '@/appwrite/config';
import { calculateProfileCompleteness } from '@/lib/profileUtils';
import { Loader2, CheckCircle, XCircle, Search, Shield, User, MapPin, Award } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const result = await databases.listDocuments(DB_ID, COLLECTION_AGENTS, [
        // Query.limit(100) // Default limit is 25, verify need for pagination later
      ]);
      setAgents(result.documents);
    } catch (error) {
      console.error("Error loading agents:", error);
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await databases.updateDocument(DB_ID, COLLECTION_AGENTS, id, {
        status: newStatus,
      });

      setAgents((prev) =>
        prev.map((agent) =>
          agent.$id === id ? { ...agent, status: newStatus } : agent,
        ),
      );

      toast.success(`Agent ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || agent.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search agents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {['all', 'pending', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-colors ${filterStatus === status
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Agents List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Agent</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Completeness</th>
                                <th className="px-6 py-4">License</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredAgents.map(agent => (
                                <tr key={agent.$id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                                                {agent.avatar ? (
                                                    <Image
                                                        src={agent.avatar.startsWith('http') ? agent.avatar : `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/listing_images/files/${agent.avatar}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                                                        alt={agent.name}
                                                        width={40}
                                                        height={40}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{agent.name}</div>
                                                <div className="text-xs text-slate-500">{agent.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${agent.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                            agent.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {agent.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${calculateProfileCompleteness(agent) === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${calculateProfileCompleteness(agent)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{calculateProfileCompleteness(agent)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-600 font-mono text-xs">
                                            {agent.license_number || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {agent.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(agent.$id, 'approved')}
                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(agent.$id, 'rejected')}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        {agent.status === 'approved' && (
                                            <button
                                                onClick={() => handleStatusUpdate(agent.$id, 'rejected')}
                                                className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline"
                                            >
                                                Revoke Access
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredAgents.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No agents found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header / Filters */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative w-full md:w-96">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex w-full gap-2 overflow-x-auto md:w-auto">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap capitalize transition-colors ${filterStatus === status
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Agents List */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Agent</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Completeness</th>
                <th className="px-6 py-4">License</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredAgents.map((agent) => (
                <tr
                  key={agent.$id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                        {agent.avatar ? (
                          <Image
                            src={
                              agent.avatar.startsWith("http")
                                ? agent.avatar
                                : `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'}/storage/buckets/listing_images/files/${agent.avatar}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject'}`
                            }
                            alt={agent.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <User className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {agent.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {agent.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold capitalize ${agent.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : agent.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${calculateProfileCompleteness(agent) === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                          style={{
                            width: `${calculateProfileCompleteness(agent)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {calculateProfileCompleteness(agent)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-slate-600">
                      {agent.license_number || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {agent.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStatusUpdate(agent.$id, "approved")
                          }
                          className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-100"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(agent.$id, "rejected")
                          }
                          className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    {agent.status === "approved" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(agent.$id, "rejected")
                        }
                        className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline"
                      >
                        Revoke Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAgents.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No agents found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
