import clsx from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  className?: string
}

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
