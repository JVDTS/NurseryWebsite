// CSRF token management utility

// Cache the token locally
let cachedToken: string | null = null;

// Function to fetch a CSRF token from the server
export async function fetchCsrfToken(): Promise<string> {
  try {
    // Return cached token if it exists
    if (cachedToken) {
      return cachedToken;
    }

    // Add a cache-busting parameter to prevent caching
    const timestamp = Date.now();
    const response = await fetch(`/api/csrf-token?_t=${timestamp}`, {
      credentials: 'same-origin', // Include cookies with same-origin requests
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.csrfToken) {
      throw new Error('CSRF token not found in response');
    }
    
    console.log('Fresh CSRF token fetched successfully');
    
    // Cache the token
    cachedToken = data.csrfToken;
    
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

// Clear the cached token (useful after logout)
export function clearCsrfToken(): void {
  cachedToken = null;
}

// Add CSRF token to headers for fetch requests
export function addCsrfHeader(headers: HeadersInit = {}, csrfToken: string): HeadersInit {
  return {
    ...headers,
    'X-CSRF-Token': csrfToken
  };
}