import { Component, ReactNode, ErrorInfo } from 'react'
import Button from '../common/Button'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, resetError: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

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
            {process.env.NODE_ENV === 'development' && (
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
