/**
 * CSRF token management utilities.
 * Handles fetching and storing CSRF tokens for API requests.
 */

import { apiClient } from '@/api/client'

let csrfToken: string | null = null

/**
 * Fetches a new CSRF token from the server.
 * Should be called on app initialization and after login.
 */
export async function fetchCSRFToken(): Promise<void> {
  try {
    const response = await apiClient.get('/csrf-token')
    // Token is automatically set as a cookie by the server
    // We can also read it from the response header if needed
    const token = response.headers['x-csrf-token']
    if (token) {
      csrfToken = token
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
  }
}

/**
 * Gets the current CSRF token.
 * Returns the cached token or reads from cookie if not cached.
 */
export function getCSRFToken(): string | null {
  if (csrfToken) {
    return csrfToken
  }

  // Try to read from cookie as fallback
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf-token') {
      csrfToken = value
      return value
    }
  }

  return null
}

/**
 * Clears the cached CSRF token.
 * Should be called on logout.
 */
export function clearCSRFToken(): void {
  csrfToken = null
}
