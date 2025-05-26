/**
 * Test rendering utilities
 * Separated to avoid react-refresh warnings
 */

import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { TestProviders } from './test-utils'

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