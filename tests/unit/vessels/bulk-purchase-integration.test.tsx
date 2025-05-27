import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BulkPurchaseModal } from '@features/vessels/components/BulkPurchaseModal'
import { TRACKING_CRITERIA } from '@/constants/tracking-criteria'
import type { TrackingCriterion } from '@features/vessels/utils/durationPricing'

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

describe('Bulk Purchase Integration', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()
  const mockOnAddCredits = vi.fn()

  // Convert tracking criteria to have credit costs
  const criteriaWithCosts: TrackingCriterion[] = TRACKING_CRITERIA.slice(
    0,
    3,
  ).map((criterion) => ({
    ...criterion,
    creditCost:
      criterion.id === 'ais-reporting'
        ? 5
        : criterion.id === 'dark-activity'
          ? 3
          : 2,
  }))

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calculates correct pricing for different bulk options', async () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={criteriaWithCosts}
        durationDays={30}
        userCredits={5000}
      />,
    )

    // Base price: (5 + 3 + 2) * 30 * 1 = 300 credits
    expect(screen.getByText(/300 credits/i)).toBeInTheDocument()

    // Select 10 vessels - should apply 15% bulk discount
    const tenVesselsOption = screen.getByRole('button', { name: /10 vessels/i })
    fireEvent.click(tenVesselsOption)

    await waitFor(() => {
      // Base: 300 * 10 = 3000
      // With 15% bulk discount: 3000 * 0.85 = 2550
      expect(screen.getByText(/2,550 credits/i)).toBeInTheDocument()
    })

    // Select 50 vessels - should apply 25% bulk discount
    const fiftyVesselsOption = screen.getByRole('button', {
      name: /50 vessels/i,
    })
    fireEvent.click(fiftyVesselsOption)

    await waitFor(() => {
      // Base: 300 * 50 = 15000
      // With 25% bulk discount: 15000 * 0.75 = 11250
      expect(screen.getByText(/11,250 credits/i)).toBeInTheDocument()
    })
  })

  it('combines bulk and duration discounts correctly', async () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={criteriaWithCosts}
        durationDays={90} // Should apply 20% duration discount
        userCredits={10000}
      />,
    )

    // Select 25 vessels - should apply 20% bulk discount
    const twentyFiveVesselsOption = screen.getByRole('button', {
      name: /25 vessels/i,
    })
    fireEvent.click(twentyFiveVesselsOption)

    await waitFor(() => {
      // Base: 10 * 90 * 25 = 22500
      // Duration discount: 20% off
      // Bulk discount: 20% off
      // Combined multiplicatively: 1 - (1-0.2)*(1-0.2) = 36% off
      // Final: 22500 * 0.64 = 14400
      expect(screen.getByText(/14,400 credits/i)).toBeInTheDocument()
    })
  })

  it('shows package tier discounts when enabled', async () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={criteriaWithCosts}
        durationDays={30}
        showPackageTiers
        userCredits={5000}
      />,
    )

    // Select Gold tier - 10% additional discount
    const goldTier = screen.getByRole('button', { name: /Gold/i })
    fireEvent.click(goldTier)

    // Select 5 vessels - 10% bulk discount
    const fiveVesselsOption = screen.getByRole('button', { name: /5 vessels/i })
    fireEvent.click(fiveVesselsOption)

    await waitFor(() => {
      // Base: 300 * 5 = 1500
      // Bulk: 10% off
      // Package: 10% off
      // Combined: 1 - (1-0.1)*(1-0.1) = 19% off
      // Final: 1500 * 0.81 = 1215
      expect(screen.getByText(/1,215 credits/i)).toBeInTheDocument()
    })
  })

  it('handles insufficient credits scenario', async () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        onAddCredits={mockOnAddCredits}
        selectedCriteria={criteriaWithCosts}
        durationDays={365} // 1 year
        userCredits={1000}
      />,
    )

    // Select 10 vessels - will exceed user credits
    const tenVesselsOption = screen.getByRole('button', { name: /10 vessels/i })
    fireEvent.click(tenVesselsOption)

    await waitFor(() => {
      expect(screen.getByText(/insufficient credits/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /confirm purchase/i }),
      ).toBeDisabled()
      expect(
        screen.getByRole('button', { name: /add credits/i }),
      ).toBeInTheDocument()
    })

    // Click add credits button
    const addCreditsButton = screen.getByRole('button', {
      name: /add credits/i,
    })
    fireEvent.click(addCreditsButton)
    expect(mockOnAddCredits).toHaveBeenCalled()
  })

  it('passes correct purchase details on confirmation', async () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={criteriaWithCosts}
        durationDays={30}
        showPackageTiers
        userCredits={5000}
      />,
    )

    // Select Gold tier
    const goldTier = screen.getByRole('button', { name: /Gold/i })
    fireEvent.click(goldTier)

    // Select 10 vessels
    const tenVesselsOption = screen.getByRole('button', { name: /10 vessels/i })
    fireEvent.click(tenVesselsOption)

    // Confirm purchase
    const confirmButton = screen.getByRole('button', {
      name: /confirm purchase/i,
    })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith({
        vesselCount: 10,
        totalCredits: expect.any(Number),
        criteria: criteriaWithCosts,
        durationDays: 30,
        pricingTier: 'gold',
        appliedDiscounts: expect.arrayContaining(['bulk', 'package']),
      })
    })
  })

  it('allows custom vessel count input', async () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={criteriaWithCosts}
        durationDays={30}
        userCredits={10000}
      />,
    )

    // Enter custom vessel count
    const customInput = screen.getByLabelText(/custom vessel count/i)
    fireEvent.change(customInput, { target: { value: '15' } })
    fireEvent.blur(customInput)

    await waitFor(() => {
      // 15 vessels should apply 15% bulk discount
      // Base: 300 * 15 = 4500
      // With 15% discount: 4500 * 0.85 = 3825
      expect(screen.getByText(/3,825 credits/i)).toBeInTheDocument()
    })
  })

  it('manages vessel names when enabled', async () => {
    renderWithProviders(
      <BulkPurchaseModal
        isOpen
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        selectedCriteria={criteriaWithCosts}
        durationDays={30}
        allowVesselNames
        userCredits={5000}
      />,
    )

    // Select 3 vessels
    const customInput = screen.getByLabelText(/custom vessel count/i)
    fireEvent.change(customInput, { target: { value: '3' } })
    fireEvent.blur(customInput)

    await waitFor(() => {
      expect(screen.getByLabelText(/vessel 1 name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/vessel 2 name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/vessel 3 name/i)).toBeInTheDocument()
    })

    // Enter vessel names
    const vessel1Input = screen.getByLabelText(/vessel 1 name/i)
    const vessel2Input = screen.getByLabelText(/vessel 2 name/i)

    fireEvent.change(vessel1Input, { target: { value: 'MV Explorer' } })
    fireEvent.change(vessel2Input, { target: { value: 'MV Discovery' } })

    // Confirm purchase
    const confirmButton = screen.getByRole('button', {
      name: /confirm purchase/i,
    })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          vesselNames: ['MV Explorer', 'MV Discovery', ''],
        }),
      )
    })
  })
})
