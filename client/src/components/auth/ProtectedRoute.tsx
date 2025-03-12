import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth, AdminUser } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

// Helper type to ensure type safety
type UserRole = AdminUser['role'];

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  nurseryId?: number;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  nurseryId 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsChecking(true);
        await checkAuth();
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isChecking && !isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, isLoading, isChecking, setLocation]);

  // Check role access if a role is required
  useEffect(() => {
    if (!isLoading && !isChecking && isAuthenticated && user && requiredRole) {
      // For super_admin, allow access to everything
      if (user.role === 'super_admin') return;

      // For nursery_admin, check if they have the required role and are accessing their nursery
      if (requiredRole === 'nursery_admin') {
        if (user.role !== 'nursery_admin') {
          setLocation('/admin/dashboard');
        } else if (nurseryId && user.nurseryId !== nurseryId) {
          // Nursery admin trying to access another nursery's data
          setLocation('/admin/dashboard');
        }
      }

      // For other roles, just check if they have the required role level
      const roleHierarchy = ['regular', 'staff', 'nursery_admin', 'super_admin'];
      const userRoleIndex = roleHierarchy.indexOf(user.role);
      const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

      if (userRoleIndex < requiredRoleIndex) {
        setLocation('/admin/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, isChecking, user, requiredRole, nurseryId, setLocation]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}