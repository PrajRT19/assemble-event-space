
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthState } from "../models/types";
import { authAPI } from "../services/api";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await authAPI.login(email, password);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
      });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const user = await authAPI.register(name, email, password);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
      toast({
        title: "Registration successful",
        description: `Welcome to Assemble, ${user.name}!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to register",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const isAdmin = authState.user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
