import React from 'react';
import { useAuth, ReplitUser } from '../hooks/useAuth';
import { Button } from './ui/button';
import { SiReplit } from 'react-icons/si';

export default function ReplitLoginButton() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="animate-pulse">
        <span className="mr-2">Loading...</span>
      </Button>
    );
  }

  if (isAuthenticated) {
    const replitUser = user as ReplitUser;
    return (
      <a href="/api/logout" className="no-underline">
        <Button variant="outline" size="sm">
          <span className="mr-2">Logout</span>
          {replitUser?.username && (
            <span className="font-semibold">{replitUser.username}</span>
          )}
        </Button>
      </a>
    );
  }

  return (
    <a href="/api/login" className="no-underline">
      <Button variant="default" size="sm" className="flex items-center gap-2">
        <SiReplit className="h-4 w-4" />
        Log in with Replit
      </Button>
    </a>
  );
}