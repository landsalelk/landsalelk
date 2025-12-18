'use client';

import { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { X, TrendingUp, Eye, Heart, MousePointerClick, Calendar } from 'lucide-react';

export function ListingAnalytics({ listing, onClose }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Simulate fetching analytics data for this specific listing
        // In real app, query 'listing_stats' collection by listing_id
        const mockData = generateMockData();
        setData(mockData);
    }, [listing]);

    const generateMockData = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            name: day,
            views: Math.floor(Math.random() * 50) + 10,
            favorites: Math.floor(Math.random() * 5),
            clicks: Math.floor(Math.random() * 20) + 5
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                            performance Analytics
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            {listing.title} <span className="text-slate-300 mx-2">|</span>
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">ID: {listing.$id}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-2">
                            <Eye className="w-4 h-4" /> Total Views
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {data.reduce((acc, curr) => acc + curr.views, 0)}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">+12% this week</div>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-2">
                            <Heart className="w-4 h-4" /> Favorites
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {data.reduce((acc, curr) => acc + curr.favorites, 0)}
                        </div>
                        <div className="text-xs text-rose-600 mt-1">+2 new saves</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 text-purple-700 font-bold text-sm mb-2">
                            <MousePointerClick className="w-4 h-4" /> Inquiries
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {data.reduce((acc, curr) => acc + curr.clicks, 0)}
                        </div>
                        <div className="text-xs text-purple-600 mt-1">High conversion</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800">Traffic Overview</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Calendar className="w-3 h-3" /> Last 7 Days
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                <Line type="monotone" dataKey="favorites" stroke="#ef4444" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <div className="w-3 h-1 bg-blue-500 rounded-full" /> Views
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <div className="w-3 h-1 bg-rose-500 rounded-full" /> Favorites
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
