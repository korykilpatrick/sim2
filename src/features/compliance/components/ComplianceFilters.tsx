import { ReportFilter } from '../types'
import { Select } from '@/components/forms'
import { SearchInput } from '@/components/search'

interface ComplianceFiltersProps {
  filters: ReportFilter
  onFilterChange: (filters: ReportFilter) => void
}

export default function ComplianceFilters({
  filters,
  onFilterChange,
}: ComplianceFiltersProps) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    onFilterChange({
      ...filters,
      type: value === 'all' ? undefined : (value as ReportFilter['type']),
    })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    onFilterChange({
      ...filters,
      status: value === 'all' ? undefined : (value as ReportFilter['status']),
    })
  }

  const handleSearchChange = (value: string) => {
    onFilterChange({
      ...filters,
      vesselId: value || undefined,
    })
  }

  return (
    <div className="flex flex-wrap gap-4">
      <SearchInput
        value={filters.vesselId || ''}
        onValueChange={handleSearchChange}
        placeholder="Search by vessel name or IMO..."
        className="flex-1 min-w-[200px]"
      />

      <Select
        value={filters.type || 'all'}
        onChange={handleTypeChange}
        options={[
          { value: 'all', label: 'All Types' },
          { value: 'compliance', label: 'Compliance' },
          { value: 'chronology', label: 'Chronology' },
        ]}
        className="w-40"
      />

      <Select
        value={filters.status || 'all'}
        onChange={handleStatusChange}
        options={[
          { value: 'all', label: 'All Status' },
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
          { value: 'failed', label: 'Failed' },
        ]}
        className="w-40"
      />
    </div>
  )
}
