import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CriteriaSelector from '@features/vessels/components/CriteriaSelector'
import type { TrackingCriteria } from '@features/vessels/types/vessel'

// Mock the tracking criteria constants
vi.mock('@/constants/tracking-criteria', () => ({
  TRACKING_CRITERIA_CATEGORIES: [
    'Signal Integrity',
    'Vessel Activity',
    'Compliance & Risk',
    'Safety & Security',
  ],
  getCriteriaByCategory: (category: string) => {
    const categoryMap: Record<string, Array<{ type: string }>> = {
      'Signal Integrity': [
        { type: 'ais_reporting' },
        { type: 'dark_event' },
        { type: 'spoofing' },
      ],
      'Vessel Activity': [
        { type: 'sts_event' },
        { type: 'port_call' },
      ],
      'Compliance & Risk': [
        { type: 'ownership_change' },
        { type: 'flag_change' },
        { type: 'risk_change' },
      ],
      'Safety & Security': [
        { type: 'distress' },
        { type: 'geofence' },
        { type: 'high_risk_area' },
      ],
    }
    return categoryMap[category] || []
  },
}))

// Mock criteria data for testing
const mockCriteria: TrackingCriteria[] = [
  {
    id: 'ais-1',
    type: 'ais_reporting',
    name: 'AIS Signal Monitoring',
    description: 'Monitor for AIS signal loss and changes',
    enabled: true,
    config: { minDarkDuration: 300 },
  },
  {
    id: 'dark-1',
    type: 'dark_event',
    name: 'Extended AIS Darkness',
    description: 'Alert when vessel goes dark for extended periods',
    enabled: true,
    config: { minDarkDuration: 3600 },
  },
  {
    id: 'spoof-1',
    type: 'spoofing',
    name: 'Location Manipulation Detection',
    description: 'Detect potential AIS location spoofing',
    enabled: true,
    config: { maxJumpDistance: 50 },
  },
  {
    id: 'port-1',
    type: 'port_call',
    name: 'Port Call Monitoring',
    description: 'Monitor vessel port arrivals and departures',
    enabled: true,
  },
  {
    id: 'distress-1',
    type: 'distress',
    name: 'Distress Signal Detection',
    description: 'Alert on distress signals',
    enabled: true,
  },
]

describe('CriteriaSelector', () => {
  const mockOnToggleCriteria = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all criteria items', () => {
    render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    // Check that all criteria are rendered
    expect(screen.getByText('AIS Signal Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Extended AIS Darkness')).toBeInTheDocument()
    expect(screen.getByText('Location Manipulation Detection')).toBeInTheDocument()

    // Check descriptions are rendered
    expect(screen.getByText('Monitor for AIS signal loss and changes')).toBeInTheDocument()
    expect(
      screen.getByText('Alert when vessel goes dark for extended periods')
    ).toBeInTheDocument()
    expect(screen.getByText('Detect potential AIS location spoofing')).toBeInTheDocument()

    // Check correct number of checkboxes (5 in our mock data)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(5)
  })

  it('renders empty state when no criteria provided', () => {
    const { container } = render(
      <CriteriaSelector
        criteria={[]}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid?.children).toHaveLength(0)
  })

  it('shows selected criteria with correct styling', () => {
    const { container } = render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={['ais-1', 'spoof-1']}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    // Check that selected items have the selected styling
    const criteriaItems = container.querySelectorAll('.border')
    expect(criteriaItems[0]).toHaveClass('border-primary-500', 'bg-primary-50')
    expect(criteriaItems[1]).not.toHaveClass('border-primary-500', 'bg-primary-50')
    expect(criteriaItems[2]).toHaveClass('border-primary-500', 'bg-primary-50')

    // Check checkboxes are checked
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()
    expect(checkboxes[2]).toBeChecked()
  })

  it('calls onToggleCriteria when clicking on criteria card', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    // Click on the first criteria card
    const firstCard = container.querySelector('.border')!
    await user.click(firstCard)

    expect(mockOnToggleCriteria).toHaveBeenCalledTimes(1)
    expect(mockOnToggleCriteria).toHaveBeenCalledWith('ais-1')
  })

  it('calls onToggleCriteria when clicking on checkbox', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    // Click on the second checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1])

    expect(mockOnToggleCriteria).toHaveBeenCalledTimes(1)
    expect(mockOnToggleCriteria).toHaveBeenCalledWith('dark-1')
  })

  it('prevents event propagation when clicking checkbox', () => {
    render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    const checkbox = screen.getAllByRole('checkbox')[0]
    const clickEvent = new MouseEvent('click', { bubbles: true })
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation')

    fireEvent(checkbox, clickEvent)

    expect(stopPropagationSpy).toHaveBeenCalled()
  })

  it('applies hover styles to unselected criteria', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={['ais-1']}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    const unselectedCard = container.querySelectorAll('.border')[1]
    expect(unselectedCard).toHaveClass('hover:border-gray-400')
    expect(unselectedCard).not.toHaveClass('border-primary-500')

    // Hover should work on unselected items
    await user.hover(unselectedCard)
    // Note: Tailwind hover states are CSS-based, not JS-based, so we can't test the actual hover effect
    // but we can verify the class is present
  })

  it('maintains responsive grid layout', () => {
    const { container } = render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'gap-4')
  })

  it('handles toggling criteria on and off', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    // Click to select
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    expect(mockOnToggleCriteria).toHaveBeenCalledWith('ais-1')

    // Simulate parent component updating selected criteria
    rerender(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={['ais-1']}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    expect(checkboxes[0]).toBeChecked()

    // Click to deselect
    await user.click(checkboxes[0])
    expect(mockOnToggleCriteria).toHaveBeenCalledWith('ais-1')
  })

  it('handles criteria with missing optional fields', () => {
    const minimalCriteria: TrackingCriteria[] = [
      {
        id: 'test-1',
        type: 'port_call',
        name: 'Port Call',
        description: 'Monitor port arrivals',
        enabled: true,
        // No config field
      },
    ]

    render(
      <CriteriaSelector
        criteria={minimalCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    expect(screen.getByText('Port Call')).toBeInTheDocument()
    expect(screen.getByText('Monitor port arrivals')).toBeInTheDocument()
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaSelector
        criteria={mockCriteria.slice(0, 2)} // Only use 2 criteria for simpler test
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    // Tab to first button (criteria card)
    await user.tab()
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveFocus()

    // Space to toggle
    await user.keyboard(' ')
    expect(mockOnToggleCriteria).toHaveBeenCalledWith('ais-1')

    // Tab through the checkbox, then to next button
    await user.tab() // This goes to checkbox
    await user.tab() // This goes to next card
    expect(buttons[1]).toHaveFocus()
  })

  it('renders with proper accessibility attributes', () => {
    render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={['dark-1']}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute('type', 'checkbox')
      expect(checkbox).toHaveClass('text-primary-600')
    })

    // Verify checked state is properly reflected
    expect(checkboxes[0]).not.toBeChecked()
    expect(checkboxes[1]).toBeChecked()
    expect(checkboxes[2]).not.toBeChecked()

    // Check ARIA attributes
    const criteriaButtons = screen.getAllByRole('button')
    expect(criteriaButtons[0]).toHaveAttribute('aria-pressed', 'false')
    expect(criteriaButtons[1]).toHaveAttribute('aria-pressed', 'true')
  })

  it('groups criteria by category when groupByCategory is true', () => {
    render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
        groupByCategory={true}
      />
    )

    // Check category headers are rendered
    expect(screen.getByText('Signal Integrity')).toBeInTheDocument()
    expect(screen.getByText('Vessel Activity')).toBeInTheDocument()
    expect(screen.getByText('Safety & Security')).toBeInTheDocument()

    // Verify criteria are grouped correctly
    const signalIntegritySection = screen.getByText('Signal Integrity').parentElement
    expect(signalIntegritySection).toHaveTextContent('AIS Signal Monitoring')
    expect(signalIntegritySection).toHaveTextContent('Extended AIS Darkness')
    expect(signalIntegritySection).toHaveTextContent('Location Manipulation Detection')

    const vesselActivitySection = screen.getByText('Vessel Activity').parentElement
    expect(vesselActivitySection).toHaveTextContent('Port Call Monitoring')

    const safetySection = screen.getByText('Safety & Security').parentElement
    expect(safetySection).toHaveTextContent('Distress Signal Detection')
  })

  it('hides descriptions when showDescription is false', () => {
    render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
        showDescription={false}
      />
    )

    // Check names are shown
    expect(screen.getByText('AIS Signal Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Extended AIS Darkness')).toBeInTheDocument()

    // Check descriptions are hidden
    expect(screen.queryByText('Monitor for AIS signal loss and changes')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Alert when vessel goes dark for extended periods')
    ).not.toBeInTheDocument()
  })

  it('handles keyboard navigation with Enter and Space keys', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    const firstCriterion = screen.getAllByRole('button')[0]
    
    // Focus on the first criterion
    firstCriterion.focus()
    expect(firstCriterion).toHaveFocus()

    // Press Enter
    await user.keyboard('{Enter}')
    expect(mockOnToggleCriteria).toHaveBeenCalledWith('ais-1')

    // Clear mock
    mockOnToggleCriteria.mockClear()

    // Press Space
    await user.keyboard(' ')
    expect(mockOnToggleCriteria).toHaveBeenCalledWith('ais-1')
  })

  it('maintains category layout with responsive grid', () => {
    const { container } = render(
      <CriteriaSelector
        criteria={mockCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
        groupByCategory={true}
      />
    )

    // Check that category sections maintain grid layout
    const grids = container.querySelectorAll('.grid')
    grids.forEach((grid) => {
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'gap-4')
    })

    // Check category spacing
    const categoryContainer = container.querySelector('.space-y-6')
    expect(categoryContainer).toBeInTheDocument()
  })

  it('handles criteria without categories gracefully', () => {
    const uncategorizedCriteria: TrackingCriteria[] = [
      {
        id: 'unknown-1',
        type: 'unknown_type' as TrackingCriteria['type'],
        name: 'Unknown Criterion',
        description: 'This type is not in any category',
        enabled: true,
      },
    ]

    render(
      <CriteriaSelector
        criteria={uncategorizedCriteria}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
        groupByCategory={true}
      />
    )

    // Should not crash, but criterion won't appear since it has no category
    const container = screen.queryByText('Unknown Criterion')
    expect(container).not.toBeInTheDocument()
  })

  it('includes proper aria-label for checkboxes', () => {
    render(
      <CriteriaSelector
        criteria={mockCriteria.slice(0, 2)}
        selectedCriteria={[]}
        onToggleCriteria={mockOnToggleCriteria}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toHaveAttribute('aria-label', 'Select AIS Signal Monitoring')
    expect(checkboxes[1]).toHaveAttribute('aria-label', 'Select Extended AIS Darkness')
  })
})