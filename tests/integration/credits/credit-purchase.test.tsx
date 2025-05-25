import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { renderWithProviders, setupAuthenticatedUser, clearAuth, userEvent } from '../../utils/test-utils'
import { server, resetMockData } from '../../utils/api-mocks'
import { http, HttpResponse } from 'msw'
import { CreditsPage } from '@/pages/credits/CreditsPage'
import { CreditPurchaseModal } from '@/features/credits/components/CreditPurchaseModal'

beforeEach(() => {
  setupAuthenticatedUser()
  resetMockData()
})

afterEach(() => {
  clearAuth()
  vi.clearAllMocks()
})

describe('Credit Purchase Integration Tests', () => {
  describe('Purchase Modal UI', () => {
    it('should display available credit packages', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditsPage />)
      
      // Open purchase modal
      const purchaseBtn = await screen.findByText(/Purchase Credits/i)
      await user.click(purchaseBtn)
      
      // Check all packages are displayed
      await waitFor(() => {
        expect(screen.getByText('100 Credits')).toBeInTheDocument()
        expect(screen.getByText('$10.00')).toBeInTheDocument()
        
        expect(screen.getByText('500 Credits')).toBeInTheDocument()
        expect(screen.getByText('$45.00')).toBeInTheDocument()
        expect(screen.getByText('Save 10%')).toBeInTheDocument()
        
        expect(screen.getByText('1,000 Credits')).toBeInTheDocument()
        expect(screen.getByText('$80.00')).toBeInTheDocument()
        expect(screen.getByText('Save 20%')).toBeInTheDocument()
        
        expect(screen.getByText('5,000 Credits')).toBeInTheDocument()
        expect(screen.getByText('$350.00')).toBeInTheDocument()
        expect(screen.getByText('Save 30%')).toBeInTheDocument()
      })
    })

    it('should highlight best value package', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditsPage />)
      
      const purchaseBtn = await screen.findByText(/Purchase Credits/i)
      await user.click(purchaseBtn)
      
      // 1000 credit package should be marked as best value
      const bestValuePackage = screen.getByTestId('package-1000')
      expect(bestValuePackage).toHaveClass('ring-2', 'ring-primary-500')
      
      const badge = within(bestValuePackage).getByText('Best Value')
      expect(badge).toBeInTheDocument()
    })

    it('should calculate price per credit', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditsPage />)
      
      const purchaseBtn = await screen.findByText(/Purchase Credits/i)
      await user.click(purchaseBtn)
      
      // Check price per credit display
      expect(screen.getByText('$0.10 per credit')).toBeInTheDocument() // 100 credits
      expect(screen.getByText('$0.09 per credit')).toBeInTheDocument() // 500 credits
      expect(screen.getByText('$0.08 per credit')).toBeInTheDocument() // 1000 credits
      expect(screen.getByText('$0.07 per credit')).toBeInTheDocument() // 5000 credits
    })
  })

  describe('Purchase Flow', () => {
    it('should complete purchase successfully', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditsPage />)
      
      // Initial balance
      await waitFor(() => {
        expect(screen.getByTestId('credit-balance')).toHaveTextContent('1,000')
      })
      
      // Open purchase modal
      const purchaseBtn = await screen.findByText(/Purchase Credits/i)
      await user.click(purchaseBtn)
      
      // Select 500 credit package
      const package500 = screen.getByTestId('package-500')
      await user.click(package500)
      
      // Enter payment details (mocked)
      const paymentMethodSelect = screen.getByLabelText(/Payment Method/i)
      await user.selectOptions(paymentMethodSelect, 'card_ending_1234')
      
      // Confirm purchase
      const confirmBtn = screen.getByText(/Purchase 500 Credits for \$45/i)
      await user.click(confirmBtn)
      
      // Check loading state
      expect(screen.getByText(/Processing payment/i)).toBeInTheDocument()
      
      // Wait for success
      await waitFor(() => {
        expect(screen.getByText(/Purchase successful/i)).toBeInTheDocument()
      })
      
      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText(/Purchase 500 Credits/i)).not.toBeInTheDocument()
      })
      
      // Balance should be updated
      expect(screen.getByTestId('credit-balance')).toHaveTextContent('1,500')
    })

    it('should show transaction in history after purchase', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditsPage />)
      
      // Make a purchase
      const purchaseBtn = await screen.findByText(/Purchase Credits/i)
      await user.click(purchaseBtn)
      
      const package100 = screen.getByTestId('package-100')
      await user.click(package100)
      
      const confirmBtn = screen.getByText(/Purchase 100 Credits/i)
      await user.click(confirmBtn)
      
      await waitFor(() => {
        expect(screen.getByText(/Purchase successful/i)).toBeInTheDocument()
      })
      
      // Close modal
      const closeBtn = screen.getByLabelText(/Close/i)
      await user.click(closeBtn)
      
      // Check transaction history
      const transactionHistory = screen.getByTestId('transaction-history')
      expect(within(transactionHistory).getByText(/\+100 credits/i)).toBeInTheDocument()
      expect(within(transactionHistory).getByText(/Credit purchase/i)).toBeInTheDocument()
    })
  })

  describe('Payment Processing', () => {
    it('should handle payment method selection', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditPurchaseModal isOpen onClose={() => {}} />)
      
      // Mock multiple payment methods
      server.use(
        http.get('*/payment-methods', () => {
          return HttpResponse.json([
            { id: 'pm_1', last4: '1234', brand: 'Visa' },
            { id: 'pm_2', last4: '5678', brand: 'Mastercard' },
            { id: 'pm_3', last4: '9012', brand: 'Amex' }
          ])
        })
      )
      
      await waitFor(() => {
        expect(screen.getByText('Visa ending in 1234')).toBeInTheDocument()
        expect(screen.getByText('Mastercard ending in 5678')).toBeInTheDocument()
        expect(screen.getByText('Amex ending in 9012')).toBeInTheDocument()
      })
      
      // Select different payment method
      const mastercardOption = screen.getByText('Mastercard ending in 5678')
      await user.click(mastercardOption)
      
      expect(mastercardOption).toHaveAttribute('aria-selected', 'true')
    })

    it('should handle payment failures gracefully', async () => {
      server.use(
        http.post('*/credits/purchase', () => {
          return HttpResponse.json(
            { error: 'Payment declined', code: 'card_declined' },
            { status: 400 }
          )
        })
      )
      
      const user = userEvent.setup()
      renderWithProviders(<CreditsPage />)
      
      // Attempt purchase
      const purchaseBtn = await screen.findByText(/Purchase Credits/i)
      await user.click(purchaseBtn)
      
      const package100 = screen.getByTestId('package-100')
      await user.click(package100)
      
      const confirmBtn = screen.getByText(/Purchase 100 Credits/i)
      await user.click(confirmBtn)
      
      // Check error message
      await waitFor(() => {
        expect(screen.getByText(/Payment declined/i)).toBeInTheDocument()
      })
      
      // Modal should remain open
      expect(screen.getByText(/Select Credit Package/i)).toBeInTheDocument()
      
      // Balance should not change
      expect(screen.getByTestId('credit-balance')).toHaveTextContent('1,000')
    })

    it('should validate minimum purchase amount', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditPurchaseModal isOpen onClose={() => {}} />)
      
      // Try to proceed without selecting a package
      const confirmBtn = screen.getByRole('button', { name: /Purchase Credits/i })
      expect(confirmBtn).toBeDisabled()
      
      // Select a package
      const package100 = screen.getByTestId('package-100')
      await user.click(package100)
      
      // Button should now be enabled
      expect(confirmBtn).toBeEnabled()
    })
  })

  describe('Confirmation and Receipt', () => {
    it('should show purchase confirmation with details', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditsPage />)
      
      // Make purchase
      const purchaseBtn = await screen.findByText(/Purchase Credits/i)
      await user.click(purchaseBtn)
      
      const package1000 = screen.getByTestId('package-1000')
      await user.click(package1000)
      
      const confirmBtn = screen.getByText(/Purchase 1,000 Credits/i)
      await user.click(confirmBtn)
      
      // Wait for confirmation
      await waitFor(() => {
        const confirmation = screen.getByTestId('purchase-confirmation')
        expect(within(confirmation).getByText('1,000 credits')).toBeInTheDocument()
        expect(within(confirmation).getByText('$80.00')).toBeInTheDocument()
        expect(within(confirmation).getByText(/Transaction ID:/i)).toBeInTheDocument()
      })
    })

    it('should allow downloading receipt', async () => {
      const user = userEvent.setup()
      const downloadSpy = vi.spyOn(window, 'open').mockImplementation()
      
      renderWithProviders(<CreditsPage />)
      
      // Complete a purchase
      const purchaseBtn = await screen.findByText(/Purchase Credits/i)
      await user.click(purchaseBtn)
      
      const package500 = screen.getByTestId('package-500')
      await user.click(package500)
      
      const confirmBtn = screen.getByText(/Purchase 500 Credits/i)
      await user.click(confirmBtn)
      
      await waitFor(() => {
        expect(screen.getByText(/Purchase successful/i)).toBeInTheDocument()
      })
      
      // Download receipt
      const downloadBtn = screen.getByText(/Download Receipt/i)
      await user.click(downloadBtn)
      
      expect(downloadSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/credits/receipt/'),
        '_blank'
      )
      
      downloadSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('should handle network errors during purchase', async () => {
      server.use(
        http.post('*/credits/purchase', () => {
          return HttpResponse.error()
        })
      )
      
      const user = userEvent.setup()
      renderWithProviders(<CreditsPage />)
      
      const purchaseBtn = await screen.findByText(/Purchase Credits/i)
      await user.click(purchaseBtn)
      
      const package100 = screen.getByTestId('package-100')
      await user.click(package100)
      
      const confirmBtn = screen.getByText(/Purchase 100 Credits/i)
      await user.click(confirmBtn)
      
      await waitFor(() => {
        expect(screen.getByText(/Network error. Please try again/i)).toBeInTheDocument()
      })
    })

    it('should prevent duplicate purchases', async () => {
      const user = userEvent.setup()
      let purchaseCount = 0
      
      server.use(
        http.post('*/credits/purchase', async () => {
          purchaseCount++
          // Simulate slow response
          await new Promise(resolve => setTimeout(resolve, 100))
          return HttpResponse.json({
            success: true,
            newBalance: 1100,
            transaction: { id: 'tx-1', amount: 100 }
          })
        })
      )
      
      renderWithProviders(<CreditsPage />)
      
      const purchaseBtn = await screen.findByText(/Purchase Credits/i)
      await user.click(purchaseBtn)
      
      const package100 = screen.getByTestId('package-100')
      await user.click(package100)
      
      const confirmBtn = screen.getByText(/Purchase 100 Credits/i)
      
      // Double-click quickly
      await user.click(confirmBtn)
      await user.click(confirmBtn)
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/Purchase successful/i)).toBeInTheDocument()
      })
      
      // Should only have made one purchase
      expect(purchaseCount).toBe(1)
    })
  })
})