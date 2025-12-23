"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { account } from "@/appwrite";
import { toast } from "sonner";

const AuthContext = createContext();

// Context for global authentication state
/**
 * AuthProvider component
 * Manages global authentication state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const login = async (email, password) => {
    try {
       await account.createEmailPasswordSession(email, password);
       await checkUser();
       return true;
    } catch (error) {
       throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, checkUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
