import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CriteriaCategoryGroup from '@features/vessels/components/CriteriaCategoryGroup'
import type { TrackingCriteria } from '@features/vessels/types/vessel'
import { TRACKING_CRITERIA_CATEGORIES } from '@/constants/tracking-criteria'

type TrackingCriteriaCategory = keyof typeof TRACKING_CRITERIA_CATEGORIES

const mockCriteria: TrackingCriteria[] = [
  {
    id: 'ais-1',
    type: 'ais_reporting',
    name: 'AIS Signal Monitoring',
    description: 'Monitor for AIS signal loss',
    enabled: true,
  },
  {
    id: 'dark-1',
    type: 'dark_event',
    name: 'Extended AIS Darkness',
    description: 'Alert when vessel goes dark',
    enabled: true,
  },
  {
    id: 'spoof-1',
    type: 'spoofing',
    name: 'Location Manipulation Detection',
    description: 'Detect AIS spoofing',
    enabled: true,
  },
]

describe('CriteriaCategoryGroup', () => {
  const mockOnToggleCriteria = vi.fn()
  const category: TrackingCriteriaCategory = 'signal_integrity'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders category title correctly', () => {
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    expect(screen.getByText('Signal Integrity')).toBeInTheDocument()
  })

  it('renders all criteria in the category', () => {
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    expect(screen.getByText('AIS Signal Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Extended AIS Darkness')).toBeInTheDocument()
    expect(screen.getByText('Location Manipulation Detection')).toBeInTheDocument()
  })

  it('shows selected criteria count', () => {
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={['ais-1', 'spoof-1']}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    expect(screen.getByText('2 of 3 selected')).toBeInTheDocument()
  })

  it('shows "Select all" button when not all selected', () => {
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={['ais-1']}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    expect(screen.getByText('Select all')).toBeInTheDocument()
    expect(screen.queryByText('Deselect all')).not.toBeInTheDocument()
  })

  it('shows "Deselect all" button when all selected', () => {
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={['ais-1', 'dark-1', 'spoof-1']}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    expect(screen.getByText('Deselect all')).toBeInTheDocument()
    expect(screen.queryByText('Select all')).not.toBeInTheDocument()
  })

  it('calls onToggleCriteria for each criterion when "Select all" clicked', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={['ais-1']}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    await user.click(screen.getByText('Select all'))

    expect(mockOnToggleCriteria).toHaveBeenCalledTimes(2)
    expect(mockOnToggleCriteria).toHaveBeenCalledWith('dark-1')
    expect(mockOnToggleCriteria).toHaveBeenCalledWith('spoof-1')
  })

  it('calls onToggleCriteria for each criterion when "Deselect all" clicked', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={['ais-1', 'dark-1', 'spoof-1']}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    await user.click(screen.getByText('Deselect all'))

    expect(mockOnToggleCriteria).toHaveBeenCalledTimes(3)
    expect(mockOnToggleCriteria).toHaveBeenCalledWith('ais-1')
    expect(mockOnToggleCriteria).toHaveBeenCalledWith('dark-1')
    expect(mockOnToggleCriteria).toHaveBeenCalledWith('spoof-1')
  })

  it('renders in collapsed state when collapsed prop is true', () => {
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
        collapsed={true}
      />
    )

    // Title should be visible
    expect(screen.getByText('Signal Integrity')).toBeInTheDocument()

    // But criteria should not be visible
    expect(screen.queryByText('AIS Signal Monitoring')).not.toBeInTheDocument()
    expect(screen.queryByText('Extended AIS Darkness')).not.toBeInTheDocument()
  })

  it('toggles expanded/collapsed state when header clicked', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    // Initially expanded
    expect(screen.getByText('AIS Signal Monitoring')).toBeInTheDocument()

    // Click header to collapse
    const header = screen.getByRole('button', { name: /Signal Integrity/i })
    await user.click(header)

    // Should be collapsed
    expect(screen.queryByText('AIS Signal Monitoring')).not.toBeInTheDocument()

    // Click again to expand
    await user.click(header)

    // Should be expanded again
    expect(screen.getByText('AIS Signal Monitoring')).toBeInTheDocument()
  })

  it('shows chevron icon that rotates based on state', () => {
    const { container } = render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    const chevron = container.querySelector('.transition-transform')
    expect(chevron).toHaveClass('rotate-0')
  })

  it('applies custom className', () => {
    const { container } = render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('disables criteria when disabled prop is true', () => {
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
        disabled={true}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled()
    })

    // Select all button should also be disabled
    expect(screen.getByText('Select all')).toBeDisabled()
  })

  it('shows credit costs when provided', () => {
    const criteriaWithCosts = mockCriteria.map((c, i) => ({
      ...c,
      creditCost: (i + 1) * 5,
    }))

    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={criteriaWithCosts}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
        showCreditCosts={true}
      />
    )

    // Should show total cost for category
    expect(screen.getByText('Total: 30 credits/day')).toBeInTheDocument()
  })

  it('handles empty criteria array gracefully', () => {
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={[]}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    expect(screen.getByText('Signal Integrity')).toBeInTheDocument()
    expect(screen.getByText('No criteria available')).toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    // Tab to header button
    await user.tab()
    const header = screen.getByRole('button', { name: /Signal Integrity/i })
    expect(header).toHaveFocus()

    // Space to toggle
    await user.keyboard(' ')
    expect(screen.queryByText('AIS Signal Monitoring')).not.toBeInTheDocument()
  })

  it('shows category description when provided', () => {
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
        categoryDescription="Monitor signal integrity and AIS anomalies"
      />
    )

    expect(screen.getByText('Monitor signal integrity and AIS anomalies')).toBeInTheDocument()
  })

  it('maintains individual checkbox functionality', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaCategoryGroup
        category={category}
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    expect(mockOnToggleCriteria).toHaveBeenCalledWith('ais-1')
  })
})