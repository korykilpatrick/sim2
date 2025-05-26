import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Alert from '@/components/feedback/Alert'

describe('Alert Component', () => {
  it('renders with default info variant', () => {
    render(<Alert message="Test message" />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass('bg-blue-50')
  })

  it('renders with success variant', () => {
    render(<Alert variant="success" message="Success message" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('bg-green-50')
  })

  it('renders with error variant', () => {
    render(<Alert variant="error" message="Error message" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('bg-red-50')
  })

  it('renders with warning variant', () => {
    render(<Alert variant="warning" message="Warning message" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('bg-yellow-50')
  })

  it('renders with title', () => {
    render(<Alert variant="info" title="Test Title" message="Test message" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('handles dismissible alerts', () => {
    const onDismiss = vi.fn()
    render(
      <Alert
        variant="info"
        message="Dismissible message"
        dismissible
        onDismiss={onDismiss}
      />
    )
    
    const dismissButton = screen.getByLabelText('Dismiss')
    fireEvent.click(dismissButton)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('supports custom className', () => {
    render(<Alert message="Test" className="custom-class" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-class')
  })

  it('supports ReactNode messages', () => {
    render(
      <Alert
        message={
          <div>
            <span>Complex</span>
            <strong>Message</strong>
          </div>
        }
      />
    )
    expect(screen.getByText('Complex')).toBeInTheDocument()
    expect(screen.getByText('Message')).toBeInTheDocument()
  })

  it('shows icon by default', () => {
    render(<Alert variant="success" message="Test" />)
    // The icon is rendered as an SVG within the alert
    const alert = screen.getByRole('alert')
    const icon = alert.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('hides icon when icon prop is false', () => {
    render(<Alert variant="success" message="Test" icon={false} />)
    const alert = screen.getByRole('alert')
    const icon = alert.querySelector('svg')
    expect(icon).not.toBeInTheDocument()
  })
})