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
    try {
      setIsLoading(true);
      const response = await apiRequest<AuthResponse>('GET', '/api/admin/me');
      if (response.success && response.user) {
        setUser(response.user);
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
      const response = await apiRequest<AuthResponse>(
        'POST', 
        '/api/admin/login', 
        { username, password }
      );
      
      if (response.success && response.user) {
        setUser(response.user);
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${response.user.firstName}!`,
        });
        return true;
      } else {
        setUser(null);
        toast({
          title: 'Login Failed',
          description: response.message || 'Invalid username or password',
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
      await apiRequest<{success: boolean}>('POST', '/api/admin/logout');
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
    checkAuth().catch(console.error);
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