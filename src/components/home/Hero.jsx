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
  Users,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileCheck
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

// Micro-Story Steps
const STORY_STEPS = [
  {
    problem: { text: "Unsure about Land Prices?", icon: AlertCircle, color: "text-red-500" },
    solution: { text: "Get AI-Powered Market Valuations.", icon: TrendingUp, color: "text-emerald-500" }
  },
  {
    problem: { text: "Worried about Fake Deeds?", icon: FileCheck, color: "text-orange-500" },
    solution: { text: "100% Verified Owners & Agents.", icon: ShieldCheck, color: "text-emerald-500" }
  },
  {
    problem: { text: "Tired of High Broker Fees?", icon: AlertCircle, color: "text-red-500" },
    solution: { text: "Connect Directly with Sellers.", icon: Users, color: "text-emerald-500" }
  }
];

export function Hero() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyPhase, setStoryPhase] = useState("problem"); // 'problem', 'transition', 'solution'

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const tabs = [
    { id: "buy", label: "Buy", icon: Home, type: "sale" },
    { id: "rent", label: "Rent", icon: Building, type: "rent" },
    { id: "land", label: "Lands", icon: Trees, type: "land" },
  ];

  // Story Cycle Logic
  useEffect(() => {
    const cycleStory = () => {
      // 1. Show Problem (Initial state)
      // 2. After 2s, switch to Solution
      setTimeout(() => {
        setStoryPhase("solution");

        // 3. After 2.5s (display solution), switch to next problem
        setTimeout(() => {
          setStoryPhase("problem");
          setStoryIndex((prev) => (prev + 1) % STORY_STEPS.length);
        }, 3000);
      }, 2000);
    };

    const interval = setInterval(cycleStory, 5500); // Total cycle time
    cycleStory(); // Start immediately

    return () => clearInterval(interval);
  }, []);

  // Load recent searches logic (same as before)
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

  // Handle click outside logic (same as before)
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

  // Search logic (same as before)
  const saveRecentSearch = useCallback((query, type) => {
    if (!query || query.trim() === "") return;
    const searchItem = { query: query.trim(), type, timestamp: Date.now() };
    const updatedSearches = [searchItem, ...recentSearches.filter(s => s.query.toLowerCase() !== query.trim().toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updatedSearches);
    safeLocalStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  }, [recentSearches]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const type = tabs.find((t) => t.id === activeTab)?.type || "sale";
      saveRecentSearch(searchQuery, type);
      router.push(`/properties?type=${type}&q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearRecentSearch = (e, index) => {
    e.stopPropagation();
    const updated = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(updated);
    safeLocalStorage.setItem("recentSearches", JSON.stringify(updated));
    if (updated.length === 0) {
      setShowRecent(false);
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
    router.push(`/properties?type=${item.type}&q=${encodeURIComponent(item.query)}`);
  };

  const handleTrendingClick = (location) => {
    saveRecentSearch(location, tabs.find((t) => t.id === activeTab)?.type || "sale");
    router.push(`/properties?q=${encodeURIComponent(location)}`);
  };

  const currentStory = STORY_STEPS[storyIndex];

  return (
    <div className="relative flex min-h-[750px] flex-col items-center justify-center overflow-hidden bg-slate-50 pt-20 pb-20">

      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/30 animate-pulse-slow" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl animate-float-delayed" />

      <div className="relative z-10 w-full max-w-7xl px-4 text-center">

        {/* ========================================================
            MICRO-STORY STAGE
           ======================================================== */}
        <div className="mx-auto mb-10 h-32 flex flex-col items-center justify-center">

          {storyPhase === "problem" && (
            <div className="animate-enter-up flex flex-col items-center gap-4">
              <div className="animate-shake rounded-full bg-red-100 p-4 shadow-sm">
                <currentStory.problem.icon className={`h-8 w-8 ${currentStory.problem.color}`} />
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
                {currentStory.problem.text}
              </h2>
            </div>
          )}

          {storyPhase === "solution" && (
            <div className="animate-enter-up flex flex-col items-center gap-4">
              <div className="rounded-full bg-emerald-100 p-4 shadow-lg ring-4 ring-emerald-50 animate-highlight">
                <currentStory.solution.icon className={`h-8 w-8 ${currentStory.solution.color}`} />
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 tracking-tight">
                {currentStory.solution.text}
              </h2>
            </div>
          )}

        </div>

        {/* ========================================================
            SEARCH CONSOLE (Glassmorphism Retained)
           ======================================================== */}
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/60 bg-white/40 p-3 backdrop-blur-xl shadow-2xl ring-1 ring-white/50 transition-all hover:shadow-emerald-100/50">

          {/* Tab Pills */}
          <div className="mb-4 flex justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-lg scale-105"
                  : "bg-white/50 text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input Area */}
          <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-white rounded-2xl p-2 shadow-lg gap-2 ring-1 ring-slate-100">
            <div className="flex-grow flex items-center px-2">
              <MapPin className="ml-2 h-6 w-6 text-emerald-500 shrink-0 animate-bounce" style={{ animationDuration: '3s' }} strokeWidth={2.5} />
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
              className="group flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 md:py-3 font-bold text-lg text-white transition-all hover:bg-emerald-600 hover:shadow-lg hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <Search className="h-5 w-5 group-hover:animate-wiggle" />
              Search
            </button>

            {/* Recent Searches Dropdown (Same as before) */}
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
            <span className="text-slate-500 font-medium py-1 px-2">Trending:</span>
            {["Colombo 7", "Kandy Lands", "Galle Fort", "Negombo"].map((loc) => (
              <button
                key={loc}
                onClick={() => handleTrendingClick(loc)}
                className="rounded-full bg-white px-4 py-1 font-semibold text-slate-600 transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:scale-105 border border-slate-200 shadow-sm"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Original Stats Strip - Repurposed as Solution Highlight */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-slate-200 pt-8 pb-8 animate-fade-in-up opacity-80">
          <div className="text-center group cursor-default">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-2 transition-transform group-hover:scale-110 duration-300">
              <Home className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-slate-700">50k+</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Properties</div>
          </div>
          <div className="text-center group cursor-default">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-2 transition-transform group-hover:scale-110 duration-300">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-slate-700">10k+</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Users</div>
          </div>
          <div className="text-center group cursor-default">
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-2 transition-transform group-hover:scale-110 duration-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-slate-700">100%</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Agents</div>
          </div>
          <div className="text-center group cursor-default">
            <div className="flex items-center justify-center gap-1 text-yellow-500 mb-2 transition-transform group-hover:scale-110 duration-300">
              <Star className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-slate-700">4.9</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">User Rating</div>
          </div>
        </div>

      </div>
    </div>
  );
}
