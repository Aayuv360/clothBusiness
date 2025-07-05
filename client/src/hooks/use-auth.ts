import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { User, InsertUser } from '@shared/schema';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        });
      } catch (error) {
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    } else {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const user = await response.json();
      
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      });
      
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      
      return { success: true, user };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
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
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const user = await response.json();
      
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      });
      
      toast({
        title: "Account created!",
        description: "Welcome to SareeMart. Start exploring our collection.",
      });
      
      return { success: true, user };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Registration failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    });
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
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
    // Simulate OTP verification
    if (otp === "123456") {
      const user = {
        id: Date.now(),
        username: phone,
        email: `${phone}@temp.com`,
        phone,
        isVerified: true,
        createdAt: new Date()
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      });
      
      toast({
        title: "Phone verified!",
        description: "You have been successfully logged in.",
      });
      
      return { success: true, user };
    }
    
    toast({
      title: "Invalid OTP",
      description: "Please check the verification code and try again.",
      variant: "destructive",
    });
    
    return { success: false, error: "Invalid OTP" };
  };

  return {
    ...authState,
    login,
    register,
    logout,
    sendOTP,
    verifyOTP
  };
}
