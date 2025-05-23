import React from 'react'
import { ComplianceReport, ChronologyReport } from '../types'
import { Card, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import { FileText, Download, RefreshCw, X, Clock } from 'lucide-react'
import { clsx } from '@/utils/clsx'
import ReportStatusBadge from '@/features/compliance/components/ReportStatusBadge'

interface ReportListProps {
  reports: Array<ComplianceReport | ChronologyReport>
  onViewReport: (report: ComplianceReport | ChronologyReport) => void
  onDownloadReport: (id: string, format: 'pdf' | 'excel' | 'json') => void
  onRetryReport: (id: string) => void
  onCancelReport: (id: string) => void
}

export const ReportList: React.FC<ReportListProps> = ({
  reports,
  onViewReport,
  onDownloadReport,
  onRetryReport,
  onCancelReport,
}) => {
  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No reports yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate your first compliance or chronology report
          </p>
        </CardContent>
      </Card>
    )
  }

  const getReportType = (report: ComplianceReport | ChronologyReport): 'compliance' | 'chronology' => {
    return 'sanctionsScreening' in report ? 'compliance' : 'chronology'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const reportType = getReportType(report)
        return (
          <Card
            key={report.id}
            className={clsx(
              'cursor-pointer transition-all hover:shadow-md',
              report.status === 'failed' && 'border-red-200',
            )}
            onClick={() => report.status === 'completed' && onViewReport(report)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reportType === 'compliance'
                        ? 'Compliance Report'
                        : 'Chronology Report'}
                    </h3>
                    <ReportStatusBadge status={report.status} />
                  </div>
                  
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Vessel:</span>{' '}
                      {report.vessel.name} (IMO: {report.vessel.imo})
                    </div>
                    <div>
                      <span className="font-medium">Flag:</span>{' '}
                      {report.vessel.flag}
                    </div>
                    <div>
                      <span className="font-medium">Generated:</span>{' '}
                      {formatDate(report.generatedAt)}
                    </div>
                    <div>
                      <span className="font-medium">Credits:</span>{' '}
                      {report.credits}
                    </div>
                  </div>

                  {reportType === 'compliance' && report.status === 'completed' && (
                    <div className="mt-3 flex items-center gap-4">
                      <div className={clsx(
                        'text-sm font-medium',
                        (report as ComplianceReport).riskAssessment.level === 'low' && 'text-green-600',
                        (report as ComplianceReport).riskAssessment.level === 'medium' && 'text-yellow-600',
                        (report as ComplianceReport).riskAssessment.level === 'high' && 'text-orange-600',
                        (report as ComplianceReport).riskAssessment.level === 'critical' && 'text-red-600',
                      )}>
                        Risk Level: {(report as ComplianceReport).riskAssessment.level.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Score: {(report as ComplianceReport).riskAssessment.overallScore}/100
                      </div>
                    </div>
                  )}

                  {reportType === 'chronology' && report.status === 'completed' && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Period:</span>{' '}
                      {new Date((report as ChronologyReport).timeRange.start).toLocaleDateString()} -{' '}
                      {new Date((report as ChronologyReport).timeRange.end).toLocaleDateString()} ({' '}
                      {(report as ChronologyReport).summary.totalEvents} events)
                    </div>
                  )}

                  {report.status === 'processing' && (
                    <div className="mt-3 flex items-center text-sm text-blue-600">
                      <Clock className="mr-1 h-4 w-4 animate-pulse" />
                      Processing... This may take a few minutes
                    </div>
                  )}

                  {report.status === 'failed' && (
                    <div className="mt-3 text-sm text-red-600">
                      Report generation failed. Please retry.
                    </div>
                  )}
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  {report.status === 'completed' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownloadReport(report.id, 'pdf')
                        }}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewReport(report)
                        }}
                      >
                        View
                      </Button>
                    </>
                  )}
                  {report.status === 'failed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRetryReport(report.id)
                      }}
                      title="Retry"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  {(report.status === 'pending' || report.status === 'processing') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onCancelReport(report.id)
                      }}
                      title="Cancel"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}