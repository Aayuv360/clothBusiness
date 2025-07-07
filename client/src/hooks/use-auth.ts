import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, InsertUser } from "@shared/schema";

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
  });
  const { toast } = useToast();

  // Check authentication only when needed
  const checkAuth = async () => {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      if (!response.ok) {
        throw new Error("Authentication failed");
      }
      const user = await response.json();

      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false,
      }));
      return user;
    } catch (error) {

      setAuthState({
        user: null,
        isLoading: false,
      });
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      const response = await apiRequest("POST", "/api/auth/login", {
        email,
        password,
      });
      const user = await response.json();

      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false,
      }));

      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });

      return { success: true, user };
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "Invalid credentials" };
    }
  };

  const register = async (userData: InsertUser) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const user = await response.json();

      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false,
      }));

      toast({
        title: "Account created!",
        description: "Welcome to SareeMart. Start exploring our collection.",
      });

      return { success: true, user };
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      toast({
        title: "Registration failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setAuthState({
        user: null,
        isLoading: false,
      });

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      // Even if logout API fails, clear local state
      setAuthState({
        user: null,
        isLoading: false,
      });

      toast({
        title: "Logged out",
        description: "You have been logged out.",
      });
    }
  };

  const sendOTP = async (phone: string) => {
    // Simulate OTP sending
    toast({
      title: "OTP Sent",
      description: `Verification code sent to ${phone}`,
    });
    return { success: true };
  };

  const verifyOTP = async (phone: string, otp: string) => {
    toast({
      title: "Invalid OTP",
      description: "Please check the verification code and try again.",
      variant: "destructive",
    });

    return { success: false, error: "Invalid OTP" };
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.user,
    login,
    register,
    logout,
    sendOTP,
    verifyOTP,
    checkAuth,
  };
}
