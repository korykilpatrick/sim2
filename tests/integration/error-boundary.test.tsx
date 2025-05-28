import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '@components/feedback'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error from component')
  }
  return <div>No error</div>
}

describe('ErrorBoundary Integration', () => {
  it('should catch errors and display fallback UI', () => {
    const onError = vi.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    // Check error UI is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error from component')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    
    // Check error handler was called
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error from component' }),
      expect.any(Object)
    )
  })
  
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })
  
  it('should reset error state when clicking try again', async () => {
    const user = userEvent.setup()
    let shouldThrow = true
    
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    )
    
    // Verify error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    // Fix the error condition
    shouldThrow = false
    
    // Click try again
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    
    // Re-render with fixed component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    )
    
    // Verify error is cleared
    expect(screen.getByText('No error')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })
  
  it('should use custom fallback when provided', () => {
    const CustomFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
      <div>
        <h1>Custom Error UI</h1>
        <p>{error.message}</p>
        <button onClick={resetError}>Reset</button>
      </div>
    )
    
    render(
      <ErrorBoundary fallback={(error, reset) => <CustomFallback error={error} resetError={reset} />}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument()
    expect(screen.getByText('Test error from component')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })
  
  it('should show error details in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env.DEV
    // @ts-expect-error - mocking env
    import.meta.env.DEV = true
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    // Should show error details section
    expect(screen.getByText('Error details')).toBeInTheDocument()
    
    // Restore environment
    // @ts-expect-error - restoring env
    import.meta.env.DEV = originalEnv
  })
})