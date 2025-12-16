'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { getAllAgents } from '@/lib/agents';
import { Search, Loader2, Map as MapIcon, List, ShieldCheck } from 'lucide-react';

// Dynamically import Map to avoid SSR issues with Leaflet window object
const AgentMap = dynamic(() => import('@/components/agents/AgentMap'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    ),
});

export default function AgentsPage() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

    useEffect(() => {
        async function load() {
            // Mock data fallback if DB empty for demo
            const dbAgents = await getAllAgents();
            if (dbAgents.length === 0) {
                setAgents([
                    { $id: '1', name: 'Harsha Perera', lat: 6.9271, lng: 79.8612 },
                    { $id: '2', name: 'Nimali Silva', lat: 6.935, lng: 79.85 },
                    { $id: '3', name: 'Kapila Realty', lat: 6.91, lng: 79.88 },
                    { $id: '4', name: 'Estate Masters', lat: 6.89, lng: 79.87 },
                ]);
            } else {
                setAgents(dbAgents);
            }
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden relative">

            {/* Sidebar List (always visible on desktop, hidden on mobile if map view) */}
            <div className={`
          w-full md:w-[400px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-10
          ${viewMode === 'map' ? 'hidden md:flex' : 'flex'}
      `}>
                <div className="p-4 border-b border-slate-100 shadow-sm z-20">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Find an Agent</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or city..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                    ) : (
                        agents.map(agent => (
                            <div key={agent.$id} className="group p-4 rounded-xl border border-slate-100 hover:border-emerald-500/30 hover:shadow-md transition-all cursor-pointer bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                                        {agent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{agent.name}</h3>
                                        <p className="text-xs text-slate-500">Colombo, Western Province</p>
                                        <div className="mt-1 flex gap-2">
                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> Verified
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div className={`flex-grow relative ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
                <AgentMap agents={agents} />

                {/* Mobile Toggle */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden z-[1000] bg-white rounded-full shadow-xl border border-slate-100 p-1 flex">
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                    >
                        <MapIcon className="w-4 h-4" /> Map
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                    >
                        <List className="w-4 h-4" /> List
                    </button>
                </div>
            </div>

        </div>
    );
}
