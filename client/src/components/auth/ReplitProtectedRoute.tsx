import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

interface ReplitProtectedRouteProps {
  children: React.ReactNode;
}

export function ReplitProtectedRoute({ children }: ReplitProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to home page
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}