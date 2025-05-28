import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../authStore'
import type { User } from '../../types/auth'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
global.localStorage = localStorageMock as Storage

describe('Auth Store', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
    role: 'user',
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
      plan: 'enterprise',
      renewalDate: '2025-02-25',
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-25T00:00:00Z',
  }

  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('setAuth', () => {
    it('should set authentication data correctly', () => {
      useAuthStore.getState().setAuth(mockUser)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should handle setting auth with minimal data', () => {
      const minimalUser = { ...mockUser }
      useAuthStore.getState().setAuth(minimalUser)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(minimalUser)
      expect(state.isAuthenticated).toBe(true)
    })
  })

  describe('updateUser', () => {
    it('should update user data', () => {
      // Set initial user
      useAuthStore.getState().setAuth(mockUser)

      // Update user
      const updates = { name: 'Updated Name', email: 'updated@example.com' }
      useAuthStore.getState().updateUser(updates)

      const state = useAuthStore.getState()
      expect(state.user).toEqual({ ...mockUser, ...updates })
      expect(state.user?.name).toBe('Updated Name')
      expect(state.user?.email).toBe('updated@example.com')
    })

    it('should not affect other state when updating user', () => {
      useAuthStore.getState().setAuth(mockUser)

      const updates = { email: 'new@example.com' }
      useAuthStore.getState().updateUser(updates)

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
    })

    it('should handle update when no user exists', () => {
      useAuthStore.getState().updateUser({ name: 'Test' })

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
    })
  })

  describe('logout', () => {
    it('should clear all auth data', () => {
      // Set auth data
      useAuthStore.getState().setAuth(mockUser)

      // Logout
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should handle logout when already logged out', () => {
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('security', () => {
    it('should NOT persist to localStorage', () => {
      // Verify no persistence middleware is configured
      expect(useAuthStore.persist).toBeUndefined()
    })

    it('should sanitize sensitive fields from user data', () => {
      const userWithSensitiveData = {
        ...mockUser,
        passwordHash: 'should-be-removed',
        apiKey: 'secret-key',
        refreshToken: 'refresh-token',
      }

      useAuthStore.getState().setAuth(userWithSensitiveData as any)
      const storedUser = useAuthStore.getState().user

      expect(storedUser).not.toBeNull()
      expect((storedUser as any).passwordHash).toBeUndefined()
      expect((storedUser as any).apiKey).toBeUndefined()
      expect((storedUser as any).refreshToken).toBeUndefined()
      // Regular fields should remain
      expect(storedUser?.email).toBe(mockUser.email)
      expect(storedUser?.name).toBe(mockUser.name)
    })
  })

  describe('state updates', () => {
    it('should trigger subscribers on state change', () => {
      const listener = vi.fn()
      const unsubscribe = useAuthStore.subscribe(listener)

      useAuthStore.getState().setAuth(mockUser)

      expect(listener).toHaveBeenCalled()

      unsubscribe()
    })

    it('should batch multiple updates', () => {
      const listener = vi.fn()
      const unsubscribe = useAuthStore.subscribe(listener)

      useAuthStore.setState((state) => ({
        ...state,
        user: mockUser,
        isAuthenticated: true,
      }))

      expect(listener).toHaveBeenCalledTimes(1)

      unsubscribe()
    })
  })
})
