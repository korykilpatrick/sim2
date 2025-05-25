import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/providers/ToastProvider'
import { WebSocketProvider } from '@/providers/WebSocketProvider'
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

interface TestProviderProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

// Provider wrapper for tests
export const TestProviders: React.FC<TestProviderProps> = ({ 
  children, 
  queryClient = createTestQueryClient() 
}) => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <WebSocketProvider>
            {children}
          </WebSocketProvider>
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

// Custom render function
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) => {
  const { queryClient, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders queryClient={queryClient}>
        {children}
      </TestProviders>
    ),
    ...renderOptions
  })
}

// Mock user for authenticated tests
export const mockUser: User = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  company: 'Test Company',
  credits: 1000,
  role: 'user',
  createdAt: new Date().toISOString()
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

// Re-export everything from testing library
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'