import { Component, ReactNode, ErrorInfo } from 'react'
import Button from '../common/Button'

/**
 * Props for the ErrorBoundary component.
 */
export interface ErrorBoundaryProps {
  /** Child components to render and protect from errors */
  children: ReactNode
  /** Custom error UI renderer function */
  fallback?: (error: Error, resetError: () => void) => ReactNode
  /** Callback fired when an error is caught (useful for error reporting) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * Internal state for ErrorBoundary component.
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean
  /** The caught error object */
  error: Error | null
}

/**
 * React error boundary component that catches JavaScript errors in child components.
 * Prevents the entire app from crashing and displays a fallback UI.
 *
 * @component
 * @example
 * <ErrorBoundary
 *   onError={(error, errorInfo) => logErrorToService(error, errorInfo)}
 *   fallback={(error, reset) => <CustomErrorUI error={error} onReset={reset} />}
 * >
 *   <App />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  /**
   * Updates state to render fallback UI on next render.
   *
   * @param error - The error that was thrown
   * @returns New state with error information
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  /**
   * Logs error information and calls optional error handler.
   *
   * @param error - The error that was thrown
   * @param errorInfo - Stack trace information
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Log error details for debugging
    // Error tracking service can be integrated here if needed

    this.props.onError?.(error, errorInfo)
  }

  /**
   * Resets the error state to retry rendering children.
   */
  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError)
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Something went wrong
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              {this.state.error.message || 'An unexpected error occurred'}
            </p>
            {import.meta.env.DEV && (
              <details className="mb-4 rounded-md bg-gray-50 p-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error details
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-gray-600">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <Button onClick={this.resetError} variant="primary">
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
