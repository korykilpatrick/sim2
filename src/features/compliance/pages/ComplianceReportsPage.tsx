import { useState } from 'react'
import { PageLayout } from '@/components/layout'
import { useComplianceReports } from '../hooks'
import { ComplianceReportList } from '../components'
import { ComplianceFilters } from '../components'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReportFilter } from '../types'

export default function ComplianceReportsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ReportFilter>({})
  const { data, isLoading } = useComplianceReports(filters)

  const handleGenerateReport = () => {
    navigate('/reports/new')
  }

  return (
    <PageLayout
      title="Compliance Reports"
      subtitle="View and generate vessel compliance and chronology reports"
      action={{
        label: 'Generate Report',
        onClick: handleGenerateReport,
        icon: <Plus className="h-4 w-4" />,
      }}
    >
      <div className="space-y-6">
        <ComplianceFilters filters={filters} onFilterChange={setFilters} />

        <ComplianceReportList
          reports={data?.reports || []}
          isLoading={isLoading}
          totalCount={data?.total || 0}
        />
      </div>
    </PageLayout>
  )
}
