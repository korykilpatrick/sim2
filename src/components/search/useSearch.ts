import { useState, useCallback, useMemo } from 'react'
import { useDebounce } from '@/hooks'

interface UseSearchOptions {
  debounceDelay?: number
  minSearchLength?: number
}

interface UseSearchReturn<T> {
  searchTerm: string
  setSearchTerm: (term: string) => void
  debouncedSearchTerm: string
  isSearching: boolean
  clearSearch: () => void
  filteredItems: T[]
}

export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  options: UseSearchOptions = {},
): UseSearchReturn<T> {
  const { debounceDelay = 300, minSearchLength = 0 } = options

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay)

  const isSearching = searchTerm !== debouncedSearchTerm

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  const filteredItems = useMemo(() => {
    if (debouncedSearchTerm.length < minSearchLength) {
      return items
    }

    const lowerSearchTerm = debouncedSearchTerm.toLowerCase()

    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerSearchTerm)
        }
        if (typeof value === 'number') {
          return value.toString().includes(lowerSearchTerm)
        }
        return false
      }),
    )
  }, [items, searchFields, debouncedSearchTerm, minSearchLength])

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching,
    clearSearch,
    filteredItems,
  }
}
