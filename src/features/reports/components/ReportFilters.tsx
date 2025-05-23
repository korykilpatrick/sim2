import { SearchInput } from '@/components/search'
import Select from '@/components/forms/Select'
import type { ReportFilters as ReportFiltersType } from '../types'

interface ReportFiltersProps {
  filters: ReportFiltersType
  onFiltersChange: (filters: ReportFiltersType) => void
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const handleChange = (key: keyof ReportFiltersType, value: string) => {
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
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value as ReportFiltersType['status'])}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>
        <Select
          value={filters.reportType}
          onChange={(e) => handleChange('reportType', e.target.value as ReportFiltersType['reportType'])}
        >
          <option value="all">All Types</option>
          <option value="compliance">Compliance</option>
          <option value="chronology">Chronology</option>
        </Select>
        <Select
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => handleChange('sortBy', e.target.value as ReportFiltersType['sortBy'])}
        >
          <option value="createdAt">Recent First</option>
          <option value="vesselName">Vessel Name</option>
          <option value="status">Status</option>
        </Select>
      </div>
    </div>
  )
}