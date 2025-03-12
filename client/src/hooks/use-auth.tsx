import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define types for API responses
type AuthResponse = {
  success: boolean;
  user: AdminUser;
  message?: string;
};

// Define types for user and auth context
export type AdminUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'super_admin' | 'nursery_admin' | 'staff' | 'regular';
  nurseryId: number | null;
};

interface AuthContextProps {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component that wraps app and provides auth context
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const checkAuth = async (): Promise<boolean> => {
    // Prevent duplicate API calls while already checking
    if (isLoading) return !!user;
    
    try {
      setIsLoading(true);
      
      // We'll handle 401 errors ourselves
      const response = await fetch('/api/admin/me', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        setUser(null);
        return false;
      }
      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      const data = await response.json() as AuthResponse;
      
      if (data.success && data.user) {
        setUser(data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      const data = await response.json() as AuthResponse;
      
      if (data.success && data.user) {
        setUser(data.user);
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.user.firstName}!`,
        });
        return true;
      } else {
        setUser(null);
        toast({
          title: 'Login Failed',
          description: data.message || 'Invalid username or password',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Login Error',
        description: 'Failed to log in. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is logged in when the component mounts
  useEffect(() => {
    // We need to call this only once when the component mounts
    let isMounted = true;
    if (isMounted) {
      checkAuth().catch(console.error);
    }
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Provide the auth context values
  const value: AuthContextProps = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for consumers to get the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}