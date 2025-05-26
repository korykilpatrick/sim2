import { useState } from 'react'
import { Card } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Alert from '@/components/feedback/Alert'
import { Investigation } from '../types'
import { formatDate } from '@/utils/date'

interface InvestigationReportProps {
  investigation: Investigation
  onDownload: (reportId: string) => void
}

export function InvestigationReport({
  investigation,
  onDownload,
}: InvestigationReportProps) {
  const [showPreview, setShowPreview] = useState(false)

  if (!investigation.report) {
    return (
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Investigation Report</h3>
        </div>
        <div className="p-4">
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-600 mb-2">
              Your investigation report will be available here once completed.
            </p>
            <p className="text-sm text-gray-500">
              Expected delivery:{' '}
              {investigation.estimatedCompletion
                ? formatDate(investigation.estimatedCompletion)
                : 'TBD'}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Investigation Report</h3>
            <span className="text-sm text-gray-500">
              Generated: {formatDate(investigation.report.generatedAt)}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-6">
          {/* Report Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Report Details
                </h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-600">Investigation ID</dt>
                    <dd className="font-medium">{investigation.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Report Type</dt>
                    <dd className="font-medium capitalize">
                      {investigation.scope} Investigation
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Priority Level</dt>
                    <dd className="font-medium capitalize">
                      {investigation.priority}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  File Information
                </h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-600">File Name</dt>
                    <dd className="font-medium">
                      {investigation.report.fileName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">File Size</dt>
                    <dd className="font-medium">
                      {Math.round(investigation.report.fileSize / 1048576)} MB
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Credits Used</dt>
                    <dd className="font-medium">
                      {investigation.finalCredits?.toLocaleString()} credits
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Key Findings Preview */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Report Highlights
            </h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span className="text-sm">
                    Comprehensive analysis of{' '}
                    {investigation.objectives?.length || 0} investigation
                    objectives
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span className="text-sm">
                    Intelligence gathered from{' '}
                    {
                      Object.values(
                        investigation.requestedSources || {},
                      ).filter(Boolean).length
                    }{' '}
                    different sources
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span className="text-sm">
                    Detailed findings and recommendations from SynMax experts
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Download Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => onDownload(investigation.report!.id)}
              className="flex-1"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download Full Report
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="flex-1"
            >
              Preview Report
            </Button>
          </div>

          {/* Security Notice */}
          <Alert
            variant="info"
            message="This report contains confidential intelligence. Please handle according to your organization's security protocols. Report access expires 90 days after generation."
          />
        </div>
      </Card>

      {/* Report Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Report Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose max-w-none">
                <h1>Maritime Investigation Report</h1>
                <p className="lead">
                  Investigation ID: {investigation.id}
                  <br />
                  Date: {formatDate(investigation.report.generatedAt)}
                </p>

                <h2>Executive Summary</h2>
                <p>
                  This report presents the findings of a comprehensive{' '}
                  {investigation.scope} investigation conducted by SynMax
                  Intelligence experts. The investigation covered the period
                  from {investigation.timeframe?.start} to{' '}
                  {investigation.timeframe?.end}.
                </p>

                <h2>Investigation Objectives</h2>
                <ol>
                  {investigation.objectives?.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ol>

                <h2>Methodology</h2>
                <p>
                  Our investigation utilized the following intelligence sources:
                </p>
                <ul>
                  {Object.entries(investigation.requestedSources || {})
                    .filter(([_, enabled]) => enabled)
                    .map(([source]) => (
                      <li key={source}>
                        {source.replace(/([A-Z])/g, ' $1').trim()}
                      </li>
                    ))}
                </ul>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This is a preview. Download the full
                    report for complete findings, detailed analysis, and
                    recommendations.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close Preview
                </Button>
                <Button onClick={() => onDownload(investigation.report!.id)}>
                  Download Full Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
