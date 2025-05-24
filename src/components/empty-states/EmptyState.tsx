import { cn } from '@/utils/cn'
import Button from '@/components/common/Button'
import type { EmptyStateProps } from './types'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-gray-100 p-3">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      )}
      <h3 className="mb-2 text-sm font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  )
}
