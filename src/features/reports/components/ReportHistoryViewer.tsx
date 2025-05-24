import React, { useState } from 'react'
import { format } from 'date-fns'
import {
  Download,
  Eye,
  Mail,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import { useReports } from '../hooks/useReports'
import { reportApi } from '../services/reportService'
import { emailService } from '../services/emailService'
import { useToast } from '@/hooks/useToast'
import type { ComplianceReport, ChronologyReport } from '../types'

interface ReportHistoryViewerProps {
  vesselId?: string
  limit?: number
  showActions?: boolean
}

export const ReportHistoryViewer: React.FC<ReportHistoryViewerProps> = ({
  vesselId,
  limit: _limit,
  showActions = true,
}) => {
  const { data, isLoading, error } = useReports({ search: vesselId })
  const { showToast } = useToast()
  const [downloadingReports, setDownloadingReports] = useState<Set<string>>(
    new Set(),
  )
  const [emailingReports, setEmailingReports] = useState<Set<string>>(new Set())

  const handleDownload = async (
    reportId: string,
    format: 'pdf' | 'excel' | 'json' = 'pdf',
  ) => {
    setDownloadingReports((prev) => new Set(prev).add(reportId))

    try {
      await reportApi.downloadReport(reportId, format)
      showToast({
        type: 'success',
        message: `Report downloaded successfully`,
      })
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to download report',
      })
    } finally {
      setDownloadingReports((prev) => {
        const next = new Set(prev)
        next.delete(reportId)
        return next
      })
    }
  }

  const handleEmailReport = async (reportId: string) => {
    setEmailingReports((prev) => new Set(prev).add(reportId))

    try {
      // In a real app, you'd show a modal to get recipient email
      const recipientEmail = prompt('Enter recipient email:')
      if (!recipientEmail) return

      const result = await emailService.sendReportEmail({
        reportId,
        recipientEmail,
        includeAttachment: true,
      })

      if (result.success) {
        showToast({
          type: 'success',
          message: 'Report sent successfully',
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to send report',
      })
    } finally {
      setEmailingReports((prev) => {
        const next = new Set(prev)
        next.delete(reportId)
        return next
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getReportTypeLabel = (report: ComplianceReport | ChronologyReport) => {
    if ('riskAssessment' in report) {
      return 'Compliance Report'
    }
    return 'Chronology Report'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load report history</p>
      </div>
    )
  }

  if (!data?.items.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No reports found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Report History</h3>
        <span className="text-sm text-gray-500">
          {data.meta.total} {data.meta.total === 1 ? 'report' : 'reports'}
        </span>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {data.items.map((report) => (
            <li key={report.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(report.status)}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getReportTypeLabel(report)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.vessel.name} • {report.vessel.imo}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Generated{' '}
                        {format(
                          new Date(report.generatedAt),
                          'MMM d, yyyy h:mm a',
                        )}
                      </div>
                    </div>
                  </div>

                  {showActions && report.status === 'completed' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(`/reports/${report.id}`, '_blank')
                        }
                        disabled={report.status !== 'completed'}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(report.id)}
                        disabled={downloadingReports.has(report.id)}
                      >
                        {downloadingReports.has(report.id) ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmailReport(report.id)}
                        disabled={emailingReports.has(report.id)}
                      >
                        {emailingReports.has(report.id) ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="relative">
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {/* Dropdown menu would go here */}
                      </div>
                    </div>
                  )}
                </div>

                {/* Risk score for compliance reports */}
                {'riskAssessment' in report && (
                  <div className="mt-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">Risk Score:</span>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          report.riskAssessment.overallScore >= 80
                            ? 'text-red-600'
                            : report.riskAssessment.overallScore >= 60
                              ? 'text-orange-600'
                              : report.riskAssessment.overallScore >= 40
                                ? 'text-yellow-600'
                                : 'text-green-600'
                        }`}
                      >
                        {report.riskAssessment.overallScore}/100
                      </span>
                    </div>
                  </div>
                )}

                {/* Event count for chronology reports */}
                {'events' in report && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">
                      {report.events.length} events tracked
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {data.meta.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex space-x-2">
            {/* Add pagination controls here */}
          </nav>
        </div>
      )}
    </div>
  )
}
