import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAuthStore } from '@/features/auth/services/authStore'
import { authApi } from '@/features/auth/services/auth'
import type { User } from '@/features/auth/types/auth'

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

vi.mock('@/features/auth/services/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}))

describe('Auth Store Integration', () => {
  let queryClient: QueryClient

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
    role: 'user',
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        sms: false,
        push: false,
      },
      defaultView: 'dashboard',
    },
    subscription: {
      plan: 'enterprise',
      credits: 5000,
      creditsUsed: 1000,
      renewalDate: '2025-02-25',
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-25T00:00:00Z',
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Reset auth store
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })

    vi.clearAllMocks()
  })

  describe('Login Integration', () => {
    it('should update store and persist state after successful login', async () => {
      const authResponse = {
        user: mockUser,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      }

      vi.mocked(authApi.login).mockResolvedValueOnce(authResponse)

      const { result } = renderHook(
        () => {
          const auth = useAuth()
          const store = useAuthStore()
          return { auth, store }
        },
        { wrapper },
      )

      // Initially not authenticated
      expect(result.current.store.isAuthenticated).toBe(false)
      expect(result.current.auth.isAuthenticated).toBe(false)

      // Perform login
      act(() => {
        result.current.auth.login({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      // Wait for login to complete
      await waitFor(() => {
        expect(result.current.store.isAuthenticated).toBe(true)
        expect(result.current.store.user).toEqual(mockUser)
      })

      // Hook should reflect store state
      expect(result.current.auth.isAuthenticated).toBe(true)
      expect(result.current.auth.user).toEqual(mockUser)
    })

    it('should not update store on login failure', async () => {
      vi.mocked(authApi.login).mockRejectedValueOnce(new Error('Login failed'))

      const { result } = renderHook(
        () => {
          const auth = useAuth()
          const store = useAuthStore()
          return { auth, store }
        },
        { wrapper },
      )

      // Perform login
      act(() => {
        result.current.auth.login({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
      })

      // Wait for login to fail
      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalled()
      })

      // Store should remain unchanged
      expect(result.current.store.isAuthenticated).toBe(false)
      expect(result.current.store.user).toBeNull()
      expect(result.current.auth.isAuthenticated).toBe(false)
    })
  })

  describe('Logout Integration', () => {
    it('should clear store after logout', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })

      vi.mocked(authApi.logout).mockResolvedValueOnce(undefined)

      const { result } = renderHook(
        () => {
          const auth = useAuth()
          const store = useAuthStore()
          return { auth, store }
        },
        { wrapper },
      )

      // Initially authenticated
      expect(result.current.store.isAuthenticated).toBe(true)
      expect(result.current.auth.isAuthenticated).toBe(true)

      // Perform logout
      act(() => {
        result.current.auth.logout()
      })

      // Wait for logout to complete
      await waitFor(() => {
        expect(result.current.store.isAuthenticated).toBe(false)
        expect(result.current.store.user).toBeNull()
      })

      // Hook should reflect store state
      expect(result.current.auth.isAuthenticated).toBe(false)
      expect(result.current.auth.user).toBeNull()
    })

    it('should clear store even if logout API fails', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })

      vi.mocked(authApi.logout).mockRejectedValueOnce(
        new Error('Network error'),
      )

      const { result } = renderHook(
        () => {
          const auth = useAuth()
          const store = useAuthStore()
          return { auth, store }
        },
        { wrapper },
      )

      // Perform logout
      act(() => {
        result.current.auth.logout()
      })

      // Wait for logout to complete
      await waitFor(() => {
        expect(result.current.store.isAuthenticated).toBe(false)
      })

      // Store should be cleared despite API failure
      expect(result.current.store.user).toBeNull()
      expect(result.current.auth.isAuthenticated).toBe(false)
    })
  })

  describe('Store Persistence', () => {
    it('should maintain auth state across hook instances', async () => {
      // Set authenticated state
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })

      // First hook instance
      const { result: result1 } = renderHook(() => useAuth(), { wrapper })
      expect(result1.current.isAuthenticated).toBe(true)
      expect(result1.current.user).toEqual(mockUser)

      // Second hook instance
      const { result: result2 } = renderHook(() => useAuth(), { wrapper })
      expect(result2.current.isAuthenticated).toBe(true)
      expect(result2.current.user).toEqual(mockUser)

      // Both should have same data
      expect(result1.current.user).toBe(result2.current.user)
    })

    it('should sync state updates across hook instances', async () => {
      const { result: result1 } = renderHook(() => useAuth(), { wrapper })
      const { result: result2 } = renderHook(() => useAuth(), { wrapper })

      // Initially both not authenticated
      expect(result1.current.isAuthenticated).toBe(false)
      expect(result2.current.isAuthenticated).toBe(false)

      // Update store directly
      act(() => {
        useAuthStore.getState().setAuth(mockUser)
      })

      // Both hooks should reflect the update
      await waitFor(() => {
        expect(result1.current.isAuthenticated).toBe(true)
        expect(result2.current.isAuthenticated).toBe(true)
        expect(result1.current.user).toEqual(mockUser)
        expect(result2.current.user).toEqual(mockUser)
      })
    })
  })

  describe('Credit Updates', () => {
    it('should update user credits in store', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(
        () => {
          const auth = useAuth()
          const store = useAuthStore()
          return { auth, store }
        },
        { wrapper },
      )

      // Update credits
      act(() => {
        useAuthStore.getState().updateCredits(3000)
      })

      // Store should be updated
      await waitFor(() => {
        expect(result.current.store.user?.credits).toBe(3000)
      })

      // Hook should reflect the update
      expect(result.current.auth.user?.credits).toBe(3000)
    })
  })
})
