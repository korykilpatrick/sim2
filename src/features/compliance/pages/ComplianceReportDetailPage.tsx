import { useParams } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { useComplianceReport, useDownloadReport } from '../hooks'
import { ComplianceReportViewer } from '../components'
import { Button } from '@/components/common'
import { Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '@/components/feedback'

export default function ComplianceReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const { data: report, isLoading } = useComplianceReport(reportId!)
  const downloadReport = useDownloadReport()

  const handleDownload = () => {
    if (!report) return

    downloadReport.mutate({
      reportId: report.id,
      fileName: `${report.type}-report-${report.vesselName}-${report.generatedAt}.pdf`,
    })
  }

  if (isLoading) {
    return (
      <PageLayout title="Loading Report...">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </PageLayout>
    )
  }

  if (!report) {
    return (
      <PageLayout title="Report Not Found">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            The requested report could not be found.
          </p>
          <Button onClick={() => navigate('/reports')}>Back to Reports</Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={`${report.type === 'compliance' ? 'Compliance' : 'Chronology'} Report`}
      subtitle={`${report.vesselName} - Generated ${new Date(report.generatedAt).toLocaleDateString()}`}
      backButton
      backTo="/reports"
      action={{
        label: 'Download PDF',
        onClick: handleDownload,
        icon: <Download className="h-4 w-4" />,
      }}
    >
      <ComplianceReportViewer report={report} />
    </PageLayout>
  )
}
