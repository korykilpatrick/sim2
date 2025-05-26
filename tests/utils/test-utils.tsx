import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/providers/ToastProvider'
import { WebSocketProvider } from '@/providers/WebSocketProvider'

// Import helper functions from separate file
import { createTestQueryClient } from './test-helpers'

interface TestProviderProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

// Provider wrapper for tests - React component only
export const TestProviders: React.FC<TestProviderProps> = ({ 
  children, 
  queryClient = createTestQueryClient() 
}) => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
        <ToastProvider />
      </QueryClientProvider>
    </BrowserRouter>
  )
}