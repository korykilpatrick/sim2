import { useParams, useNavigate } from 'react-router-dom'
import { useReportById, useDownloadReport } from '@/features/reports/hooks'
import {
  ComplianceReportView,
  ChronologyReportView,
} from '@/features/reports/components'
import { PageLayout } from '@/components/layout'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import { Alert } from '@/components/feedback'
import { ArrowLeft } from 'lucide-react'
import Button from '@/components/common/Button'

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: report, isLoading, error } = useReportById(id!)
  const { mutate: downloadReport } = useDownloadReport()

  const handleDownload = (format: 'pdf' | 'excel' | 'json') => {
    if (report) {
      downloadReport({ reportId: report.id, format })
    }
  }

  const handleBack = () => {
    navigate('/reports')
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  if (error || !report) {
    return (
      <PageLayout title="Report Not Found">
        <Alert
          variant="error"
          message="The requested report could not be found."
        />
        <div className="mt-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </PageLayout>
    )
  }

  if (report.status !== 'completed') {
    return (
      <PageLayout title="Report Processing">
        <Alert
          variant="info"
          message="This report is currently being processed. Please check back later."
        />
        <div className="mt-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </PageLayout>
    )
  }

  const isChronologyReport = 'events' in report

  return (
    <PageLayout
      title=""
      action={{
        label: 'Back to Reports',
        onClick: handleBack,
        icon: <ArrowLeft className="h-5 w-5" />,
      }}
    >
      {isChronologyReport ? (
        <ChronologyReportView report={report} onDownload={handleDownload} />
      ) : (
        <ComplianceReportView report={report} onDownload={handleDownload} />
      )}
    </PageLayout>
  )
}
