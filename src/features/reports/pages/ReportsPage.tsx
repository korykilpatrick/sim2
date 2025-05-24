import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useReports,
  useReportStatistics,
  useCreateReport,
  useRetryReport,
  useCancelReport,
} from '../hooks'
import {
  ReportList,
  ReportStats,
  ReportFiltersPanel,
  ReportWizard,
} from '../components'
import { PageLayout } from '@/components/layouts'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { Plus } from 'lucide-react'
import type { ReportFilters, ComplianceReport, ChronologyReport } from '../types'
import type { ReportConfiguration } from '../components/report-wizard/ReportConfigurationStep'

export default function ReportsMainPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ReportFilters>({
    status: 'all',
    reportType: 'all',
  })
  const [isCreating, setIsCreating] = useState(false)

  // Hooks
  const { data: reportsData, isLoading: isLoadingReports } = useReports(filters)
  const { data: statsData, isLoading: isLoadingStats } = useReportStatistics()
  const createReportMutation = useCreateReport()
  const retryReportMutation = useRetryReport()
  const cancelReportMutation = useCancelReport()

  const reports = reportsData?.items || []
  const stats = statsData || {
    totalReports: 0,
    completedToday: 0,
    pendingReports: 0,
    creditsUsedToday: 0,
    averageProcessingTime: 0,
    popularReportType: 'compliance' as const,
  }

  const handleCreateReport = async (data: {
    vessel: { id: string; name: string }
    reportType: 'compliance' | 'chronology'
    configuration: ReportConfiguration
  }) => {
    try {
      await createReportMutation.mutateAsync({
        vesselId: data.vessel.id,
        reportType: data.reportType,
        options: {
          timeRange: data.configuration.timeRange ? {
            start: data.configuration.startDate || data.configuration.startDateTime || '',
            end: data.configuration.endDate || data.configuration.endDateTime || '',
          } : undefined,
          includeDetails: true,
        },
      })
      setIsCreating(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleViewReport = (report: ComplianceReport | ChronologyReport) => {
    navigate(`/reports/${report.id}`)
  }

  const handleDownloadReport = (_reportId: string, _format: 'pdf' | 'excel' | 'json') => {
    // Download report logic would be implemented here
    // TODO: Implement download functionality
  }

  if (isLoadingReports || isLoadingStats) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <PageLayout
      title="Reports"
      subtitle="Generate compliance and chronology reports for vessels"
      action={{
        label: 'Generate Report',
        onClick: () => setIsCreating(true),
        icon: <Plus className="h-5 w-5" />,
      }}
    >
      <div className="space-y-8">
        {/* Stats */}
        <ReportStats stats={stats} />

        {/* Filters */}
        <ReportFiltersPanel filters={filters} onFiltersChange={setFilters} />

        {/* Reports List */}
        <ReportList
          reports={reports}
          onViewReport={handleViewReport}
          onDownloadReport={handleDownloadReport}
          onRetryReport={(id) => retryReportMutation.mutate(id)}
          onCancelReport={(id) => cancelReportMutation.mutate(id)}
        />
      </div>

      {/* Create Report Modal */}
      <Modal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Generate New Report"
        size="xl"
      >
        <ReportWizard
          onComplete={handleCreateReport}
          onCancel={() => setIsCreating(false)}
        />
      </Modal>
    </PageLayout>
  )
}