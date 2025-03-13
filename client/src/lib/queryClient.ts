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

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { on401: UnauthorizedBehavior }
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
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
