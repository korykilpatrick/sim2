import {
  ComplianceReport,
  ComplianceReportData,
  ChronologyReportData,
  SanctionsCheck,
  RegulatoryCompliance,
  AISIntegrity,
  OwnershipAnalysis,
  ChronologyEvent,
} from '../types'
import { Card } from '@/components/common'
import { Tabs } from '@/components/common'
import RiskScoreBadge from './RiskScoreBadge'
import { Shield, AlertTriangle, Ship, FileText } from 'lucide-react'
import { useState } from 'react'

interface ComplianceReportViewerProps {
  report: ComplianceReport
}

export default function ComplianceReportViewer({
  report,
}: ComplianceReportViewerProps) {
  if (report.status !== 'completed' || !report.data) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-gray-600">Report data is not available.</p>
        </div>
      </Card>
    )
  }

  if (report.type === 'compliance' && 'riskScore' in report.data) {
    return <ComplianceDataViewer data={report.data} />
  }

  if (report.type === 'chronology' && 'events' in report.data) {
    return <ChronologyDataViewer data={report.data} />
  }

  return null
}

function ComplianceDataViewer({ data }: { data: ComplianceReportData }) {
  const [activeTab, setActiveTab] = useState('sanctions')

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Risk Assessment</h2>
            <RiskScoreBadge score={data.riskScore} level={data.riskLevel} />
          </div>
          <p className="text-gray-600">{data.summary}</p>
        </div>
      </Card>

      <Card>
        <Tabs
          tabs={[
            {
              id: 'sanctions',
              label: 'Sanctions',
              icon: <Shield className="h-4 w-4" />,
            },
            {
              id: 'regulatory',
              label: 'Regulatory',
              icon: <FileText className="h-4 w-4" />,
            },
            {
              id: 'ais',
              label: 'AIS Integrity',
              icon: <Ship className="h-4 w-4" />,
            },
            {
              id: 'ownership',
              label: 'Ownership',
              icon: <AlertTriangle className="h-4 w-4" />,
            },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="p-6">
          {activeTab === 'sanctions' && <SanctionsView data={data.sanctions} />}
          {activeTab === 'regulatory' && (
            <RegulatoryView data={data.regulatory} />
          )}
          {activeTab === 'ais' && <AISView data={data.aisIntegrity} />}
          {activeTab === 'ownership' && <OwnershipView data={data.ownership} />}
        </div>
      </Card>

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
            <ul className="space-y-2">
              {data.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  )
}

function ChronologyDataViewer({ data }: { data: ChronologyReportData }) {
  return (
    <div className="space-y-6">
      {/* Period Overview */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Report Period</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-medium">
                {new Date(data.period.start).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">End Date</p>
              <p className="font-medium">
                {new Date(data.period.end).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold">
                {data.statistics.totalEvents}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Port Calls</p>
              <p className="text-2xl font-bold">{data.statistics.portCalls}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">STS Transfers</p>
              <p className="text-2xl font-bold">
                {data.statistics.stsTransfers}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dark Periods</p>
              <p className="text-2xl font-bold">
                {data.statistics.darkPeriods}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Event Timeline */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Event Timeline</h3>
          <div className="space-y-4">
            {data.events.map((event: ChronologyEvent) => (
              <div
                key={event.id}
                className="border-l-2 border-gray-200 pl-4 pb-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    <p className="font-medium capitalize">
                      {event.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-gray-600">{event.description}</p>
                    {event.location && (
                      <p className="text-sm text-gray-500">
                        Location:{' '}
                        {event.location.name ||
                          `${event.location.lat}, ${event.location.lon}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

// Helper components for compliance tabs
function SanctionsView({ data }: { data: SanctionsCheck }) {
  return (
    <div>
      <div className="mb-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            data.status === 'clear'
              ? 'bg-green-100 text-green-800'
              : data.status === 'flagged'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {data.status.toUpperCase()}
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-sm">
          <strong>OFAC:</strong> {data.lists.ofac ? 'Checked' : 'Not Checked'}
        </p>
        <p className="text-sm">
          <strong>EU:</strong> {data.lists.eu ? 'Checked' : 'Not Checked'}
        </p>
        <p className="text-sm">
          <strong>UN:</strong> {data.lists.un ? 'Checked' : 'Not Checked'}
        </p>
        <p className="text-sm text-gray-600">
          Last checked: {new Date(data.lastChecked).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

function RegulatoryView({ data }: { data: RegulatoryCompliance }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]) => {
          if (key === 'certificates') return null
          return (
            <div key={key}>
              <p className="text-sm font-medium uppercase">{key}</p>
              <p className={value ? 'text-green-600' : 'text-red-600'}>
                {value ? 'Compliant' : 'Non-Compliant'}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AISView({ data }: { data: AISIntegrity }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Spoofing Detected</p>
        <p
          className={data.spoofingDetected ? 'text-red-600' : 'text-green-600'}
        >
          {data.spoofingDetected ? 'Yes' : 'No'}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium">Transmission Quality</p>
        <p>{data.transmissionQuality}%</p>
      </div>
      {data.darkPeriods && data.darkPeriods.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Dark Periods</p>
          <div className="space-y-2">
            {data.darkPeriods.map((period, index) => (
              <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                <p>
                  {new Date(period.start).toLocaleString()} -{' '}
                  {new Date(period.end).toLocaleString()}
                </p>
                <p className="text-gray-600">
                  Duration: {period.duration} hours
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OwnershipView({ data }: { data: OwnershipAnalysis }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Registered Owner</p>
        <p>{data.registeredOwner}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Beneficial Owner</p>
        <p>{data.beneficialOwner}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Flag State</p>
        <p>{data.flag}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Ownership Complexity Score</p>
        <p>{data.complexityScore}/100</p>
      </div>
    </div>
  )
}
