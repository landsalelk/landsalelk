"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { getAgents } from "@/lib/agents";
import {
  ShieldCheck,
  FileText,
  Scale,
  CheckCircle,
  Search,
  User,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
=======
import { useState, useEffect } from 'react';
import { getAgents } from '@/lib/agents';
import { ShieldCheck, FileText, Scale, CheckCircle, Search, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d

export default function LegalServicesPage() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLawyers() {
      try {
        // Try to fetch agents with Legal/Notary specialization
        const agents = await getAgents(8);
        setLawyers(agents);
      } catch (e) {
        console.error("Failed to load lawyers", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLawyers();
  }, []);

<<<<<<< HEAD
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      {/* Hero */}
      <div className="mx-auto mb-12 max-w-7xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
          <ShieldCheck className="h-4 w-4" /> Secure Your Investment
=======
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            {/* Hero */}
            <div className="max-w-7xl mx-auto mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-4">
                    <ShieldCheck className="w-4 h-4" /> Secure Your Investment
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Legal & Trust Center</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Verify deeds, access title reports, and connect with trusted notaries to ensure a safe transaction.
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {/* Service Cards */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                        <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Title Extraction</h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Get a certified copy of the Folio (Paththiru) from the Land Registry to verify ownership history.
                    </p>
                    <button className="text-blue-600 font-bold text-sm hover:underline">Request Search &rarr;</button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                        <Scale className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Deed Verification</h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Have a verified lawyer review the deed (Sinnakkara, Bim Saviya) for any encumbrances or caveats.
                    </p>
                    <button className="text-emerald-600 font-bold text-sm hover:underline">Find a Lawyer &rarr;</button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Drafting Agreements</h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Standardized Sales & Purchase Agreements (SPA) drafted by legal professionals.
                    </p>
                    <button className="text-purple-600 font-bold text-sm hover:underline">View Templates &rarr;</button>
                </div>
            </div>

            {/* Trusted Lawyers Section */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Verified Panel Lawyers & Agents</h2>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                ) : lawyers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {lawyers.map((agent) => (
                            <div key={agent.$id} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <div className="w-20 h-20 bg-slate-200 rounded-full mb-4 flex items-center justify-center text-slate-500">
                                    {agent.photo ? (
                                        <Image src={agent.photo} alt={agent.name} width={80} height={80} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <User className="w-10 h-10" />
                                    )}
                                </div>
                                <h4 className="font-bold text-slate-900 text-lg">{agent.name || 'Agent'}</h4>
                                <p className="text-slate-500 text-sm mb-2">{agent.specialization || 'Real Estate Agent'}</p>
                                {agent.is_verified && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mb-4">
                                        <CheckCircle className="w-3 h-3" /> Verified
                                    </div>
                                )}
                                <Link
                                    href={`/agents/${agent.$id}`}
                                    className="w-full py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
                                >
                                    Contact
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <p>No agents available at the moment. Please check back later.</p>
                    </div>
                )}
            </div>
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d
        </div>
        <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
          Legal & Trust Center
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Verify deeds, access title reports, and connect with trusted notaries
          to ensure a safe transaction.
        </p>
      </div>

      <div className="mx-auto mb-16 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {/* Service Cards */}
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mb-3 text-xl font-bold text-slate-900">
            Title Extraction
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-slate-500">
            Get a certified copy of the Folio (Paththiru) from the Land Registry
            to verify ownership history.
          </p>
          <button className="text-sm font-bold text-blue-600 hover:underline">
            Request Search &rarr;
          </button>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Scale className="h-6 w-6" />
          </div>
          <h3 className="mb-3 text-xl font-bold text-slate-900">
            Deed Verification
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-slate-500">
            Have a verified lawyer review the deed (Sinnakkara, Bim Saviya) for
            any encumbrances or caveats.
          </p>
          <button className="text-sm font-bold text-emerald-600 hover:underline">
            Find a Lawyer &rarr;
          </button>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="mb-3 text-xl font-bold text-slate-900">
            Drafting Agreements
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-slate-500">
            Standardized Sales & Purchase Agreements (SPA) drafted by legal
            professionals.
          </p>
          <button className="text-sm font-bold text-purple-600 hover:underline">
            View Templates &rarr;
          </button>
        </div>
      </div>

      {/* Trusted Lawyers Section */}
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-2xl font-bold text-slate-900">
          Verified Panel Lawyers & Agents
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : lawyers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {lawyers.map((agent) => (
              <div
                key={agent.$id}
                className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center transition-shadow hover:shadow-md"
              >
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-500">
                  {agent.photo ? (
                    <Image
                      src={agent.photo}
                      alt={agent.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="h-10 w-10" />
                  )}
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  {agent.name || "Agent"}
                </h4>
                <p className="mb-2 text-sm text-slate-500">
                  {agent.specialization || "Real Estate Agent"}
                </p>
                {agent.is_verified && (
                  <div className="mb-4 flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </div>
                )}
                <Link
                  href={`/agents/${agent.$id}`}
                  className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Contact
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <p>No agents available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
