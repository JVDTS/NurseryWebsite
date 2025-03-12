import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'super_admin' | 'nursery_admin' | 'staff' | 'regular';
  nurseryId?: number;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  nurseryId 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      setLocation('/admin/login');
    }
    
    if (!isLoading && isAuthenticated && user && requiredRole) {
      // Check if user has required role
      if (requiredRole === 'super_admin' && user.role !== 'super_admin') {
        // Only super admins can access super admin routes
        setLocation('/admin/dashboard');
      } 
      
      if (requiredRole === 'nursery_admin' && 
          user.role !== 'super_admin' && 
          user.role !== 'nursery_admin') {
        // Nursery admins and super admins can access nursery admin routes
        setLocation('/admin/dashboard');
      }
      
      // Check if nursery admin is accessing their own nursery
      if (nurseryId && user.role === 'nursery_admin' && user.nurseryId !== nurseryId) {
        // Nursery admins can only access their own nursery
        setLocation('/admin/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, nurseryId, setLocation]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This will not be rendered as we redirect in the useEffect
    return null;
  }

  return <>{children}</>;
}