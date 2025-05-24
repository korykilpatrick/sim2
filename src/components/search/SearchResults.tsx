import { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'

interface SearchResultsProps<T> {
  results: T[]
  isLoading?: boolean
  renderItem: (item: T, index: number) => ReactNode
  onItemClick?: (item: T) => void
  emptyMessage?: string
  className?: string
  itemClassName?: string
}

export function SearchResults<T>({
  results,
  isLoading = false,
  renderItem,
  onItemClick,
  emptyMessage = 'No results found',
  className,
  itemClassName,
}: SearchResultsProps<T>) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <LoadingSpinner size="sm" />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className={cn('py-8 text-center text-sm text-gray-500', className)}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('divide-y divide-gray-100', className)}>
      {results.map((item, index) => (
        <div
          key={index}
          onClick={() => onItemClick?.(item)}
          className={cn(
            'cursor-pointer transition-colors',
            'hover:bg-gray-50',
            onItemClick && 'cursor-pointer',
            itemClassName,
          )}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}
