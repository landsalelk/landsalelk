"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Home,
  Building,
  Trees,
  Sparkles,
  Clock,
  X,
} from "lucide-react";

// Safe localStorage helper for private browsing mode
const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("localStorage not available:", e);
    }
    return null;
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      console.warn("localStorage not available:", e);
    }
    return false;
  },
};

const MAX_RECENT_SEARCHES = 5;

export function Hero() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const tabs = [
    { id: "buy", label: "Buy", icon: Home, type: "sale" },
    { id: "rent", label: "Rent", icon: Building, type: "rent" },
    { id: "land", label: "Lands", icon: Trees, type: "land" },
  ];

  // Load recent searches from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = safeLocalStorage.getItem("recentSearches");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      } catch (e) {
        console.error("Failed to parse recent searches:", e);
      }
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowRecent(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save a search to recent searches
  const saveRecentSearch = useCallback((query, type) => {
    if (!query || query.trim() === "") return;

    const searchItem = {
      query: query.trim(),
      type,
      timestamp: Date.now(),
    };

    setRecentSearches((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter(
        (item) => item.query.toLowerCase() !== searchItem.query.toLowerCase(),
      );
      // Add new search at the beginning
      const updated = [searchItem, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      // Save to localStorage
      safeLocalStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove a recent search
  const removeRecentSearch = useCallback((queryToRemove, e) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.query !== queryToRemove);
      safeLocalStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all recent searches
  const clearAllRecent = useCallback(() => {
    setRecentSearches([]);
    safeLocalStorage.setItem("recentSearches", JSON.stringify([]));
  }, []);

  const handleSearch = () => {
    const activeType = tabs.find((t) => t.id === activeTab)?.type || "sale";
    const params = new URLSearchParams();
    params.set("type", activeType);
    if (searchQuery) {
      params.set("q", searchQuery);
      saveRecentSearch(searchQuery, activeType);
    }
    setShowRecent(false);
    router.push(`/properties?${params.toString()}`);
  };

  const handleRecentClick = (item) => {
    setSearchQuery(item.query);
    setShowRecent(false);

    // Update active tab to match the search type
    const tabId = tabs.find((t) => t.type === item.type)?.id;
    if (tabId) setActiveTab(tabId);

    const params = new URLSearchParams();
    params.set("type", item.type);
    params.set("q", item.query);
    router.push(`/properties?${params.toString()}`);
  };

  const handleTrendingClick = (location) => {
    saveRecentSearch(
      location,
      tabs.find((t) => t.id === activeTab)?.type || "sale",
    );
    router.push(`/properties?q=${encodeURIComponent(location)}`);
  };

  return (
    <div className="relative flex min-h-[700px] flex-col items-center justify-center overflow-hidden pt-24 pb-24">
      {/* Premium Aurora Background */}
      <div className="live-gradient absolute inset-0 z-0">
        <div className="aurora-beam" />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      </div>

      {/* Modern Floating Shapes (More subtle) */}
      <div className="animate-float absolute top-20 left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="animate-float-delayed absolute right-10 bottom-20 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left Side - Text & Search */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-900/40 px-4 py-1.5 backdrop-blur-md mb-6 shadow-xl">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-sm font-bold text-emerald-300 tracking-wide uppercase">No.1 Real Estate Platform</span>
            </div>

            <h1 className="mb-6 text-4xl leading-tight font-extrabold text-white sm:text-5xl lg:text-6xl tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              Discover Your <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-400">
                Dream Property
              </span>
            </h1>

            <p className="mx-auto lg:mx-0 max-w-xl text-lg text-white/90 md:text-xl font-medium leading-relaxed mb-8" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
              Connect with verified sellers and top agents across Sri Lanka. AI-powered valuations included.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-white/90">AI Valuations</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <MapPin className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-white/90">25 Districts</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Home className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white/90">1000+ Listings</span>
              </div>
            </div>
          </div>

          {/* Right Side - Multi-Layer Visual Scene */}
          <div className="flex-1 relative animate-fade-in hidden lg:block min-h-[500px]">
            {/* Glow Effect Behind */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl scale-110 rounded-full" />

            {/* Main Illustration */}
            <div className="relative z-10">
              <img
                src="/images/hero-illustration.png"
                alt="Real Estate Platform Illustration"
                className="w-full max-w-lg mx-auto drop-shadow-2xl animate-float"
              />
            </div>

            {/* Floating Property Card 1 - Top Right */}
            <div className="absolute top-8 right-4 z-20 animate-float-delayed">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/50 w-56">
                <div className="h-24 rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100 mb-3 flex items-center justify-center">
                  <Home className="h-10 w-10 text-emerald-600" />
                </div>
                <div className="text-sm font-bold text-slate-800">Modern Villa</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> Colombo 7
                </div>
                <div className="text-lg font-bold text-emerald-600 mt-2">LKR 45M</div>
              </div>
            </div>

            {/* Floating Stats Card - Bottom Left */}
            <div className="absolute bottom-16 left-0 z-20 animate-float" style={{ animationDelay: '1s' }}>
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">AI Valuation</div>
                    <div className="text-lg font-bold text-slate-800">LKR 48.5M</div>
                    <div className="text-xs text-emerald-600 font-medium">+7.8% Market Value</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Verified Badge - Top Left */}
            <div className="absolute top-20 left-8 z-20 animate-pulse-slow">
              <div className="bg-emerald-500 text-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold">Verified Seller</span>
              </div>
            </div>

            {/* Floating Location Ping - Bottom Right */}
            <div className="absolute bottom-32 right-12 z-20">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-30" />
                <div className="relative bg-emerald-500 text-white rounded-full p-3 shadow-lg">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 animate-fade-in">

          {/* Search Box */}
          <div className="search-box-hero animate-fade-in mx-auto max-w-4xl">
            {/* Tab Pills */}
            <div className="mb-3 flex gap-2 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex flex-col gap-4 p-2 md:flex-row">
              <div className="search-input-wrapper relative flex-grow">
                <MapPin
                  className="mr-2 h-5 w-5 text-[#34d399]"
                  strokeWidth={2.5}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onFocus={() =>
                    mounted && recentSearches.length > 0 && setShowRecent(true)
                  }
                  placeholder="City, Province, or Postal Code..."
                  className="w-full bg-transparent py-3 font-bold text-slate-700 placeholder-slate-500 outline-none"
                  aria-label="Search properties"
                  aria-haspopup="listbox"
                />

                {/* Recent Searches Dropdown */}
                {showRecent && recentSearches.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl"
                    role="listbox"
                    aria-label="Recent searches"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                        <Clock className="h-3 w-3" />
                        Recent Searches
                      </span>
                      <button
                        onClick={clearAllRecent}
                        className="text-xs font-semibold text-slate-400 transition-colors hover:text-red-500"
                      >
                        Clear all
                      </button>
                    </div>
                    <ul className="py-1">
                      {recentSearches.map((item, idx) => (
                        <li
                          key={`${item.query}-${idx}`}
                          role="option"
                          aria-selected={false}
                          className="group flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-slate-50"
                          onClick={() => handleRecentClick(item)}
                        >
                          <div className="flex items-center gap-3">
                            <Search className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-slate-700">
                              {item.query}
                            </span>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                              {item.type}
                            </span>
                          </div>
                          <button
                            onClick={(e) => removeRecentSearch(item.query, e)}
                            className="p-1 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                            aria-label={`Remove ${item.query} from recent searches`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={handleSearch}
                className="btn-primary flex items-center justify-center gap-2 px-10 py-4 text-base"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
            </div>

            {/* Trending Searches */}
            <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 p-3 text-xs">
              <span className="font-bold text-slate-900">Trending:</span>
              {["Colombo 7", "Kandy Lands", "Galle Fort", "Negombo"].map(
                (loc) => (
                  <button
                    key={loc}
                    onClick={() => handleTrendingClick(loc)}
                    className="font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full transition-all hover:bg-emerald-100 hover:text-emerald-700"
                  >
                    {loc}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="animate-fade-in mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { label: "Properties", value: "15,000+" },
            { label: "Trusted Agents", value: "1,200+" },
            { label: "Daily Visits", value: "50k+" },
            { label: "Districts", value: "25" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="glass-panel animate-jelly rounded-2xl p-4 text-center"
            >
              <div className="mb-1 text-2xl font-bold text-white md:text-3xl">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-slate-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
