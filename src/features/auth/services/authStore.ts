import { create } from 'zustand'
import { User } from '../types/auth'

/**
 * Secure authentication store that keeps user data in memory only.
 * Session persistence is handled by httpOnly cookies on the server.
 * 
 * Security features:
 * - No localStorage/sessionStorage usage (prevents XSS attacks)
 * - Sensitive data filtering (removes fields that shouldn't be client-side)
 * - Memory-only storage (data cleared on page refresh)
 * - Session validation through server API calls
 */
interface AuthStore {
  /** Currently authenticated user data (sanitized) */
  user: User | null
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean
  /** Sets authentication data after successful login/register */
  setAuth: (user: User) => void
  /** Updates current user data partially */
  updateUser: (user: Partial<User>) => void
  /** Clears all authentication data */
  logout: () => void
}

/**
 * List of fields that should never be stored client-side
 */
const SENSITIVE_FIELDS = [
  'passwordHash',
  'password',
  'apiKey',
  'apiSecret',
  'refreshToken',
  'accessToken',
  'sessionToken',
  'secretKey',
  'privateKey',
] as const

/**
 * Sanitizes user data by removing sensitive fields
 */
function sanitizeUserData<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data }
  
  // Remove any sensitive fields
  SENSITIVE_FIELDS.forEach(field => {
    delete (sanitized as any)[field]
  })
  
  return sanitized
}

/**
 * Secure authentication state store - memory only, no persistence.
 * Tokens are stored in httpOnly cookies for security.
 *
 * @example
 * // Access auth state
 * const { user, isAuthenticated } = useAuthStore();
 *
 * // Update auth state
 * const { setAuth, logout } = useAuthStore();
 * setAuth(userData);
 */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  
  setAuth: (user) => {
    // Sanitize user data before storing
    const sanitizedUser = sanitizeUserData(user)
    
    set({
      user: sanitizedUser,
      isAuthenticated: true,
    })
  },
  
  updateUser: (userData) =>
    set((state) => ({
      user: state.user 
        ? sanitizeUserData({ ...state.user, ...userData })
        : null,
    })),
    
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}))

/**
 * Selector functions for accessing specific parts of the auth store.
 * Using selectors prevents unnecessary re-renders when unrelated state changes.
 */
export const authSelectors = {
  user: (state: AuthStore) => state.user,
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
  setAuth: (state: AuthStore) => state.setAuth,
  updateUser: (state: AuthStore) => state.updateUser,
  logout: (state: AuthStore) => state.logout,
}

/**
 * Hook to initialize auth state from server on app load.
 * This should be called in the root component to restore session.
 */
export async function initializeAuthFromServer(): Promise<void> {
  try {
    // Make API call to validate session and get user data
    const response = await fetch('/api/v1/auth/me', {
      credentials: 'include', // Include httpOnly cookies
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.user) {
        useAuthStore.getState().setAuth(data.user)
      }
    }
  } catch (error) {
    // Session invalid or network error - user remains logged out
    // Silent fail - this is expected if user has no session
  }
}
