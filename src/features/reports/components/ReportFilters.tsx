import { SearchInput } from '@/components/search'
import Select from '@/components/forms/Select'
import type { ReportFilters } from '../types'

interface ReportFiltersProps {
  filters: ReportFilters
  onFiltersChange: (filters: ReportFilters) => void
}

export function ReportFiltersPanel({
  filters,
  onFiltersChange,
}: ReportFiltersProps) {
  const handleChange = (
    key: keyof ReportFilters,
    value: string | undefined,
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchInput
          placeholder="Search reports..."
          value={filters.search || ''}
          onValueChange={(value) => handleChange('search', value)}
        />
        <Select
          value={filters.status || 'all'}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>
        <Select
          value={filters.reportType || 'all'}
          onChange={(e) => handleChange('reportType', e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="compliance">Compliance</option>
          <option value="chronology">Chronology</option>
        </Select>
        <Select
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <option value="createdAt">Recent First</option>
          <option value="vesselName">Vessel Name</option>
          <option value="status">Status</option>
        </Select>
      </div>
    </div>
  )
}
