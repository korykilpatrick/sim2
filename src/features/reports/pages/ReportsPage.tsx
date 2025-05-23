import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useReports,
  useReportStatistics,
  useCreateReport,
  useDownloadReport,
  useRetryReport,
  useCancelReport,
} from '../hooks'
import {
  ReportList,
  ReportStats,
  ReportFilters,
  ReportWizard,
} from '../components'
import { PageLayout } from '@/components/layouts'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { Plus } from 'lucide-react'
import type { ReportFilters as ReportFiltersType, ComplianceReport, ChronologyReport } from '../types'
import type { ReportConfiguration } from '../components/report-wizard/ReportConfigurationStep'

export default function ReportsMainPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ReportFiltersType>({
    status: 'all',
    reportType: 'all',
  })
  const [isCreating, setIsCreating] = useState(false)

  // Hooks
  const { data: reportsData, isLoading: isLoadingReports } = useReports(filters)
  const { data: statsData, isLoading: isLoadingStats } = useReportStatistics()
  const createReportMutation = useCreateReport()
  const downloadReportMutation = useDownloadReport('')
  const retryReportMutation = useRetryReport()
  const cancelReportMutation = useCancelReport()

  const reports = reportsData?.data?.data || []
  const stats = statsData?.data?.data || {
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
        configuration: data.configuration,
      })
      setIsCreating(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleViewReport = (report: ComplianceReport | ChronologyReport) => {
    navigate(`/reports/${report.id}`)
  }

  const handleDownloadReport = (id: string, format: 'pdf' | 'excel' | 'json') => {
    downloadReportMutation.mutate(format)
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
        <ReportFilters filters={filters} onFiltersChange={setFilters} />

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