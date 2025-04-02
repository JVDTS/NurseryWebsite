// CSRF token management utility

// Function to fetch a CSRF token from the server
export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include' // Include cookies
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

// Add CSRF token to headers for fetch requests
export function addCsrfHeader(headers: HeadersInit = {}, csrfToken: string): HeadersInit {
  return {
    ...headers,
    'X-CSRF-Token': csrfToken
  };
}