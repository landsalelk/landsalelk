"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const ComparisonContext = createContext();

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
  removeItem: (key) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
        return true;
      }
    } catch (e) {
      console.warn("localStorage not available:", e);
    }
    return false;
  },
};

export function ComparisonProvider({ children }) {
  const [compareList, setCompareList] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = safeLocalStorage.getItem("compareList");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompareList(parsed);
        }
      } catch (e) {
        console.error("Failed to parse compare list:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when compareList changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      safeLocalStorage.setItem("compareList", JSON.stringify(compareList));
    }
  }, [compareList, isLoaded]);

  const addToCompare = (property) => {
    if (!property || !property.$id) {
      toast.error("Invalid property");
      return;
    }

    if (compareList.find((p) => p.$id === property.$id)) {
      toast.info("Already in comparison list");
      return;
    }

    if (compareList.length >= 3) {
      toast.warning("You can compare up to 3 properties");
      return;
    }

    setCompareList((prev) => [...prev, property]);
    toast.success("Added to comparison");
  };

  const removeFromCompare = (propertyId) => {
    if (!propertyId) return;
    setCompareList((prev) => prev.filter((p) => p.$id !== propertyId));
    toast.success("Removed from comparison");
  };

  const clearCompare = () => {
    setCompareList([]);
    safeLocalStorage.removeItem("compareList");
    toast.success("Comparison list cleared");
  };

  const isInCompare = (propertyId) => {
    return compareList.some((p) => p.$id === propertyId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isLoaded,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    // Return safe defaults if used outside provider
    return {
      compareList: [],
      addToCompare: () => {},
      removeFromCompare: () => {},
      clearCompare: () => {},
      isInCompare: () => false,
      isLoaded: false,
    };
  }
  return context;
}
