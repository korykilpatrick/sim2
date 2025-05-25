import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { renderWithProviders, setupAuthenticatedUser, clearAuth, userEvent } from '../../utils/test-utils'
import { server, resetMockData, mockTransactions } from '../../utils/api-mocks'
import { http, HttpResponse } from 'msw'
import { CreditTransactionHistory } from '@/features/credits/components/CreditTransactionHistory'

beforeEach(() => {
  setupAuthenticatedUser()
  resetMockData()
})

afterEach(() => {
  clearAuth()
  vi.clearAllMocks()
})

describe('Credit Transaction History', () => {
  describe('Transaction Display', () => {
    it('should display transaction history', async () => {
      renderWithProviders(<CreditTransactionHistory />)
      
      await waitFor(() => {
        // Check first transaction (purchase)
        expect(screen.getByText(/Credit package purchase/i)).toBeInTheDocument()
        expect(screen.getByText(/\+500/)).toBeInTheDocument()
        
        // Check second transaction (deduction)
        expect(screen.getByText(/Vessel tracking - 10 days/i)).toBeInTheDocument()
        expect(screen.getByText(/-50/)).toBeInTheDocument()
      })
    })

    it('should format transaction dates correctly', async () => {
      renderWithProviders(<CreditTransactionHistory />)
      
      await waitFor(() => {
        // Should show relative time
        expect(screen.getByText(/1 day ago/i)).toBeInTheDocument()
        expect(screen.getByText(/12 hours ago/i)).toBeInTheDocument()
      })
    })

    it('should show transaction types with appropriate styling', async () => {
      renderWithProviders(<CreditTransactionHistory />)
      
      await waitFor(() => {
        const purchaseRow = screen.getByText(/\+500/).closest('tr')
        const deductionRow = screen.getByText(/-50/).closest('tr')
        
        // Purchase should have green styling
        expect(within(purchaseRow!).getByText(/\+500/)).toHaveClass('text-green-600')
        
        // Deduction should have red styling
        expect(within(deductionRow!).getByText(/-50/)).toHaveClass('text-red-600')
      })
    })

    it('should display running balance', async () => {
      renderWithProviders(<CreditTransactionHistory />)
      
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        
        // Check balance after each transaction
        expect(within(rows[1]).getByText('1,500')).toBeInTheDocument()
        expect(within(rows[2]).getByText('1,450')).toBeInTheDocument()
      })
    })
  })

  describe('Pagination', () => {
    it('should paginate large transaction lists', async () => {
      // Mock many transactions
      const manyTransactions = Array.from({ length: 25 }, (_, i) => ({
        id: `tx-${i}`,
        userId: 'user-1',
        type: i % 2 === 0 ? 'purchase' : 'deduction',
        amount: i % 2 === 0 ? 100 : -50,
        balance: 1000 + (i * 50),
        description: `Transaction ${i}`,
        createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString()
      }))
      
      server.use(
        http.get('*/credits/transactions', ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '10')
          
          const start = (page - 1) * limit
          const paginatedData = manyTransactions.slice(start, start + limit)
          
          return HttpResponse.json({
            transactions: paginatedData,
            total: manyTransactions.length,
            page,
            totalPages: 3
          })
        })
      )
      
      const user = userEvent.setup()
      renderWithProviders(<CreditTransactionHistory />)
      
      // Should show first 10 transactions
      await waitFor(() => {
        expect(screen.getAllByRole('row')).toHaveLength(11) // 10 + header
      })
      
      // Check pagination controls
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      
      // Go to next page
      const nextBtn = screen.getByLabelText(/Next page/i)
      await user.click(nextBtn)
      
      await waitFor(() => {
        expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
      })
      
      // Go to last page
      await user.click(nextBtn)
      
      await waitFor(() => {
        expect(screen.getByText('Page 3 of 3')).toBeInTheDocument()
      })
      
      // Next button should be disabled on last page
      expect(nextBtn).toBeDisabled()
    })
  })

  describe('Filtering and Search', () => {
    it('should filter transactions by type', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditTransactionHistory />)
      
      await waitFor(() => {
        expect(screen.getAllByRole('row')).toHaveLength(3) // 2 transactions + header
      })
      
      // Filter to show only purchases
      const filterSelect = screen.getByLabelText(/Filter by type/i)
      await user.selectOptions(filterSelect, 'purchase')
      
      await waitFor(() => {
        expect(screen.getAllByRole('row')).toHaveLength(2) // 1 purchase + header
        expect(screen.getByText(/Credit package purchase/i)).toBeInTheDocument()
        expect(screen.queryByText(/Vessel tracking/i)).not.toBeInTheDocument()
      })
      
      // Filter to show only deductions
      await user.selectOptions(filterSelect, 'deduction')
      
      await waitFor(() => {
        expect(screen.getAllByRole('row')).toHaveLength(2) // 1 deduction + header
        expect(screen.getByText(/Vessel tracking/i)).toBeInTheDocument()
        expect(screen.queryByText(/Credit package purchase/i)).not.toBeInTheDocument()
      })
    })

    it('should filter by date range', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditTransactionHistory />)
      
      // Set date range to last 7 days
      const dateRangeSelect = screen.getByLabelText(/Date range/i)
      await user.selectOptions(dateRangeSelect, 'last7days')
      
      await waitFor(() => {
        // Both transactions are within last 7 days in mock data
        expect(screen.getAllByRole('row')).toHaveLength(3)
      })
      
      // Set to last 30 days
      await user.selectOptions(dateRangeSelect, 'last30days')
      
      await waitFor(() => {
        expect(screen.getAllByRole('row')).toHaveLength(3)
      })
    })

    it('should search transactions by description', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditTransactionHistory />)
      
      const searchInput = screen.getByPlaceholderText(/Search transactions/i)
      
      // Search for "vessel"
      await user.type(searchInput, 'vessel')
      
      await waitFor(() => {
        expect(screen.getAllByRole('row')).toHaveLength(2) // 1 match + header
        expect(screen.getByText(/Vessel tracking/i)).toBeInTheDocument()
        expect(screen.queryByText(/Credit package purchase/i)).not.toBeInTheDocument()
      })
      
      // Clear search
      await user.clear(searchInput)
      
      await waitFor(() => {
        expect(screen.getAllByRole('row')).toHaveLength(3) // All transactions
      })
    })
  })

  describe('Export Functionality', () => {
    it('should export transactions as CSV', async () => {
      const user = userEvent.setup()
      const downloadSpy = vi.spyOn(window, 'open').mockImplementation()
      
      renderWithProviders(<CreditTransactionHistory />)
      
      await waitFor(() => {
        expect(screen.getByText(/Export/i)).toBeInTheDocument()
      })
      
      const exportBtn = screen.getByText(/Export CSV/i)
      await user.click(exportBtn)
      
      expect(downloadSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/credits/transactions/export?format=csv'),
        '_blank'
      )
      
      downloadSpy.mockRestore()
    })

    it('should export transactions as PDF', async () => {
      const user = userEvent.setup()
      const downloadSpy = vi.spyOn(window, 'open').mockImplementation()
      
      renderWithProviders(<CreditTransactionHistory />)
      
      const exportBtn = screen.getByText(/Export PDF/i)
      await user.click(exportBtn)
      
      expect(downloadSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/credits/transactions/export?format=pdf'),
        '_blank'
      )
      
      downloadSpy.mockRestore()
    })
  })

  describe('Real-time Updates', () => {
    it('should update transaction list when new transaction occurs', async () => {
      renderWithProviders(<CreditTransactionHistory />)
      
      await waitFor(() => {
        expect(screen.getAllByRole('row')).toHaveLength(3) // 2 transactions + header
      })
      
      // Simulate WebSocket event for new transaction
      const newTransaction = {
        id: 'tx-new',
        userId: 'user-1',
        type: 'purchase',
        amount: 1000,
        balance: 2450,
        description: 'New credit purchase',
        createdAt: new Date().toISOString()
      }
      
      const wsEvent = new CustomEvent('ws:transaction-created', {
        detail: { transaction: newTransaction }
      })
      window.dispatchEvent(wsEvent)
      
      await waitFor(() => {
        expect(screen.getAllByRole('row')).toHaveLength(4) // 3 transactions + header
        expect(screen.getByText(/New credit purchase/i)).toBeInTheDocument()
      })
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no transactions', async () => {
      server.use(
        http.get('*/credits/transactions', () => {
          return HttpResponse.json({
            transactions: [],
            total: 0,
            page: 1,
            totalPages: 0
          })
        })
      )
      
      renderWithProviders(<CreditTransactionHistory />)
      
      await waitFor(() => {
        expect(screen.getByText(/No transactions found/i)).toBeInTheDocument()
        expect(screen.getByText(/Your credit transactions will appear here/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      renderWithProviders(<CreditTransactionHistory />)
      
      expect(screen.getByTestId('transaction-skeleton')).toBeInTheDocument()
    })

    it('should handle errors gracefully', async () => {
      server.use(
        http.get('*/credits/transactions', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 })
        })
      )
      
      renderWithProviders(<CreditTransactionHistory />)
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load transactions/i)).toBeInTheDocument()
        expect(screen.getByText(/Try again/i)).toBeInTheDocument()
      })
      
      // Test retry
      const user = userEvent.setup()
      const retryBtn = screen.getByText(/Try again/i)
      
      // Fix the error for retry
      server.use(
        http.get('*/credits/transactions', () => {
          return HttpResponse.json({
            transactions: mockTransactions,
            total: 2,
            page: 1,
            totalPages: 1
          })
        })
      )
      
      await user.click(retryBtn)
      
      await waitFor(() => {
        expect(screen.queryByText(/Failed to load/i)).not.toBeInTheDocument()
        expect(screen.getByText(/Credit package purchase/i)).toBeInTheDocument()
      })
    })
  })

  describe('Transaction Details', () => {
    it('should show transaction details on click', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CreditTransactionHistory />)
      
      await waitFor(() => {
        expect(screen.getByText(/Credit package purchase/i)).toBeInTheDocument()
      })
      
      // Click on a transaction row
      const transactionRow = screen.getByText(/Credit package purchase/i).closest('tr')
      await user.click(transactionRow!)
      
      // Should show detailed modal
      await waitFor(() => {
        const modal = screen.getByRole('dialog')
        expect(within(modal).getByText(/Transaction Details/i)).toBeInTheDocument()
        expect(within(modal).getByText(/Transaction ID:/i)).toBeInTheDocument()
        expect(within(modal).getByText('tx-1')).toBeInTheDocument()
        expect(within(modal).getByText(/Amount: \+500 credits/i)).toBeInTheDocument()
        expect(within(modal).getByText(/New Balance: 1,500 credits/i)).toBeInTheDocument()
      })
    })
  })
})