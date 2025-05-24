import React from 'react'
import { ComplianceReport } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
import RiskScoreBadge from '@/features/compliance/components/RiskScoreBadge'
import { Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { clsx } from '@/utils/clsx'

interface ComplianceReportViewProps {
  report: ComplianceReport
  onDownload: (format: 'pdf' | 'excel' | 'json') => void
}

export const ComplianceReportView: React.FC<ComplianceReportViewProps> = ({
  report,
  onDownload,
}) => {
  const getSanctionsIcon = () => {
    switch (report.sanctionsScreening.status) {
      case 'clear':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'flagged':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'blocked':
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Compliance Report
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Generated on {new Date(report.generatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload('pdf')}
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload('excel')}
          >
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
        </div>
      </div>

      {/* Vessel Info */}
      <Card>
        <CardHeader>
          <CardTitle>Vessel Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{report.vessel.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IMO</p>
              <p className="font-medium">{report.vessel.imo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Flag</p>
              <p className="font-medium">{report.vessel.flag}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{report.vessel.type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Risk Assessment</CardTitle>
            <RiskScoreBadge
              score={report.riskAssessment.overallScore}
              level={report.riskAssessment.overallScore >= 75 ? 'critical' : 
                     report.riskAssessment.overallScore >= 50 ? 'high' :
                     report.riskAssessment.overallScore >= 25 ? 'medium' : 'low'}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Overall Risk Level
              </span>
              <span
                className={clsx(
                  'text-lg font-bold uppercase',
                  report.riskAssessment.level === 'low' && 'text-green-600',
                  report.riskAssessment.level === 'medium' && 'text-yellow-600',
                  report.riskAssessment.level === 'high' && 'text-orange-600',
                  report.riskAssessment.level === 'critical' && 'text-red-600',
                )}
              >
                {report.riskAssessment.level}
              </span>
            </div>
          </div>
          {report.riskAssessment.factors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Risk Factors
              </h4>
              <div className="space-y-2">
                {report.riskAssessment.factors.map((factor, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 bg-gray-50 rounded-lg"
                  >
                    <AlertTriangle
                      className={clsx(
                        'h-5 w-5 mr-3 mt-0.5',
                        factor.severity === 'low' && 'text-yellow-500',
                        factor.severity === 'medium' && 'text-orange-500',
                        factor.severity === 'high' && 'text-red-500',
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{factor.category}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {factor.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sanctions Screening */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sanctions Screening</CardTitle>
            {getSanctionsIcon()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={clsx(
                  'font-medium capitalize',
                  report.sanctionsScreening.status === 'clear' &&
                    'text-green-600',
                  report.sanctionsScreening.status === 'flagged' &&
                    'text-yellow-600',
                  report.sanctionsScreening.status === 'blocked' &&
                    'text-red-600',
                )}
              >
                {report.sanctionsScreening.status}
              </span>
            </div>
            {report.sanctionsScreening.matchedLists.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Matched Lists:</p>
                <div className="flex flex-wrap gap-2">
                  {report.sanctionsScreening.matchedLists.map((list) => (
                    <span
                      key={list}
                      className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
                    >
                      {list}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs text-gray-500">
              Last checked: {new Date(report.sanctionsScreening.lastChecked).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div
                  className={clsx(
                    'mx-auto h-12 w-12 rounded-full flex items-center justify-center',
                    report.regulatoryCompliance.imoCompliant
                      ? 'bg-green-100'
                      : 'bg-red-100',
                  )}
                >
                  {report.regulatoryCompliance.imoCompliant ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <p className="mt-2 text-sm font-medium">IMO</p>
              </div>
              <div className="text-center">
                <div
                  className={clsx(
                    'mx-auto h-12 w-12 rounded-full flex items-center justify-center',
                    report.regulatoryCompliance.solasCompliant
                      ? 'bg-green-100'
                      : 'bg-red-100',
                  )}
                >
                  {report.regulatoryCompliance.solasCompliant ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <p className="mt-2 text-sm font-medium">SOLAS</p>
              </div>
              <div className="text-center">
                <div
                  className={clsx(
                    'mx-auto h-12 w-12 rounded-full flex items-center justify-center',
                    report.regulatoryCompliance.marpolCompliant
                      ? 'bg-green-100'
                      : 'bg-red-100',
                  )}
                >
                  {report.regulatoryCompliance.marpolCompliant ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <p className="mt-2 text-sm font-medium">MARPOL</p>
              </div>
            </div>
            {report.regulatoryCompliance.issues.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Compliance Issues:
                </p>
                <ul className="space-y-1">
                  {report.regulatoryCompliance.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-600">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional sections for AIS Integrity, Ownership, Operational History, and Port State Control */}
      {/* These would follow similar patterns */}
    </div>
  )
}