"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { account } from "@/lib/appwrite";
import { toast } from "sonner";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]); // Run checkUser on mount

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      toast.success("Logged out successfully");
    } catch (e) {
      console.error("Logout failed", e);
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, checkUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
