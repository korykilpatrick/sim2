import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, renderHook } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import {
  renderWithProviders,
  setupAuthenticatedUser,
  clearAuth,
} from '../../utils/test-helpers'
import { TestProviders } from '../../utils/test-utils'
import { server } from '../../utils/api-mocks'
import {
  featuresCreditHandlers,
  resetFeaturesCreditData,
  mockCreditBalanceFeatures,
} from '../../utils/credit-mocks'
import { CreditsPage } from '@/pages/credits/CreditsPage'
import { useCredits } from '@/features/credits'
import { useAuthStore } from '@/features/auth/services/authStore'

beforeEach(() => {
  setupAuthenticatedUser()
  resetFeaturesCreditData()
  // Use the features/credits handlers for these tests
  server.use(...featuresCreditHandlers)
})

afterEach(() => {
  clearAuth()
  vi.clearAllMocks()
  server.resetHandlers()
})

describe('Credit Balance Integration Tests', () => {
  describe('Balance Display', () => {
    it('should display current credit balance on load', async () => {
      renderWithProviders(<CreditsPage />)

      // Wait for balance to load
      await waitFor(() => {
        const balanceElement = screen.getByTestId('credit-balance')
        expect(balanceElement).toHaveTextContent('1,000 Credits')
      })

      // Check lifetime credits
      expect(screen.getByText('5,000')).toBeInTheDocument()
      expect(screen.getByText(/Lifetime Credits/i)).toBeInTheDocument()
    })

    it('should display expiring credits with correct dates', async () => {
      renderWithProviders(<CreditsPage />)

      await waitFor(() => {
        expect(screen.getByText(/100 credits expiring/i)).toBeInTheDocument()
      })
    })

    it('should show loading state while fetching balance', () => {
      renderWithProviders(<CreditsPage />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should handle balance fetch errors gracefully', async () => {
      server.use(
        http.get('/api/v1/credits/balance', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 })
        }),
      )

      renderWithProviders(<CreditsPage />)

      await waitFor(
        () => {
          expect(
            screen.getByText(/Failed to load credit balance/i),
          ).toBeInTheDocument()
        },
        { timeout: 3000 },
      )
    })
  })

  describe('Balance Updates', () => {
    it('should update balance after credit deduction', async () => {
      const { rerender } = renderWithProviders(<CreditsPage />)

      // Initial balance
      await waitFor(() => {
        const balanceElement = screen.getByTestId('credit-balance')
        expect(balanceElement).toHaveTextContent('1,000 Credits')
      })

      // Simulate credit deduction through API
      const response = await fetch('/api/v1/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100, description: 'Test deduction' }),
      })

      expect(response.ok).toBe(true)

      // Re-render to trigger balance refresh
      rerender(<CreditsPage />)

      await waitFor(() => {
        const balanceElement = screen.getByTestId('credit-balance')
        expect(balanceElement).toHaveTextContent('900 Credits')
      })
    })

    it('should update balance after credit purchase', async () => {
      const { rerender } = renderWithProviders(<CreditsPage />)

      // Initial balance
      await waitFor(() => {
        const balanceElement = screen.getByTestId('credit-balance')
        expect(balanceElement).toHaveTextContent('1,000 Credits')
      })

      // Simulate credit purchase
      const response = await fetch('/api/v1/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: 500, paymentMethodId: 'pm_123' }),
      })

      expect(response.ok).toBe(true)

      rerender(<CreditsPage />)

      await waitFor(() => {
        const balanceElement = screen.getByTestId('credit-balance')
        expect(balanceElement).toHaveTextContent('1,500 Credits')
      })
    })
  })

  describe('Low Balance Warnings', () => {
    it('should display low balance warning when below threshold', async () => {
      // Set balance below threshold
      mockCreditBalanceFeatures.available = 40

      renderWithProviders(<CreditsPage />)

      await waitFor(() => {
        expect(screen.getByText(/Low credit balance/i)).toBeInTheDocument()
        const balanceElement = screen.getByTestId('credit-balance')
        expect(balanceElement).toHaveTextContent('40 Credits')
      })

      // Check for warning styling
      const warningElement = screen.getByTestId('low-balance-warning')
      expect(warningElement).toHaveClass('bg-yellow-50')
    })

    it('should display critical warning when balance is very low', async () => {
      mockCreditBalanceFeatures.available = 10

      renderWithProviders(<CreditsPage />)

      await waitFor(() => {
        expect(
          screen.getByText(/Critical: Very low credit balance/i),
        ).toBeInTheDocument()
      })

      const warningElement = screen.getByTestId('low-balance-warning')
      expect(warningElement).toHaveClass('bg-red-50')
    })
  })

  describe('Real-time Balance Sync', () => {
    it('should update balance via WebSocket events', async () => {
      renderWithProviders(<CreditsPage />)

      await waitFor(() => {
        const balanceElement = screen.getByTestId('credit-balance')
        expect(balanceElement).toHaveTextContent('1,000 Credits')
      })

      // Update the mock balance before triggering the event
      mockCreditBalanceFeatures.available = 1200
      
      // Simulate WebSocket balance update event
      const wsEvent = new CustomEvent('ws:credit-update', {
        detail: { newBalance: 1200 },
      })
      window.dispatchEvent(wsEvent)

      await waitFor(() => {
        const balanceElement = screen.getByTestId('credit-balance')
        expect(balanceElement).toHaveTextContent('1,200 Credits')
      })
    })
  })

  describe('Auth Store Integration', () => {
    it('should sync balance with auth store', async () => {
      const { result } = renderHook(() => useCredits(), {
        wrapper: TestProviders,
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
        expect(screen.queryByTestId('credit-balance')).not.toBeInTheDocument()
        expect(screen.getByText(/Please log in/i)).toBeInTheDocument()
      })
    })
  })
})
