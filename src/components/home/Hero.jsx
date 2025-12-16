'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, Building, Trees, Sparkles } from 'lucide-react';

export function Hero() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('buy');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = [
        { id: 'buy', label: 'Buy', icon: Home, type: 'sale' },
        { id: 'rent', label: 'Rent', icon: Building, type: 'rent' },
        { id: 'land', label: 'Lands', icon: Trees, type: 'land' },
    ];

    const handleSearch = () => {
        const activeType = tabs.find(t => t.id === activeTab)?.type || 'sale';
        const params = new URLSearchParams();
        params.set('type', activeType);
        if (searchQuery) params.set('search', searchQuery);
        router.push(`/properties?${params.toString()}`);
    };

    const handleTrendingClick = (location) => {
        router.push(`/properties?search=${encodeURIComponent(location)}`);
    };

    return (
        <div className="relative min-h-[600px] flex items-center justify-center pt-24 pb-20 overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 live-gradient" />

            {/* Floating Blobs */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-float-delayed" />
            <div className="absolute top-40 right-20 w-48 h-48 bg-cyan-300/20 rounded-full blur-3xl animate-pulse-slow" />

            {/* Decorative House Illustration */}
            <div className="absolute top-10 right-0 md:right-10 w-48 h-48 md:w-80 md:h-80 opacity-30 md:opacity-60 pointer-events-none animate-float-delayed">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <circle cx="100" cy="100" r="90" fill="white" opacity="0.2" />
                    <path d="M60 160V100L100 60L140 100V160H60Z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="4" strokeLinejoin="round" />
                    <path d="M50 100L100 50L150 100" fill="#F87171" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M90 160V120H110V160" fill="#93C5FD" stroke="#3B82F6" strokeWidth="4" />
                    <circle cx="100" cy="90" r="10" fill="#E0F2FE" stroke="#60A5FA" strokeWidth="3" />
                    <path d="M170 160 Q 170 120 185 105" stroke="#78350f" strokeWidth="3" fill="none" />
                    <path d="M185 105 L 175 95 M 185 105 L 195 95 M 185 105 L 185 90 M 185 105 L 172 110 M 185 105 L 198 110" stroke="#16a34a" strokeWidth="2.5" />
                    <path d="M30 160 Q 30 130 15 115" stroke="#78350f" strokeWidth="3" fill="none" />
                    <path d="M15 115 L 5 105 M 15 115 L 25 105 M 15 115 L 15 100 M 15 115 L 2 120 M 15 115 L 28 120" stroke="#16a34a" strokeWidth="2.5" />
                </svg>
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center">
                <div className="animate-fade-in">
                    {/* Sinhala Greeting */}
                    <p className="font-sinhala text-2xl text-white/90 mb-3 font-bold drop-shadow-md">
                        ආයුබෝවන්! (Ayubowan!)
                    </p>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                        Find Your{' '}
                        <span className="text-yellow-300 animate-wiggle inline-block">
                            Dream Land
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
                        Sri Lanka&apos;s friendliest real estate marketplace.
                        <br className="hidden md:block" />
                        <span className="flex items-center justify-center gap-2 mt-2">
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                            Powered by AI, Verified by Agents
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                        </span>
                    </p>
                </div>

                {/* Search Box */}
                <div className="search-box-hero max-w-4xl mx-auto animate-fade-in">
                    {/* Tab Pills */}
                    <div className="flex gap-2 mb-3 p-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="flex flex-col md:flex-row gap-4 p-2">
                        <div className="search-input-wrapper flex-grow">
                            <MapPin className="text-[#34d399] w-5 h-5 mr-2" strokeWidth={2.5} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="City, Province, or Postal Code..."
                                className="w-full py-3 bg-transparent outline-none text-slate-700 placeholder-slate-400 font-bold"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="btn-primary px-10 py-4 flex items-center justify-center gap-2 text-base"
                        >
                            <Search className="w-5 h-5" />
                            Search
                        </button>
                    </div>

                    {/* Trending Searches */}
                    <div className="flex flex-wrap gap-3 p-3 text-xs border-t border-slate-100 mt-2">
                        <span className="font-bold text-slate-900">Trending:</span>
                        {['Colombo 7', 'Kandy Lands', 'Galle Fort', 'Negombo'].map(loc => (
                            <button
                                key={loc}
                                onClick={() => handleTrendingClick(loc)}
                                className="text-slate-500 hover:text-[#10b981] font-bold transition-colors"
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto animate-fade-in">
                    {[
                        { label: 'Properties', value: '15,000+' },
                        { label: 'Trusted Agents', value: '1,200+' },
                        { label: 'Daily Visits', value: '50k+' },
                        { label: 'Districts', value: '25' },
                    ].map((stat, idx) => (
                        <div key={idx} className="glass-panel rounded-2xl p-4 text-center animate-jelly">
                            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-white/70 text-sm font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
