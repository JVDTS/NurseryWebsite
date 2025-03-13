import { useQuery } from "@tanstack/react-query";

// Define the type for the user data returned from the Replit auth endpoint
export interface ReplitUser {
  sub?: string;
  email?: string;
  username?: string;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  profile_image_url?: string;
  [key: string]: any; // For any additional fields
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<ReplitUser | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}