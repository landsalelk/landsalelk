"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Home,
  Building,
  Trees,
  ArrowRight,
  Clock,
  X,
  Star,
  ShieldCheck,
  Users
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

    const updatedSearches = [
      searchItem,
      ...recentSearches.filter(
        (s) => s.query.toLowerCase() !== query.trim().toLowerCase(),
      ),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updatedSearches);
    safeLocalStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  }, [recentSearches]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const type = tabs.find((t) => t.id === activeTab)?.type || "sale";
      saveRecentSearch(searchQuery, type);
      router.push(
        `/properties?type=${type}&q=${encodeURIComponent(searchQuery)}`,
      );
    }
  };

  const clearRecentSearch = (e, index) => {
    e.stopPropagation(); // Prevent dropdown from closing
    const updated = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(updated);
    safeLocalStorage.setItem("recentSearches", JSON.stringify(updated));
    if (updated.length === 0) {
      setShowRecent(false);
      // Focus back on input
      searchInputRef.current?.focus();
    }
  };

  const clearAllRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    safeLocalStorage.setItem("recentSearches", JSON.stringify([]));
    setShowRecent(false);
    searchInputRef.current?.focus();
  };

  const handleRecentClick = (item) => {
    setSearchQuery(item.query);
    setActiveTab(tabs.find((t) => t.type === item.type)?.id || "buy");
    setShowRecent(false);
    router.push(
      `/properties?type=${item.type}&q=${encodeURIComponent(item.query)}`,
    );
  };

  const handleTrendingClick = (location) => {
    saveRecentSearch(
      location,
      tabs.find((t) => t.id === activeTab)?.type || "sale",
    );
    router.push(`/properties?q=${encodeURIComponent(location)}`);
  };

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden">
      {/* Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1628143217730-84c2da0749a4?q=80&w=2520&auto=format&fit=crop"
          alt="Luxury Real Estate Background"
          className="h-full w-full object-cover transition-transform duration-[20s] ease-in-out hover:scale-105"
        />
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-4 text-center">

        {/* Main Content */}
        <div className="animate-fade-in mx-auto max-w-5xl pt-20">

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-7xl drop-shadow-2xl font-display">
            Find Your Place <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-cyan-200">
              in Sri Lanka
            </span>
          </h1>

          <p className="mb-12 text-lg font-medium text-white/90 md:text-2xl drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
            Search 50,000+ verified properties, lands, and luxury homes from trusted agents.
          </p>

          {/* Glassmorphism Search Console */}
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/20 bg-white/10 p-2 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">

            {/* Tab Pills */}
            <div className="mb-4 flex justify-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                    ? "bg-white text-emerald-950 shadow-lg scale-105"
                    : "bg-black/20 text-white hover:bg-black/40 border border-white/10"
                    }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input Area */}
            <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-white rounded-2xl p-2 shadow-xl gap-2">
              <div className="flex-grow flex items-center px-2">
                <MapPin className="ml-2 h-6 w-6 text-emerald-500 shrink-0" strokeWidth={2.5} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onFocus={() => mounted && recentSearches.length > 0 && setShowRecent(true)}
                  placeholder="City, Province, or Postal Code..."
                  className="flex-grow bg-transparent px-4 py-3 text-lg font-bold text-slate-800 placeholder-slate-400 outline-none min-w-0"
                />
              </div>

              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 md:py-3 font-bold text-lg text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <Search className="h-5 w-5" />
                Search
              </button>

              {/* Recent Searches Dropdown */}
              {showRecent && recentSearches.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 z-50 mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl text-left"
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
                  <div className="max-h-60 overflow-y-auto">
                    {recentSearches.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleRecentClick(item)}
                        className="group flex cursor-pointer items-center justify-between border-b border-slate-50 px-4 py-3 transition-colors hover:bg-emerald-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-600">
                            {item.type === "sale" ? (
                              <Home className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-700 group-hover:text-emerald-900">
                              {item.query}
                            </div>
                            <div className="text-xs text-slate-400 group-hover:text-emerald-600 capitalize">
                              {item.type}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => clearRecentSearch(e, index)}
                          className="rounded-full p-1 text-slate-300 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-500 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trending Pills */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
              <span className="text-white/70 font-medium py-1 px-2">Trending:</span>
              {["Colombo 7", "Kandy Lands", "Galle Fort", "Negombo"].map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleTrendingClick(loc)}
                  className="rounded-full bg-white/10 px-4 py-1 font-semibold text-white transition-all hover:bg-white/20 hover:scale-105 backdrop-blur-sm border border-white/5"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Stats Strip - "Trusted By" Feel */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-white/10 pt-8 pb-8 animate-fade-in-up">
          <div className="text-center group cursor-default">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-2 transition-transform group-hover:scale-110 duration-300">
              <Home className="h-6 w-6" />
            </div>
            <div className="text-3xl font-extrabold text-white">50k+</div>
            <div className="text-xs font-bold text-white/60 uppercase tracking-widest mt-1">Properties</div>
          </div>
          <div className="text-center group cursor-default">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-2 transition-transform group-hover:scale-110 duration-300">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-3xl font-extrabold text-white">10k+</div>
            <div className="text-xs font-bold text-white/60 uppercase tracking-widest mt-1">Daily Users</div>
          </div>
          <div className="text-center group cursor-default">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-2 transition-transform group-hover:scale-110 duration-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="text-3xl font-extrabold text-white">100%</div>
            <div className="text-xs font-bold text-white/60 uppercase tracking-widest mt-1">Verified Agents</div>
          </div>
          <div className="text-center group cursor-default">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-2 transition-transform group-hover:scale-110 duration-300">
              <Star className="h-6 w-6" />
            </div>
            <div className="text-3xl font-extrabold text-white">4.9</div>
            <div className="text-xs font-bold text-white/60 uppercase tracking-widest mt-1">User Rating</div>
          </div>
        </div>

      </div>
    </div>
  );
}
