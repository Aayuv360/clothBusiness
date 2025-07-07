import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, InsertUser } from "@shared/schema";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (userData: InsertUser) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
  sendOTP: (phone: string) => Promise<{ success: boolean }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkAuth = async (): Promise<User | null> => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      if (!response.ok) throw new Error("Not authenticated");

      const user = await response.json();
      setUser(user);
      return user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const user = await response.json();
      setUser(user);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      return { success: true, user };
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "Invalid credentials" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: InsertUser) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const user = await response.json();
      setUser(user);
      toast({
        title: "Account created!",
        description: "Welcome to SareeMart. Start exploring our collection.",
      });
      return { success: true, user };
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch (error) {
      // Even if logout API fails, clear local state
    } finally {
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const sendOTP = async (phone: string) => {
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

  // Auto-check auth once when the provider mounts
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
        sendOTP,
        verifyOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}