import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define types for user and auth context
export type AdminUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'super_admin' | 'nursery_admin' | 'staff' | 'regular';
  nurseryId: number | null;
  profileImageUrl?: string | null;
};

interface AuthContextProps {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string, csrfToken: string) => Promise<boolean>;
  logout: (csrfToken?: string) => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if user is logged in
  const checkAuth = async (): Promise<boolean> => {
    // If we already have a user, return true without making an API call
    if (user) {
      return true;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/me', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        setUser(null);
        return false;
      }
      
      const data = await response.json();
      
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

  // Login function
  const login = async (username: string, password: string, csrfToken: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log('Attempting login with token:', csrfToken ? 'Token received' : 'No token');
      
      if (!csrfToken) {
        toast({
          title: 'Security Error',
          description: 'Missing security token. Please refresh and try again.',
          variant: 'destructive',
        });
        return false;
      }
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ email: username, password }),
        credentials: 'include'
      });
      
      // Handle CSRF token errors specifically
      if (response.status === 403) {
        console.error('CSRF token validation failed');
        toast({
          title: 'Security Error',
          description: 'Security validation failed. Please refresh and try again.',
          variant: 'destructive',
        });
        return false;
      }
      
      const data = await response.json();
      
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

  // Logout function
  const logout = async (csrfToken?: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // If no token provided, try to fetch a fresh one
      let tokenToUse = csrfToken;
      if (!tokenToUse) {
        try {
          // Import dynamically to avoid circular dependencies
          const { fetchCsrfToken } = await import('@/lib/csrf');
          tokenToUse = await fetchCsrfToken();
        } catch (tokenError) {
          console.error('Failed to fetch CSRF token for logout:', tokenError);
        }
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      };
      
      // Add CSRF token if available
      if (tokenToUse) {
        headers['X-CSRF-Token'] = tokenToUse;
        console.log('Logging out with CSRF token');
      } else {
        console.warn('Logging out without CSRF token');
      }
      
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers,
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

  // Check authentication on mount
  useEffect(() => {
    checkAuth().catch(console.error);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}