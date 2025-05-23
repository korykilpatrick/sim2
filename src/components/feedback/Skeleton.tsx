import clsx from 'clsx'

export interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  variant?: 'text' | 'rectangular' | 'circular'
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = ({
  className,
  width,
  height,
  variant = 'text',
  animation = 'pulse',
}: SkeletonProps) => {
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  const baseHeight = {
    text: 'h-4',
    rectangular: 'h-20',
    circular: 'h-12 w-12',
  }

  return (
    <div
      className={clsx(
        'bg-gray-200',
        variantClasses[variant],
        animationClasses[animation],
        !height && baseHeight[variant],
        className,
      )}
      style={{
        width: width,
        height: height,
      }}
      aria-busy="true"
      aria-label="Loading..."
    />
  )
}

// Skeleton variants for common use cases
export const SkeletonText = ({
  lines = 1,
  className,
}: {
  lines?: number
  className?: string
}) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 && lines > 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}

export const SkeletonAvatar = ({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) => {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  )
}

export const SkeletonButton = ({
  width = 100,
  className,
}: {
  width?: number | string
  className?: string
}) => {
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={36}
      className={className}
    />
  )
}

export const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div className={clsx('rounded-lg border border-gray-200 p-4', className)}>
      <div className="flex items-start space-x-4">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
        </div>
      </div>
    </div>
  )
}

export const SkeletonTable = ({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) => {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-lg border border-gray-200',
        className,
      )}
    >
      <div className="bg-gray-50 px-6 py-3">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} variant="text" width={`${100 / columns}%`} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  variant="text"
                  width={`${100 / columns}%`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Skeleton
