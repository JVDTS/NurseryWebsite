import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface ReplitUser {
  username?: string;
  email?: string;
  [key: string]: any;
}

export function LoginWithReplit() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const userData = user as ReplitUser;

  if (isLoading) {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  if (isAuthenticated && userData) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">
          Welcome, {userData.username || userData.email || 'User'}!
        </span>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/api/logout"}>
          Log out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => window.location.href = "/api/login"}
      variant="default"
    >
      Log in with Replit
    </Button>
  );
}