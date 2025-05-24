import { SearchInput } from '@/components/search'

interface AreaSearchProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  placeholder?: string
}

export function AreaSearch({
  searchQuery,
  onSearchQueryChange,
  placeholder = 'Search areas...',
}: AreaSearchProps) {
  return (
    <SearchInput
      value={searchQuery}
      onValueChange={onSearchQueryChange}
      placeholder={placeholder}
    />
  )
}
