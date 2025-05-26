import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authApi } from '../auth'
import { apiClient } from '@/api/client'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '../../types/auth'

// Mock the API client
vi.mock('@/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('Auth Service', () => {
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
      plan: 'enterprise',
      credits: 5000,
      creditsUsed: 1000,
      renewalDate: '2025-02-25',
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-25T00:00:00Z',
  }

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    const loginCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should successfully login with valid credentials', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockAuthResponse },
      })

      const result = await authApi.login(loginCredentials)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        loginCredentials,
      )
      expect(result).toEqual(mockAuthResponse)
    })

    it('should throw error on login failure', async () => {
      const errorMessage = 'Invalid credentials'
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error(errorMessage))

      await expect(authApi.login(loginCredentials)).rejects.toThrow(
        errorMessage,
      )
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        loginCredentials,
      )
    })

    it('should handle network errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(
        new Error('Network error'),
      )

      await expect(authApi.login(loginCredentials)).rejects.toThrow(
        'Network error',
      )
    })

    it('should handle empty credentials', async () => {
      const emptyCredentials: LoginCredentials = { email: '', password: '' }
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockAuthResponse },
      })

      await authApi.login(emptyCredentials)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        emptyCredentials,
      )
    })
  })

  describe('register', () => {
    const registerData: RegisterData = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      company: 'New Company',
    }

    it('should successfully register a new user', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockAuthResponse },
      })

      const result = await authApi.register(registerData)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/register',
        registerData,
      )
      expect(result).toEqual(mockAuthResponse)
    })

    it('should throw error on registration failure', async () => {
      const errorMessage = 'Email already exists'
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error(errorMessage))

      await expect(authApi.register(registerData)).rejects.toThrow(errorMessage)
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/register',
        registerData,
      )
    })

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed')
      vi.mocked(apiClient.post).mockRejectedValueOnce(validationError)

      await expect(authApi.register(registerData)).rejects.toThrow(
        'Validation failed',
      )
    })

    it('should handle missing required fields', async () => {
      const incompleteData = { email: 'test@example.com' } as RegisterData
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockAuthResponse },
      })

      await authApi.register(incompleteData)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/register',
        incompleteData,
      )
    })
  })

  describe('logout', () => {
    it('should successfully logout', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: { success: true } },
      })

      await authApi.logout()

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout')
    })

    it('should handle logout errors gracefully', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(
        new Error('Logout failed'),
      )

      await expect(authApi.logout()).rejects.toThrow('Logout failed')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout')
    })

    it('should handle network errors during logout', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(
        new Error('Network error'),
      )

      await expect(authApi.logout()).rejects.toThrow('Network error')
    })
  })

  describe('refreshToken', () => {
    const refreshToken = 'mock-refresh-token'

    it('should successfully refresh access token', async () => {
      const refreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: refreshResponse },
      })

      const result = await authApi.refreshToken(refreshToken)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken,
      })
      expect(result).toEqual(refreshResponse)
    })

    it('should throw error on refresh failure', async () => {
      const errorMessage = 'Invalid refresh token'
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error(errorMessage))

      await expect(authApi.refreshToken(refreshToken)).rejects.toThrow(
        errorMessage,
      )
      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken,
      })
    })

    it('should handle expired refresh token', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(
        new Error('Token expired'),
      )

      await expect(authApi.refreshToken(refreshToken)).rejects.toThrow(
        'Token expired',
      )
    })

    it('should handle empty refresh token', async () => {
      const emptyToken = ''
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: { accessToken: 'new', refreshToken: 'new' } },
      })

      await authApi.refreshToken(emptyToken)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: emptyToken,
      })
    })
  })

  describe('getCurrentUser', () => {
    it('should successfully fetch current user', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockUser },
      })

      const result = await authApi.getCurrentUser()

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(mockUser)
    })

    it('should throw error on user fetch failure', async () => {
      const errorMessage = 'Unauthorized'
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error(errorMessage))

      await expect(authApi.getCurrentUser()).rejects.toThrow(errorMessage)
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
    })

    it('should handle network errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'))

      await expect(authApi.getCurrentUser()).rejects.toThrow('Network error')
    })

    it('should handle empty response', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: null },
      })

      const result = await authApi.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle API returning non-standard response', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: undefined },
      })

      const result = await authApi.login({
        email: 'test@example.com',
        password: 'pass',
      })

      expect(result).toBeUndefined()
    })

    it('should handle API throwing non-Error objects', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce('String error')

      await expect(
        authApi.login({ email: 'test@example.com', password: 'pass' }),
      ).rejects.toBe('String error')
    })

    it('should handle concurrent requests', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockAuthResponse },
      })

      const promises = [
        authApi.login({ email: 'test1@example.com', password: 'pass1' }),
        authApi.login({ email: 'test2@example.com', password: 'pass2' }),
        authApi.login({ email: 'test3@example.com', password: 'pass3' }),
      ]

      const results = await Promise.all(promises)

      expect(apiClient.post).toHaveBeenCalledTimes(3)
      expect(results).toHaveLength(3)
      results.forEach((result) => {
        expect(result).toEqual(mockAuthResponse)
      })
    })
  })
})
