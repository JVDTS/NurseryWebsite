import { useQuery } from "@tanstack/react-query";

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'editor';
  nurseryId?: number;
  profileImageUrl?: string;
}

export function useAdmin() {
  const { data: currentUser, isLoading, error } = useQuery<AdminUser>({
    queryKey: ['/api/admin/me'],
    retry: false,
  });

  const isAuthenticated = !!currentUser;
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isEditor = currentUser?.role === 'editor' || isAdmin;

  return {
    currentUser,
    isLoading,
    error,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isEditor,
  };
}