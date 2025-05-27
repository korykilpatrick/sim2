import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BulkPurchaseOptions } from '@features/vessels/components/BulkPurchaseOptions'
import { BULK_OPTIONS } from '@features/vessels/utils/durationPricing'

describe('BulkPurchaseOptions', () => {
  const mockOnVesselCountChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders bulk options correctly', () => {
    render(
      <BulkPurchaseOptions
        selectedVesselCount={1}
        onVesselCountChange={mockOnVesselCountChange}
      />,
    )

    // Check that all bulk options are rendered
    BULK_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    })
  })

  it('shows discount percentages for bulk options', () => {
    render(
      <BulkPurchaseOptions
        selectedVesselCount={1}
        onVesselCountChange={mockOnVesselCountChange}
      />,
    )

    // Check discount display
    expect(screen.getByText('10% off')).toBeInTheDocument() // 5 vessels
    expect(screen.getByText('15% off')).toBeInTheDocument() // 10 vessels
    expect(screen.getByText('20% off')).toBeInTheDocument() // 25 vessels

    // Both 50 and 100 vessels have 25% off
    const twentyFiveOffElements = screen.getAllByText('25% off')
    expect(twentyFiveOffElements).toHaveLength(2)
  })

  it('highlights the selected vessel count', () => {
    render(
      <BulkPurchaseOptions
        selectedVesselCount={10}
        onVesselCountChange={mockOnVesselCountChange}
      />,
    )

    const selectedOption = screen.getByRole('button', { name: /10 vessels/i })
    expect(selectedOption).toHaveClass('ring-2', 'ring-primary')
  })

  it('calls onVesselCountChange when an option is clicked', () => {
    render(
      <BulkPurchaseOptions
        selectedVesselCount={1}
        onVesselCountChange={mockOnVesselCountChange}
      />,
    )

    // Find the specific "5 vessels" button by its text content
    const fiveVesselsOption = screen.getByText('5 vessels').closest('button')
    expect(fiveVesselsOption).toBeInTheDocument()
    fireEvent.click(fiveVesselsOption!)

    expect(mockOnVesselCountChange).toHaveBeenCalledWith(5)
  })

  it('supports custom vessel count input', () => {
    render(
      <BulkPurchaseOptions
        selectedVesselCount={1}
        onVesselCountChange={mockOnVesselCountChange}
        allowCustom
      />,
    )

    const customInput = screen.getByLabelText(/custom vessel count/i)
    expect(customInput).toBeInTheDocument()

    // Enter custom value
    fireEvent.change(customInput, { target: { value: '35' } })
    fireEvent.blur(customInput)

    expect(mockOnVesselCountChange).toHaveBeenCalledWith(35)
  })

  it('validates custom input to be positive numbers', () => {
    render(
      <BulkPurchaseOptions
        selectedVesselCount={1}
        onVesselCountChange={mockOnVesselCountChange}
        allowCustom
      />,
    )

    const customInput = screen.getByLabelText(/custom vessel count/i)

    // Try negative number
    fireEvent.change(customInput, { target: { value: '-5' } })
    fireEvent.blur(customInput)

    expect(mockOnVesselCountChange).not.toHaveBeenCalled()
  })

  it('shows price comparison when pricing is provided', () => {
    const mockPriceCalculator = vi.fn((count: number) => ({
      basePrice: count * 100,
      discountedPrice:
        count *
        100 *
        (1 - BULK_OPTIONS.find((o) => o.vesselCount === count)?.discount || 0),
      totalCredits:
        count *
        100 *
        (1 - BULK_OPTIONS.find((o) => o.vesselCount === count)?.discount || 0),
      pricePerVessel:
        100 *
        (1 - BULK_OPTIONS.find((o) => o.vesselCount === count)?.discount || 0),
      pricePerDay: 10,
      appliedDiscounts: count > 1 ? ['bulk'] : [],
    }))

    render(
      <BulkPurchaseOptions
        selectedVesselCount={1}
        onVesselCountChange={mockOnVesselCountChange}
        priceCalculator={mockPriceCalculator}
      />,
    )

    // Check price display for different options
    expect(screen.getByText('100 credits')).toBeInTheDocument() // 1 vessel
    expect(screen.getByText('450 credits')).toBeInTheDocument() // 5 vessels with 10% off
    expect(screen.getByText('850 credits')).toBeInTheDocument() // 10 vessels with 15% off
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <BulkPurchaseOptions
        selectedVesselCount={1}
        onVesselCountChange={mockOnVesselCountChange}
        disabled
      />,
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('shows most popular badge on recommended options', () => {
    render(
      <BulkPurchaseOptions
        selectedVesselCount={1}
        onVesselCountChange={mockOnVesselCountChange}
      />,
    )

    // 10 vessels is marked as most popular
    const popularOption = screen
      .getByText('10 vessels')
      .closest('[role="button"]')
    expect(popularOption).toBeInTheDocument()

    // Check that the Most Popular badge exists
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('shows best value badge on highest discount options', () => {
    render(
      <BulkPurchaseOptions
        selectedVesselCount={1}
        onVesselCountChange={mockOnVesselCountChange}
      />,
    )

    // 50 vessels has the "Best Value" badge
    const bestValueOption = screen
      .getByText('50 vessels')
      .closest('[role="button"]')
    expect(bestValueOption).toBeInTheDocument()

    // Check that the Best Value badge exists
    expect(screen.getByText('Best Value')).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(
      <BulkPurchaseOptions
        selectedVesselCount={1}
        onVesselCountChange={mockOnVesselCountChange}
      />,
    )

    const firstOption = screen.getByText('1 vessel').closest('button')
    const secondOption = screen.getByText('5 vessels').closest('button')

    // Focus first option
    firstOption!.focus()
    expect(document.activeElement).toBe(firstOption)

    // Press Tab to navigate to next option
    fireEvent.keyDown(firstOption!, { key: 'Tab' })

    // Press Enter to select on the second option
    fireEvent.keyDown(secondOption!, { key: 'Enter' })
    expect(mockOnVesselCountChange).toHaveBeenCalledWith(5)
  })

  it('displays vessel count range slider when enabled', () => {
    render(
      <BulkPurchaseOptions
        selectedVesselCount={15}
        onVesselCountChange={mockOnVesselCountChange}
        showSlider
      />,
    )

    const slider = screen.getByRole('slider', { name: /vessel count/i })
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveValue('15')

    // Change slider value
    fireEvent.change(slider, { target: { value: '20' } })
    expect(mockOnVesselCountChange).toHaveBeenCalledWith(20)
  })

  it('shows savings summary', () => {
    const mockPriceCalculator = vi.fn((count: number) => {
      const discount =
        BULK_OPTIONS.find((o) => o.vesselCount === count)?.discount || 0
      const basePrice = count * 100
      return {
        basePrice,
        discountedPrice: basePrice * (1 - discount),
        totalCredits: basePrice * (1 - discount),
        pricePerVessel: 100 * (1 - discount),
        pricePerDay: 10,
        appliedDiscounts: discount > 0 ? ['bulk'] : [],
      }
    })

    render(
      <BulkPurchaseOptions
        selectedVesselCount={25}
        onVesselCountChange={mockOnVesselCountChange}
        priceCalculator={mockPriceCalculator}
        showSavings
      />,
    )

    // 25 vessels = 20% discount
    expect(screen.getByText(/save 500 credits/i)).toBeInTheDocument()
    expect(screen.getByText(/20% bulk discount/i)).toBeInTheDocument()
  })
})
