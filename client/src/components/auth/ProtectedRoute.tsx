import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    // Verify authentication status when component mounts
    const verifyAuth = async () => {
      const isAuthed = await checkAuth();
      
      if (!isAuthed && !isLoading) {
        // Redirect to login if not authenticated
        navigate('/admin/login?redirect=' + encodeURIComponent(location));
      }
    };

    verifyAuth();
  }, [checkAuth, isAuthenticated, isLoading, location, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show content if authenticated
  return isAuthenticated ? <>{children}</> : null;
}