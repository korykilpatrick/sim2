/**
 * Test utility functions and constants
 * Separated from test-utils.tsx to avoid react-refresh warnings
 */

import { QueryClient } from '@tanstack/react-query'
import type { User } from '@/features/auth/types'
import { useAuthStore } from '@/features/auth/services/authStore'

// Create a new QueryClient for each test
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0
    },
    mutations: {
      retry: false
    }
  }
})

// Mock authenticated user for tests
export const mockUser: User = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  company: 'Test Company',
  credits: 1000,
  role: 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true
}

// Helper to set up authenticated state
export const setupAuthenticatedUser = (user: User = mockUser) => {
  const store = useAuthStore.getState()
  store.setAuth(user, 'mock-access-token', 'mock-refresh-token')
}

// Helper to clear auth state
export const clearAuth = () => {
  const store = useAuthStore.getState()
  store.logout()
}

// Helper to wait for async operations
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

// Re-export testing library utilities
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
export { renderWithProviders } from './test-render'