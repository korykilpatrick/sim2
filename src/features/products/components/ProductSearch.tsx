import { useState, useEffect } from 'react'
import { SearchInput } from '@/components/search'
import { useDebounce } from '@/hooks'

interface ProductSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export default function ProductSearch({
  onSearch,
  placeholder = 'Search products...',
}: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch(debouncedSearchQuery)
  }, [debouncedSearchQuery, onSearch])

  return (
    <SearchInput
      value={searchQuery}
      onValueChange={handleSearchChange}
      placeholder={placeholder}
      className="max-w-md"
    />
  )
}
