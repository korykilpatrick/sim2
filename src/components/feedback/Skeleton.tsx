import clsx from 'clsx'

/**
 * Props for the Skeleton component
 */
export interface SkeletonProps {
  /**
   * Additional CSS classes to apply to the skeleton
   */
  className?: string
  /**
   * Width of the skeleton (CSS value or number for pixels)
   */
  width?: string | number
  /**
   * Height of the skeleton (CSS value or number for pixels)
   */
  height?: string | number
  /**
   * Visual variant of the skeleton
   * @default 'text'
   */
  variant?: 'text' | 'rectangular' | 'circular'
  /**
   * Animation type for the skeleton
   * @default 'pulse'
   */
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * A flexible skeleton loading component that can be used as a placeholder
 * while content is loading. Supports multiple variants and animations.
 *
 * @param {SkeletonProps} props - The component props
 * @returns {JSX.Element} The rendered skeleton element
 *
 * @example
 * ```tsx
 * // Text skeleton
 * <Skeleton variant="text" width="80%" />
 *
 * // Circular avatar skeleton
 * <Skeleton variant="circular" width={40} height={40} />
 *
 * // Rectangular card skeleton
 * <Skeleton variant="rectangular" width="100%" height={200} />
 *
 * // No animation
 * <Skeleton animation="none" />
 * ```
 */
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

/**
 * A skeleton component specifically designed for text content.
 * Can render multiple lines with the last line being shorter for a more realistic look.
 *
 * @param {Object} props - The component props
 * @param {number} [props.lines=1] - Number of text lines to render
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The rendered skeleton text
 *
 * @example
 * ```tsx
 * // Single line of text
 * <SkeletonText />
 *
 * // Multiple lines
 * <SkeletonText lines={3} />
 * ```
 */
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

/**
 * A circular skeleton component for avatar placeholders.
 *
 * @param {Object} props - The component props
 * @param {number} [props.size=40] - Diameter of the avatar in pixels
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The rendered skeleton avatar
 *
 * @example
 * ```tsx
 * // Default size avatar
 * <SkeletonAvatar />
 *
 * // Large avatar
 * <SkeletonAvatar size={64} />
 * ```
 */
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

/**
 * A rectangular skeleton component for button placeholders.
 *
 * @param {Object} props - The component props
 * @param {number|string} [props.width=100] - Width of the button (CSS value or number for pixels)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The rendered skeleton button
 *
 * @example
 * ```tsx
 * // Default button
 * <SkeletonButton />
 *
 * // Full width button
 * <SkeletonButton width="100%" />
 * ```
 */
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

/**
 * A pre-composed skeleton component for card layouts.
 * Includes an avatar, title, and content lines.
 *
 * @param {Object} props - The component props
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The rendered skeleton card
 *
 * @example
 * ```tsx
 * <SkeletonCard />
 * ```
 */
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

/**
 * A skeleton component for table placeholders.
 * Renders a complete table structure with header and body rows.
 *
 * @param {Object} props - The component props
 * @param {number} [props.rows=5] - Number of body rows to render
 * @param {number} [props.columns=4] - Number of columns to render
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The rendered skeleton table
 *
 * @example
 * ```tsx
 * // Default table
 * <SkeletonTable />
 *
 * // Custom dimensions
 * <SkeletonTable rows={10} columns={6} />
 * ```
 */
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
