'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/appwrite';
import { DB_ID, COLLECTION_LISTINGS, COLLECTION_USERS_EXTENDED, COLLECTION_TRANSACTIONS } from '@/appwrite/config';
import { Query } from 'appwrite';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        listingTrend: [],
        categoryDist: [],
        revenueTrend: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            // Fetch recent listings for trend
            const listings = await databases.listDocuments(
                DB_ID,
                COLLECTION_LISTINGS,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );

            // Fetch recent transactions (if existed in schema/mock)
            // We'll mock revenue trend based on listings for now as transactons collection might be empty

            // Process Listings by Month
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const trendMap = {};

            listings.documents.forEach(doc => {
                const date = new Date(doc.$createdAt);
                const key = `${months[date.getMonth()]} ${date.getDate()}`; // Daily for now as recency varies
                trendMap[key] = (trendMap[key] || 0) + 1;
            });

            const listingTrend = Object.keys(trendMap).slice(0, 7).map(key => ({
                name: key,
                listings: trendMap[key]
            })).reverse();

            // Mock Category Distribution (in real app, aggregate this)
            const categories = [
                { name: 'Land', value: 45 },
                { name: 'House', value: 30 },
                { name: 'Commercial', value: 15 },
                { name: 'Apartment', value: 10 },
            ];

            // Mock Revenue Data
            const revenueTrend = [
                { name: 'Mon', revenue: 12000 },
                { name: 'Tue', revenue: 15000 },
                { name: 'Wed', revenue: 18000 },
                { name: 'Thu', revenue: 14000 },
                { name: 'Fri', revenue: 22000 },
                { name: 'Sat', revenue: 30000 },
                { name: 'Sun', revenue: 25000 },
            ];

            setData({
                listingTrend: listingTrend.length > 0 ? listingTrend : [{ name: 'Today', listings: 0 }],
                categoryDist: categories,
                revenueTrend: revenueTrend
            });
        } catch (error) {
            console.error("Analytics fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-600" />
                System Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">LKR 4.2M</h3>
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-2">
                        <TrendingUp className="w-3 h-3" /> +12.5%
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Active Listings</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">1,248</h3>
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-2">
                        <TrendingUp className="w-3 h-3" /> +5.2%
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">New Users</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">856</h3>
                    <div className="flex items-center gap-1 text-blue-500 text-xs font-bold mt-2">
                        <TrendingUp className="w-3 h-3" /> +8.1%
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Churn Rate</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">2.4%</h3>
                    <div className="flex items-center gap-1 text-red-500 text-xs font-bold mt-2">
                        <TrendingDown className="w-3 h-3" /> -0.5%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-6">Revenue Trend (Last 7 Days)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenueTrend}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-6">Property Categories</h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryDist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.categoryDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 ml-8">
                            {data.categoryDist.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-slate-600">{entry.name}</span>
                                    <span className="font-bold text-slate-900">{entry.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
