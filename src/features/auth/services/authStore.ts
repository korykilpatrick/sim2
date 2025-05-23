import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '../types/auth'

/**
 * Zustand store interface for authentication state management.
 */
interface AuthStore {
  /** Currently authenticated user data */
  user: User | null
  /** JWT access token for API requests */
  accessToken: string | null
  /** JWT refresh token for obtaining new access tokens */
  refreshToken: string | null
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean
  /** Sets authentication data after successful login/register */
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  /** Updates current user data partially */
  updateUser: (user: Partial<User>) => void
  /** Clears all authentication data */
  logout: () => void
}

/**
 * Global authentication state store with persistence.
 * Stores auth tokens and user data in localStorage.
 * 
 * @example
 * // Access auth state
 * const { user, isAuthenticated } = useAuthStore();
 * 
 * // Update auth state
 * const { setAuth, logout } = useAuthStore();
 * setAuth(userData, accessToken, refreshToken);
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
