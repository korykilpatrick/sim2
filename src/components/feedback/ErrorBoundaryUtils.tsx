import React from 'react'
import ErrorBoundary, { ErrorBoundaryProps } from './ErrorBoundary'

/**
 * Hook for programmatically triggering error boundaries.
 *
 * @returns {Function} A function that throws the provided error when called
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const handleError = useErrorHandler();
 *
 *   const fetchData = async () => {
 *     try {
 *       const data = await api.getData();
 *     } catch (error) {
 *       handleError(error as Error);
 *     }
 *   };
 * };
 * ```
 */
export const useErrorHandler = () => {
  return (error: Error) => {
    throw error
  }
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary.
 * Provides a convenient way to add error handling to any component.
 *
 * @template P - The props type of the wrapped component
 * @param {React.ComponentType<P>} Component - The component to wrap with error boundary
 * @param {Omit<ErrorBoundaryProps, 'children'>} [errorBoundaryProps] - Optional props to pass to the ErrorBoundary
 * @returns {React.ComponentType<P>} The wrapped component with error boundary functionality
 *
 * @example
 * ```tsx
 * // Basic usage
 * const SafeComponent = withErrorBoundary(MyComponent);
 *
 * // With custom error handling
 * const SafeComponent = withErrorBoundary(MyComponent, {
 *   onError: (error, errorInfo) => {
 *     console.error('Component error:', error, errorInfo);
 *   },
 *   fallback: <div>Something went wrong!</div>
 * });
 * ```
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
