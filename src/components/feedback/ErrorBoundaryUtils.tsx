import React from 'react'
import ErrorBoundary, { ErrorBoundaryProps } from './ErrorBoundary'

// Hook for using error boundary programmatically
export const useErrorHandler = () => {
  return (error: Error) => {
    throw error
  }
}

// Wrapper component for easier usage
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