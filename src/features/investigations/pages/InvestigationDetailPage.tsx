import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import Alert from '@/components/feedback/Alert'
import { InvestigationStatus } from '../components/InvestigationStatus'
import { InvestigationUpdates } from '../components/InvestigationUpdates'
import { ExpertConsultation } from '../components/ExpertConsultation'
import { DocumentUpload } from '../components/DocumentUpload'
import { InvestigationReport } from '../components/InvestigationReport'
import {
  useInvestigation,
  useScheduleConsultation,
  useUploadDocument,
  useDeleteDocument,
  useDownloadReport,
} from '../hooks'

export default function InvestigationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: investigation, isLoading, error } = useInvestigation(id!)
  const scheduleConsultation = useScheduleConsultation()
  const uploadDocument = useUploadDocument()
  const deleteDocument = useDeleteDocument()
  const downloadReport = useDownloadReport()

  if (isLoading) {
    return (
      <PageLayout title="Loading Investigation...">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    )
  }

  if (error || !investigation) {
    return (
      <PageLayout title="Investigation Not Found">
        <Alert
          variant="error"
          message="Unable to load investigation details."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/investigations')}
          className="mt-4"
        >
          Back to Investigations
        </Button>
      </PageLayout>
    )
  }

  const handleScheduleConsultation = async (date: string, notes: string) => {
    await scheduleConsultation.mutateAsync({
      investigationId: investigation.id,
      date,
      notes,
    })
  }

  const handleUploadDocuments = async (files: File[]) => {
    await uploadDocument.mutateAsync({
      investigationId: investigation.id,
      files,
    })
  }

  const handleDeleteDocument = async (documentId: string) => {
    await deleteDocument.mutateAsync({
      investigationId: investigation.id,
      documentId,
    })
  }

  const handleDownloadReport = async (reportId: string) => {
    const blob = await downloadReport.mutateAsync(reportId)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = investigation.report?.fileName || 'investigation-report.pdf'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <PageLayout
      title={investigation.title}
      subtitle={`Investigation #${investigation.id}`}
      action={{
        label: 'Back to List',
        onClick: () => navigate('/investigations'),
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <InvestigationUpdates investigation={investigation} />

          {investigation.status !== 'draft' && (
            <DocumentUpload
              investigationId={investigation.id}
              documents={investigation.documents || []}
              onUpload={handleUploadDocuments}
              onDelete={handleDeleteDocument}
            />
          )}

          {investigation.status === 'completed' && (
            <InvestigationReport
              investigation={investigation}
              onDownload={handleDownloadReport}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <InvestigationStatus investigation={investigation} />

          {(investigation.status === 'under_review' ||
            investigation.status === 'in_progress') && (
            <ExpertConsultation
              investigation={investigation}
              onSchedule={handleScheduleConsultation}
            />
          )}
        </div>
      </div>
    </PageLayout>
  )
}
