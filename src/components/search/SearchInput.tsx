import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string
  onValueChange: (value: string) => void
  onClear?: () => void
  showClearButton?: boolean
  containerClassName?: string
}

export function SearchInput({
  value,
  onValueChange,
  onClear,
  showClearButton = true,
  containerClassName,
  className,
  placeholder = 'Search...',
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    onValueChange('')
    onClear?.()
  }

  return (
    <div className={cn('relative', containerClassName)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          'w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-10 text-sm',
          'placeholder:text-gray-500',
          'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          className,
        )}
        placeholder={placeholder}
        {...props}
      />
      {showClearButton && value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
