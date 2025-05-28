import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { useAuth } from '../useAuth'
import { authApi } from '../../services/auth'
import { useAuthStore } from '../../services/authStore'
// ToastProvider import removed - not needed for tests
import { ReactNode } from 'react'
import type { User, AuthResponse } from '../../types/auth'

// Mock modules
vi.mock('../../services/auth')
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    hideToast: vi.fn(),
    toasts: [],
    addToast: vi.fn(),
    removeToast: vi.fn(),
  }),
}))
vi.mock('@/utils/csrf', () => ({
  fetchCSRFToken: vi.fn().mockResolvedValue(undefined),
  clearCSRFToken: vi.fn(),
  getCSRFToken: vi.fn().mockReturnValue('mock-csrf-token'),
}))

// Mock router
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('useAuth', () => {
  let queryClient: QueryClient

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
    role: 'user',
    credits: 1000,
    isActive: true,
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
      plan: 'professional',
      credits: 5000,
      creditsUsed: 1000,
      renewalDate: '2025-02-25',
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-25T00:00:00Z',
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Mock useToast
    vi.mock('@/hooks/useToast', () => ({
      useToast: () => ({
        showToast: vi.fn(),
        hideToast: vi.fn(),
        toasts: [],
        addToast: vi.fn(),
        removeToast: vi.fn(),
      }),
    }))

    // Reset auth store
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    })

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should return auth state from store', () => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should return unauthenticated state when not logged in', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('should handle successful login', async () => {
      const mockResponse = { user: mockUser }
      vi.mocked(authApi.login).mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useAuth(), { wrapper })

      result.current.login({ email: 'test@example.com', password: 'password' })

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false)
      })

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle login error', async () => {
      const mockError = {
        response: {
          data: {
            error: { message: 'Invalid credentials' },
          },
        },
      }
      vi.mocked(authApi.login).mockRejectedValueOnce(mockError)

      const { result } = renderHook(() => useAuth(), { wrapper })

      result.current.login({ email: 'test@example.com', password: 'wrong' })

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false)
      })

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('should handle successful registration', async () => {
      const mockResponse = { user: mockUser }
      vi.mocked(authApi.register).mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useAuth(), { wrapper })

      result.current.register({
        email: 'new@example.com',
        password: 'password',
        name: 'New User',
      })

      await waitFor(() => {
        expect(result.current.isRegistering).toBe(false)
      })

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle registration error', async () => {
      const mockError = {
        response: {
          data: {
            error: { message: 'Email already exists' },
          },
        },
      }
      vi.mocked(authApi.register).mockRejectedValueOnce(mockError)

      const { result } = renderHook(() => useAuth(), { wrapper })

      result.current.register({
        email: 'existing@example.com',
        password: 'password',
        name: 'User',
      })

      await waitFor(() => {
        expect(result.current.isRegistering).toBe(false)
      })

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('logout', () => {
    it('should handle successful logout', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })

      vi.mocked(authApi.logout).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useAuth(), { wrapper })

      result.current.logout()

      await waitFor(() => {
        expect(result.current.isLoggingOut).toBe(false)
      })

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('should clear state even if logout API fails', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      })

      vi.mocked(authApi.logout).mockRejectedValueOnce(
        new Error('Network error'),
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      result.current.logout()

      await waitFor(() => {
        expect(result.current.isLoggingOut).toBe(false)
      })

      // Should still clear local state
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  describe('loading states', () => {
    it('should track login loading state', async () => {
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })

      vi.mocked(authApi.login).mockReturnValue(
        loginPromise as Promise<AuthResponse>,
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isLoggingIn).toBe(false)

      result.current.login({ email: 'test@example.com', password: 'password' })

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(true)
      })

      resolveLogin!({ user: mockUser })

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false)
      })
    })

    it('should track register loading state', async () => {
      let resolveRegister: (value: any) => void
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve
      })

      vi.mocked(authApi.register).mockReturnValue(
        registerPromise as Promise<AuthResponse>,
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isRegistering).toBe(false)

      result.current.register({
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      })

      await waitFor(() => {
        expect(result.current.isRegistering).toBe(true)
      })

      resolveRegister!({ user: mockUser })

      await waitFor(() => {
        expect(result.current.isRegistering).toBe(false)
      })
    })

    it('should track logout loading state', async () => {
      let resolveLogout: () => void
      const logoutPromise = new Promise<void>((resolve) => {
        resolveLogout = resolve
      })

      vi.mocked(authApi.logout).mockReturnValue(logoutPromise)

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isLoggingOut).toBe(false)

      result.current.logout()

      await waitFor(() => {
        expect(result.current.isLoggingOut).toBe(true)
      })

      resolveLogout!()

      await waitFor(() => {
        expect(result.current.isLoggingOut).toBe(false)
      })
    })
  })

  describe('state synchronization', () => {
    it('should update query cache on successful login', async () => {
      vi.mocked(authApi.login).mockResolvedValueOnce({ user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      result.current.login({ email: 'test@example.com', password: 'password' })

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false)
      })

      const cachedData = queryClient.getQueryData(['auth', 'user'])
      expect(cachedData).toEqual(mockUser)
    })

    it('should clear query cache on logout', async () => {
      // Set initial data
      queryClient.setQueryData(['auth', 'user'], mockUser)
      vi.mocked(authApi.logout).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useAuth(), { wrapper })

      result.current.logout()

      await waitFor(() => {
        expect(result.current.isLoggingOut).toBe(false)
      })

      const cachedData = queryClient.getQueryData(['auth', 'user'])
      expect(cachedData).toBeUndefined()
    })
  })
})
