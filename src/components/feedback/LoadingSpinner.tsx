import clsx from 'clsx'

/**
 * Props for the LoadingSpinner component
 */
interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Whether to display the spinner centered in full screen
   * @default false
   */
  fullScreen?: boolean
  /**
   * Additional CSS classes to apply to the spinner
   */
  className?: string
}

/**
 * A customizable loading spinner component with support for different sizes
 * and full-screen display mode.
 * 
 * @param {LoadingSpinnerProps} props - The component props
 * @returns {JSX.Element} The rendered loading spinner
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <LoadingSpinner />
 * 
 * // Small spinner
 * <LoadingSpinner size="sm" />
 * 
 * // Full screen loading
 * <LoadingSpinner fullScreen />
 * 
 * // Custom styling
 * <LoadingSpinner className="text-blue-500" />
 * ```
 */
export default function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const spinner = (
    <div
      className={clsx(
        'animate-spin rounded-full border-b-2 border-primary-500',
        sizeClasses[size],
        className,
      )}
    />
  )

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
