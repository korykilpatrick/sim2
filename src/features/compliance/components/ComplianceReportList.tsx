import { ComplianceReport } from '../types'
import { Card } from '@/components/common'
import ReportStatusBadge from './ReportStatusBadge'
import RiskScoreBadge from './RiskScoreBadge'
import { FileText, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { NoData } from '@/components/empty-states/EmptyStatePresets'

interface ComplianceReportListProps {
  reports: ComplianceReport[]
  isLoading?: boolean
  totalCount: number
}

export default function ComplianceReportList({
  reports,
  isLoading,
  totalCount,
}: ComplianceReportListProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-24 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <NoData
        title="No reports found"
        description="Generate your first report to get started"
        action={{
          label: 'Generate Report',
          onClick: () => navigate('/reports/new'),
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {reports.length} of {totalCount} reports
        </p>
      </div>

      {reports.map((report) => (
        <Card
          key={report.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/reports/${report.id}`)}
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {report.vesselName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    IMO: {report.vesselImo} •{' '}
                    {report.type === 'compliance' ? 'Compliance' : 'Chronology'}{' '}
                    Report
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Generated:{' '}
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {report.status === 'completed' &&
                  report.data &&
                  'riskLevel' in report.data && (
                    <RiskScoreBadge
                      score={report.data.riskScore}
                      level={report.data.riskLevel}
                      showScore={false}
                    />
                  )}
                <ReportStatusBadge status={report.status} />
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
