import { useEffect, useState } from "react";
import { Route, useLocation, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  allowedRoles?: Array<'super_admin' | 'nursery_admin' | 'staff' | 'regular'>;
}

export function ProtectedRoute({ 
  path, 
  component: Component, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuth();
  const [, navigate] = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        setChecking(true);
        await checkAuth();
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, [checkAuth]);

  if (isLoading || checking) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  return (
    <Route
      path={path}
      component={() => {
        if (!isAuthenticated) {
          // Redirect to login if not authenticated
          return <Redirect to="/admin/login" />;
        }

        // If roles are specified, check if user has the required role
        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
              <p className="mb-4 text-gray-600">
                You don't have permission to access this page.
              </p>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          );
        }

        // If all checks pass, render the component
        return <Component />;
      }}
    />
  );
}