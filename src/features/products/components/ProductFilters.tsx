import { ProductFilter } from '../types'
import { Select } from '@/components/forms'

interface ProductFiltersProps {
  filters: ProductFilter
  onFilterChange: (filters: ProductFilter) => void
}

export default function ProductFilters({
  filters,
  onFilterChange,
}: ProductFiltersProps) {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value
    onFilterChange({
      ...filters,
      category:
        category === 'all'
          ? undefined
          : (category as ProductFilter['category']),
    })
  }

  return (
    <div className="flex gap-4">
      <Select
        value={filters.category || 'all'}
        onChange={handleCategoryChange}
        options={[
          { value: 'all', label: 'All Categories' },
          { value: 'tracking', label: 'Tracking' },
          { value: 'monitoring', label: 'Monitoring' },
          { value: 'reporting', label: 'Reporting' },
          { value: 'investigation', label: 'Investigation' },
        ]}
        className="w-48"
      />
    </div>
  )
}
