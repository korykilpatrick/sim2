import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, renderHook } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { renderWithProviders, setupAuthenticatedUser, clearAuth, TestProviders } from '../../utils/test-utils'
import { server, resetMockData, mockCreditBalance } from '../../utils/api-mocks'
import { CreditsPage } from '@/pages/credits/CreditsPage'
import { useCredits } from '@/features/credits/hooks/useCredits'
import { useAuthStore } from '@/features/auth/services/authStore'

beforeEach(() => {
  setupAuthenticatedUser()
  resetMockData()
})

afterEach(() => {
  clearAuth()
  vi.clearAllMocks()
})

describe('Credit Balance Integration Tests', () => {
  describe('Balance Display', () => {
    it('should display current credit balance on load', async () => {
      renderWithProviders(<CreditsPage />)
      
      // Wait for balance to load
      await waitFor(() => {
        expect(screen.getByText('1,000')).toBeInTheDocument()
      })
      
      // Check lifetime credits
      expect(screen.getByText('5,000')).toBeInTheDocument()
      expect(screen.getByText(/Lifetime Credits/i)).toBeInTheDocument()
    })

    it('should display expiring credits with correct dates', async () => {
      renderWithProviders(<CreditsPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/100 credits expiring/i)).toBeInTheDocument()
        expect(screen.getByText(/50 credits expiring/i)).toBeInTheDocument()
      })
    })

    it('should show loading state while fetching balance', () => {
      renderWithProviders(<CreditsPage />)
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should handle balance fetch errors gracefully', async () => {
      server.use(
        http.get('*/credits/balance', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 })
        })
      )
      
      renderWithProviders(<CreditsPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load credit balance/i)).toBeInTheDocument()
      })
    })
  })

  describe('Balance Updates', () => {
    it('should update balance after credit deduction', async () => {
      const { rerender } = renderWithProviders(<CreditsPage />)
      
      // Initial balance
      await waitFor(() => {
        expect(screen.getByText('1,000')).toBeInTheDocument()
      })
      
      // Simulate credit deduction through API
      const response = await fetch('http://localhost:3001/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100, description: 'Test deduction' })
      })
      
      expect(response.ok).toBe(true)
      
      // Re-render to trigger balance refresh
      rerender(<CreditsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('900')).toBeInTheDocument()
      })
    })

    it('should update balance after credit purchase', async () => {
      const { rerender } = renderWithProviders(<CreditsPage />)
      
      // Initial balance
      await waitFor(() => {
        expect(screen.getByText('1,000')).toBeInTheDocument()
      })
      
      // Simulate credit purchase
      const response = await fetch('http://localhost:3001/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: 500, paymentMethodId: 'pm_123' })
      })
      
      expect(response.ok).toBe(true)
      
      rerender(<CreditsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('1,500')).toBeInTheDocument()
      })
    })
  })

  describe('Low Balance Warnings', () => {
    it('should display low balance warning when below threshold', async () => {
      // Set balance below threshold
      mockCreditBalance.current = 40
      
      renderWithProviders(<CreditsPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Low credit balance/i)).toBeInTheDocument()
        expect(screen.getByText('40')).toBeInTheDocument()
      })
      
      // Check for warning styling
      const warningElement = screen.getByTestId('low-balance-warning')
      expect(warningElement).toHaveClass('bg-yellow-50')
    })

    it('should display critical warning when balance is very low', async () => {
      mockCreditBalance.current = 10
      
      renderWithProviders(<CreditsPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Critical: Very low credit balance/i)).toBeInTheDocument()
      })
      
      const warningElement = screen.getByTestId('low-balance-warning')
      expect(warningElement).toHaveClass('bg-red-50')
    })
  })

  describe('Real-time Balance Sync', () => {
    it('should update balance via WebSocket events', async () => {
      renderWithProviders(<CreditsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('1,000')).toBeInTheDocument()
      })
      
      // Simulate WebSocket balance update event
      const wsEvent = new CustomEvent('ws:credit-update', {
        detail: { newBalance: 1200 }
      })
      window.dispatchEvent(wsEvent)
      
      await waitFor(() => {
        expect(screen.getByText('1,200')).toBeInTheDocument()
      })
    })
  })

  describe('Auth Store Integration', () => {
    it('should sync balance with auth store', async () => {
      const { result } = renderHook(() => useCredits(), {
        wrapper: TestProviders
      })
      
      await waitFor(() => {
        expect(result.current.balance).toBe(1000)
      })
      
      // Check auth store is updated
      const authStore = useAuthStore.getState()
      expect(authStore.user?.credits).toBe(1000)
    })

    it('should handle unauthenticated state', async () => {
      clearAuth()
      
      renderWithProviders(<CreditsPage />)
      
      await waitFor(() => {
        expect(screen.queryByText('1,000')).not.toBeInTheDocument()
        expect(screen.getByText(/Please log in/i)).toBeInTheDocument()
      })
    })
  })
})