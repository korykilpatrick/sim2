import { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { SearchInput } from './SearchInput'

interface SearchWithFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  className?: string
  searchClassName?: string
  filtersClassName?: string
}

export function SearchWithFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  className,
  searchClassName,
  filtersClassName,
}: SearchWithFiltersProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center',
        className,
      )}
    >
      <SearchInput
        value={searchValue}
        onValueChange={onSearchChange}
        placeholder={searchPlaceholder}
        containerClassName={cn('flex-1', searchClassName)}
      />
      {filters && (
        <div className={cn('flex items-center gap-2', filtersClassName)}>
          {filters}
        </div>
      )}
    </div>
  )
}
