import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';
import { LoginWithReplit } from '../LoginWithReplit';

interface ReplitProtectedRouteProps {
  children: React.ReactNode;
}

export function ReplitProtectedRoute({ children }: ReplitProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Authentication Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to be logged in to access this page
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <LoginWithReplit />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}