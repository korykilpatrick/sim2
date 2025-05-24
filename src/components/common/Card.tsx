import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Props for the Card component.
 */
interface CardProps {
  /** Card content */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Padding size variant */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Optional click handler */
  onClick?: () => void
}

/**
 * Props for the CardHeader component.
 */
interface CardHeaderProps {
  /** Header content (typically title) */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Optional action buttons/controls to display on the right */
  actions?: ReactNode
}

/**
 * Props for the CardFooter component.
 */
interface CardFooterProps {
  /** Footer content (typically action buttons) */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Container component with consistent styling, shadow, and border.
 * 
 * @component
 * @example
 * <Card padding="lg">
 *   <CardHeader>
 *     <CardTitle>My Card</CardTitle>
 *   </CardHeader>
 *   <CardContent>Content goes here</CardContent>
 * </Card>
 */
export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Card header section with title and optional action buttons.
 * Includes bottom border for visual separation.
 * 
 * @component
 * @example
 * <CardHeader actions={<Button size="sm">Edit</Button>}>
 *   <CardTitle>Settings</CardTitle>
 * </CardHeader>
 */
export function CardHeader({ children, actions, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between pb-4 border-b border-gray-200',
        className,
      )}
    >
      <div>{children}</div>
      {actions && <div>{actions}</div>}
    </div>
  )
}

/**
 * Styled title component for use within CardHeader.
 * 
 * @component
 */
export function CardTitle({
  children,
  className,
}: {
  /** Title text content */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

/**
 * Main content area of the card with appropriate spacing.
 * 
 * @component
 */
export function CardContent({
  children,
  className,
}: {
  /** Card body content */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}) {
  return <div className={cn('pt-4', className)}>{children}</div>
}

/**
 * Card footer section for action buttons.
 * Right-aligned with top border for visual separation.
 * 
 * @component
 */
export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        'pt-4 mt-4 border-t border-gray-200 flex items-center justify-end space-x-3',
        className,
      )}
    >
      {children}
    </div>
  )
}
