import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '../types/auth'

/**
 * Zustand store interface for authentication state management.
 * Note: Tokens are stored in httpOnly cookies for security.
 */
interface AuthStore {
  /** Currently authenticated user data */
  user: User | null
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean
  /** Sets authentication data after successful login/register */
  setAuth: (user: User) => void
  /** Updates current user data partially */
  updateUser: (user: Partial<User>) => void
  /**
   * Updates user credit balance
   * @deprecated Use creditStore.updateBalance() instead - will be removed in v2.0
   */
  updateCredits: (credits: number) => void
  /** Clears all authentication data */
  logout: () => void
}

/**
 * Global authentication state store with persistence.
 * Stores only user data in localStorage - tokens are in httpOnly cookies.
 *
 * @example
 * // Access auth state
 * const { user, isAuthenticated } = useAuthStore();
 *
 * // Update auth state
 * const { setAuth, logout } = useAuthStore();
 * setAuth(userData);
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      updateCredits: (credits) => {
        console.warn(
          'authStore.updateCredits is deprecated. Use creditStore.updateBalance() instead.',
        )
        set((state) => ({
          user: state.user ? { ...state.user, credits } : null,
        }))
      },
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Don't persist tokens - they're in httpOnly cookies
      }),
    },
  ),
)

/**
 * Selector functions for accessing specific parts of the auth store.
 * Using selectors prevents unnecessary re-renders when unrelated state changes.
 */
export const authSelectors = {
  user: (state: AuthStore) => state.user,
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
  setAuth: (state: AuthStore) => state.setAuth,
  updateUser: (state: AuthStore) => state.updateUser,
  updateCredits: (state: AuthStore) => state.updateCredits,
  logout: (state: AuthStore) => state.logout,
}
