// CSRF token management utility

// Function to fetch a CSRF token from the server
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    // Add a cache-busting parameter to prevent caching
    const timestamp = Date.now();
    const response = await fetch(`/api/csrf-token?_t=${timestamp}`, {
      credentials: 'include', // Include cookies
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch CSRF token: ${response.statusText}`);
      // Return null instead of throwing
      return null;
    }
    
    const data = await response.json();
    if (!data.csrfToken) {
      console.warn('CSRF token not found in response');
      // Return null instead of throwing
      return null;
    }
    
    console.log('Fresh CSRF token fetched successfully');
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    // Return null instead of throwing
    return null;
  }
}

// Add CSRF token to headers for fetch requests
export function addCsrfHeader(headers: HeadersInit = {}, csrfToken: string): HeadersInit {
  return {
    ...headers,
    'X-CSRF-Token': csrfToken
  };
}