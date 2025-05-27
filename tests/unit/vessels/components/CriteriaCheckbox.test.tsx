import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CriteriaCheckbox from '@features/vessels/components/CriteriaCheckbox'
import type { TrackingCriteria } from '@features/vessels/types/vessel'

const mockCriterion: TrackingCriteria = {
  id: 'ais-1',
  type: 'ais_reporting',
  name: 'AIS Signal Monitoring',
  description: 'Monitor for AIS signal loss, unexpected signal changes, or irregular reporting patterns',
  enabled: true,
  config: {
    minDarkDuration: 300,
    alertOnReappearance: true,
  },
}

describe('CriteriaCheckbox', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders criterion information correctly', () => {
    render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('AIS Signal Monitoring')).toBeInTheDocument()
    expect(
      screen.getByText('Monitor for AIS signal loss, unexpected signal changes, or irregular reporting patterns')
    ).toBeInTheDocument()
  })

  it('shows checked state correctly', () => {
    const { rerender } = render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    rerender(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={true}
        onChange={mockOnChange}
      />
    )

    expect(checkbox).toBeChecked()
  })

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when unchecking', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={true}
        onChange={mockOnChange}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(mockOnChange).toHaveBeenCalledWith(false)
  })

  it('can be disabled', () => {
    render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
        disabled={true}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
        disabled={true}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('shows custom label when provided', () => {
    render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
        label="Custom Label"
      />
    )

    expect(screen.getByText('Custom Label')).toBeInTheDocument()
    expect(screen.queryByText('AIS Signal Monitoring')).not.toBeInTheDocument()
  })

  it('hides description when showDescription is false', () => {
    render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
        showDescription={false}
      />
    )

    expect(screen.getByText('AIS Signal Monitoring')).toBeInTheDocument()
    expect(
      screen.queryByText('Monitor for AIS signal loss, unexpected signal changes, or irregular reporting patterns')
    ).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
        className="custom-class"
      />
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
  })

  it('has proper accessibility attributes', () => {
    render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-label', 'Select AIS Signal Monitoring')
  })

  it('supports keyboard interaction', async () => {
    const user = userEvent.setup()
    render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    checkbox.focus()
    expect(checkbox).toHaveFocus()

    await user.keyboard(' ')
    expect(mockOnChange).toHaveBeenCalledWith(true)
  })

  it('shows indicator for critical criteria types', () => {
    const criticalCriterion: TrackingCriteria = {
      ...mockCriterion,
      type: 'distress',
      name: 'Distress Signal Detection',
    }

    render(
      <CriteriaCheckbox
        criterion={criticalCriterion}
        checked={false}
        onChange={mockOnChange}
      />
    )

    // Should have some visual indicator for critical types
    const label = screen.getByText('Distress Signal Detection')
    expect(label).toHaveClass('text-red-600')
  })

  it('shows configuration summary when available', () => {
    render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
        showConfig={true}
      />
    )

    // Should show some config details
    expect(screen.getByText(/5 minutes/)).toBeInTheDocument()
  })

  it('handles criteria without config gracefully', () => {
    const criterionWithoutConfig: TrackingCriteria = {
      ...mockCriterion,
      config: undefined,
    }

    render(
      <CriteriaCheckbox
        criterion={criterionWithoutConfig}
        checked={false}
        onChange={mockOnChange}
        showConfig={true}
      />
    )

    // Should not crash and still render basic info
    expect(screen.getByText('AIS Signal Monitoring')).toBeInTheDocument()
  })

  it('displays credit cost when provided', () => {
    render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
        creditCost={5}
      />
    )

    expect(screen.getByText('5 credits/day')).toBeInTheDocument()
  })

  it('handles clicking the entire card area', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <CriteriaCheckbox
        criterion={mockCriterion}
        checked={false}
        onChange={mockOnChange}
      />
    )

    const card = container.querySelector('[role="button"]')!
    await user.click(card)

    expect(mockOnChange).toHaveBeenCalledWith(true)
  })

  it('prevents event bubbling when clicking checkbox directly', async () => {
    const user = userEvent.setup()
    const mockCardClick = vi.fn()
    
    render(
      <div onClick={mockCardClick}>
        <CriteriaCheckbox
          criterion={mockCriterion}
          checked={false}
          onChange={mockOnChange}
        />
      </div>
    )

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(mockOnChange).toHaveBeenCalled()
    // Card click should NOT be called since we're stopping propagation
    expect(mockCardClick).not.toHaveBeenCalled()
  })
})