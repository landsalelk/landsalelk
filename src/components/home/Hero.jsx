'use client';

import { useState } from 'react';
import { Search, MapPin, Home, Building, Trees } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Hero() {
    const [activeTab, setActiveTab] = useState('buy');

    const tabs = [
        { id: 'buy', label: 'Buy', icon: Home },
        { id: 'rent', label: 'Rent', icon: Building },
        { id: 'land', label: 'Lands', icon: Trees },
    ];

    return (
        <div className="relative min-h-[600px] flex items-center justify-center pt-20 pb-20 overflow-hidden bg-slate-900">

            {/* Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1600596542815-2a429b05e6ca?q=80&w=2072&auto=format&fit=crop"
                    alt="Sri Lanka Real Estate"
                    className="w-full h-full object-cover opacity-60"
                />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Discover Sri Lanka's <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Finest Properties
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        The smartest way to buy, sell, and rent land and homes in Sri Lanka.
                        Powered by AI, Verified by Agents.
                    </p>
                </motion.div>

                {/* Search Box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto p-2"
                >
                    {/* Tabs */}
                    <div className="flex gap-2 mb-2 p-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
                                    activeTab === tab.id
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="flex flex-col md:flex-row gap-4 p-2">
                        <div className="flex-grow relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="City, Province, or Postal Code"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder:text-slate-400 font-medium"
                            />
                        </div>
                        <div className="md:w-px bg-slate-200 my-2" />
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2">
                            <Search className="w-5 h-5" />
                            Search
                        </button>
                    </div>

                    {/* Quick Filters - Pseudo elements for now */}
                    <div className="flex gap-4 p-3 text-xs text-slate-500 border-t border-slate-100 mt-2">
                        <span className="font-semibold text-slate-900">Trending:</span>
                        <span className="hover:text-emerald-600 cursor-pointer">Colombo 7</span>
                        <span className="hover:text-emerald-600 cursor-pointer">Kandy Lands</span>
                        <span className="hover:text-emerald-600 cursor-pointer">Galle Fort</span>
                        <span className="hover:text-emerald-600 cursor-pointer">Apartments</span>
                    </div>

                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto text-center"
                >
                    {[
                        { label: 'Properties', value: '15,000+' },
                        { label: 'Trusted Agents', value: '1,200+' },
                        { label: 'Daily Visits', value: '50k+' },
                        { label: 'Cities', value: '250+' },
                    ].map((stat, index) => (
                        <div key={index}>
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-slate-400 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
