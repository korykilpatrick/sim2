import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BulkPurchaseModal } from '@features/vessels/components/BulkPurchaseModal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { TrackingCriterion } from '@features/vessels/utils/durationPricing'

// Mock criteria for testing
const mockCriteria: TrackingCriterion[] = [
  {
    id: 'ais-reporting',
    name: 'AIS Reporting',
    description: 'Vessel position updates',
    category: 'signal',
    creditCost: 5,
    configuration: {
      updateInterval: 6,
    },
  },
  {
    id: 'dark-activity',
    name: 'Dark Activity Detection',
    description: 'Detect AIS signal loss',
    category: 'signal',
    creditCost: 3,
    configuration: {},
  },
]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>,
  )
}

describe('BulkPurchaseModal', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal with title', () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
      />,
    )

    expect(
      screen.getByText('Bulk Vessel Tracking Purchase'),
    ).toBeInTheDocument()
  })

  it('shows selected criteria summary', () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
      />,
    )

    expect(screen.getByText('2 tracking criteria selected')).toBeInTheDocument()
    expect(screen.getByText('30 days monitoring')).toBeInTheDocument()
  })

  it('displays bulk purchase options', () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
      />,
    )

    // Check for bulk options
    expect(screen.getByText('1 vessel')).toBeInTheDocument()
    expect(screen.getByText('5 vessels')).toBeInTheDocument()
    expect(screen.getByText('10 vessels')).toBeInTheDocument()
    expect(screen.getByText('25 vessels')).toBeInTheDocument()
    expect(screen.getByText('50 vessels')).toBeInTheDocument()
  })

  it('updates price when vessel count changes', async () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
      />,
    )

    // Initial price for 1 vessel (8 credits/day * 30 days = 240, with 10% duration discount = 216)
    // Use getAllByText since there are multiple price displays
    const initialPrices = screen.getAllByText(/216 credits/i)
    expect(initialPrices[initialPrices.length - 1]).toBeInTheDocument()

    // Select 10 vessels - should apply both duration and bulk discounts
    const tenVesselsOptions = screen.getAllByRole('button', {
      name: /10 vessels/i,
    })
    fireEvent.click(tenVesselsOptions[0])

    await waitFor(() => {
      // Base: 8 * 30 * 10 = 2400
      // Duration discount (30 days): 10% off
      // Bulk discount (10 vessels): 15% off
      // Combined: 1 - (1-0.1)*(1-0.15) = 23.5% off
      // Final: 2400 * 0.765 = 1836
      const updatedPrices = screen.getAllByText(/1,836 credits/i)
      expect(updatedPrices[updatedPrices.length - 1]).toBeInTheDocument()
    })
  })

  it('shows package tier selection', () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
        showPackageTiers
      />,
    )

    expect(screen.getByText('Bronze')).toBeInTheDocument()
    expect(screen.getByText('Silver')).toBeInTheDocument()
    expect(screen.getByText('Gold')).toBeInTheDocument()
    expect(screen.getByText('Platinum')).toBeInTheDocument()
  })

  it('applies package tier discount', async () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
        showPackageTiers
      />,
    )

    // Select Gold tier (10% additional discount)
    const goldTier = screen.getByRole('button', { name: /Gold/i })
    fireEvent.click(goldTier)

    await waitFor(() => {
      expect(screen.getByText(/package discount applied/i)).toBeInTheDocument()
    })
  })

  it('shows detailed price breakdown', () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
      />,
    )

    // Click to expand price breakdown
    const detailsButton = screen.getByRole('button', {
      name: /view price breakdown/i,
    })
    fireEvent.click(detailsButton)

    expect(screen.getByText(/Base price:/i)).toBeInTheDocument()
    expect(screen.getByText(/Duration discount:/i)).toBeInTheDocument()
    expect(screen.getByText(/Price per vessel:/i)).toBeInTheDocument()
    expect(screen.getByText(/Price per day:/i)).toBeInTheDocument()
  })

  it('disables confirm button when no vessels selected', () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
        initialVesselCount={0}
      />,
    )

    const confirmButton = screen.getByRole('button', {
      name: /confirm purchase/i,
    })
    expect(confirmButton).toBeDisabled()
  })

  it('calls onConfirm with purchase details', async () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
      />,
    )

    // Select 5 vessels (use getAllByRole since there might be multiple)
    const fiveVesselsOptions = screen.getAllByRole('button', {
      name: /5 vessels/i,
    })
    fireEvent.click(fiveVesselsOptions[0])

    // Confirm purchase
    const confirmButton = screen.getByRole('button', {
      name: /confirm purchase/i,
    })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith({
        vesselCount: 5,
        totalCredits: expect.any(Number),
        criteria: mockCriteria,
        durationDays: 30,
        pricingTier: undefined,
        appliedDiscounts: expect.arrayContaining(['bulk']),
      })
    })
  })

  it('shows credit balance and warns if insufficient', () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
        userCredits={100}
      />,
    )

    expect(screen.getByText(/available: 100 credits/i)).toBeInTheDocument()

    // Select expensive option that exceeds balance
    const fiftyVesselsOption = screen.getByRole('button', {
      name: /50 vessels/i,
    })
    fireEvent.click(fiftyVesselsOption)

    expect(screen.getByText(/insufficient credits/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /confirm purchase/i }),
    ).toBeDisabled()
  })

  it('shows add credits button when balance insufficient', () => {
    const mockOnAddCredits = vi.fn()

    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
        userCredits={100}
        onAddCredits={mockOnAddCredits}
      />,
    )

    // Select expensive option
    const fiftyVesselsOption = screen.getByRole('button', {
      name: /50 vessels/i,
    })
    fireEvent.click(fiftyVesselsOption)

    const addCreditsButton = screen.getByRole('button', {
      name: /add credits/i,
    })
    expect(addCreditsButton).toBeInTheDocument()

    fireEvent.click(addCreditsButton)
    expect(mockOnAddCredits).toHaveBeenCalled()
  })

  it('handles modal close', () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
      />,
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows loading state during purchase', async () => {
    const slowConfirm = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={slowConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
      />,
    )

    const confirmButton = screen.getByRole('button', {
      name: /confirm purchase/i,
    })
    fireEvent.click(confirmButton)

    expect(screen.getByText(/processing/i)).toBeInTheDocument()
    expect(confirmButton).toBeDisabled()

    await waitFor(() => {
      expect(slowConfirm).toHaveBeenCalled()
    })
  })

  it('supports vessel name input for tracking', async () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={mockCriteria}
        durationDays={30}
        allowVesselNames
      />,
    )

    // Select 5 vessels
    const fiveVesselsOption = screen.getByText('5 vessels').closest('button')
    expect(fiveVesselsOption).toBeInTheDocument()
    fireEvent.click(fiveVesselsOption!)

    // Should show input fields for vessel names
    await waitFor(() => {
      expect(screen.getByLabelText(/vessel 1 name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/vessel 2 name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/vessel 3 name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/vessel 4 name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/vessel 5 name/i)).toBeInTheDocument()
    })
  })
})
