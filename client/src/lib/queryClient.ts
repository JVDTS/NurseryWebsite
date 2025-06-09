import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Handles API response errors with user-friendly messages
 * without exposing sensitive data
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage: string;
    
    try {
      // Try to parse as JSON first
      const errorData = await res.json();
      errorMessage = errorData.message || 'An unexpected error occurred';
    } catch (e) {
      // If not JSON, use status text or a generic message
      errorMessage = res.statusText || 'An unexpected error occurred';
    }
    
    // Create an error with appropriate status code and sanitized message
    const error = new Error(errorMessage);
    (error as any).status = res.status;
    throw error;
  }
}

import { fetchCsrfToken } from './csrf';

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { on401: UnauthorizedBehavior, skipCsrf?: boolean }
): Promise<T> {
  // For state-changing methods (POST, PUT, DELETE, PATCH), fetch CSRF token first
  // unless skipCsrf is explicitly set to true
  const isStateChangingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
  const needsCsrfToken = isStateChangingMethod && options?.skipCsrf !== true;
  
  let headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  // Add CSRF token for state-changing methods
  if (needsCsrfToken) {
    try {
      const csrfToken = await fetchCsrfToken();
      console.log("Using CSRF token:", csrfToken);
      headers = {
        ...headers,
        'CSRF-Token': csrfToken, // Change header name to match what csurf middleware expects
        'X-CSRF-Token': csrfToken // Also include the X-prefixed version for backward compatibility
      };
    } catch (error) {
      console.error('Failed to fetch CSRF token for API request:', error);
      throw new Error('Security validation failed. Please refresh the page and try again.');
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle 401 based on options
  if (options?.on401 === "returnNull" && res.status === 401) {
    return null as T;
  }

  await throwIfResNotOk(res);
  return await res.json() as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
