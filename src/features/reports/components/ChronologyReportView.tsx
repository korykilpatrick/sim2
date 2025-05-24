import React, { useState, useMemo } from 'react'
import { ChronologyReport, ChronologyEvent } from '../types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import {
  Download,
  Calendar,
  Anchor,
  AlertTriangle,
  Activity,
  Users,
  Fuel,
  MapPin,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/date'

interface ChronologyReportViewProps {
  report: ChronologyReport
  onDownload: (format: 'pdf' | 'excel' | 'json') => void
}

const eventTypeIcons: Record<ChronologyEvent['type'], React.ReactNode> = {
  port_call: <Anchor className="h-4 w-4" />,
  sts_transfer: <Users className="h-4 w-4" />,
  dark_period: <AlertTriangle className="h-4 w-4" />,
  bunkering: <Fuel className="h-4 w-4" />,
  spoofing: <AlertTriangle className="h-4 w-4" />,
  ownership_change: <Users className="h-4 w-4" />,
  flag_change: <MapPin className="h-4 w-4" />,
  risk_change: <Activity className="h-4 w-4" />,
}

const eventTypeColors: Record<ChronologyEvent['type'], string> = {
  port_call: 'bg-blue-100 text-blue-800',
  sts_transfer: 'bg-purple-100 text-purple-800',
  dark_period: 'bg-red-100 text-red-800',
  bunkering: 'bg-green-100 text-green-800',
  spoofing: 'bg-red-100 text-red-800',
  ownership_change: 'bg-gray-100 text-gray-800',
  flag_change: 'bg-indigo-100 text-indigo-800',
  risk_change: 'bg-orange-100 text-orange-800',
}

export const ChronologyReportView: React.FC<ChronologyReportViewProps> = ({
  report,
  onDownload,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEventType, setSelectedEventType] = useState<string>('all')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all')

  const filteredEvents = useMemo(() => {
    let events = [...report.events]

    // Filter by search term
    if (searchTerm) {
      events = events.filter(
        (event) =>
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          event.relatedVessel?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by event type
    if (selectedEventType !== 'all') {
      events = events.filter((event) => event.type === selectedEventType)
    }

    // Filter by risk level
    if (selectedRiskLevel !== 'all') {
      events = events.filter((event) => event.riskLevel === selectedRiskLevel)
    }

    return events
  }, [report.events, searchTerm, selectedEventType, selectedRiskLevel])

  const eventTypeOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'port_call', label: 'Port Calls' },
    { value: 'sts_transfer', label: 'STS Transfers' },
    { value: 'dark_period', label: 'Dark Periods' },
    { value: 'bunkering', label: 'Bunkering' },
    { value: 'inspection', label: 'Inspections' },
    { value: 'detention', label: 'Detentions' },
    { value: 'ownership_change', label: 'Ownership Changes' },
    { value: 'flag_change', label: 'Flag Changes' },
    { value: 'risk_change', label: 'Risk Changes' },
  ]

  const riskLevelOptions = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'critical', label: 'Critical Risk' },
  ]

  const getRiskLevelColor = (level: ChronologyEvent['riskLevel']) => {
    switch (level) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Vessel Chronology Report
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {new Date(report.timeRange.start).toLocaleDateString()} to{' '}
            {new Date(report.timeRange.end).toLocaleDateString()} •{' '}
            {report.events.length} events
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onDownload('pdf')}>
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
              <p className="font-medium">Cargo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {report.summary.portCalls}
              </p>
              <p className="text-sm text-gray-500">Port Calls</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {report.summary.stsTransfers}
              </p>
              <p className="text-sm text-gray-500">STS Transfers</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {report.summary.darkPeriods}
              </p>
              <p className="text-sm text-gray-500">Dark Periods</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {report.summary.flagChanges + report.summary.ownershipChanges}
              </p>
              <p className="text-sm text-gray-500">Risk Changes</p>
            </div>
          </div>
          {report.events.filter((e) => e.riskLevel === 'high').length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-sm font-medium text-red-800">
                  {report.events.filter((e) => e.riskLevel === 'high').length}{' '}
                  high-risk events detected
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                options={eventTypeOptions}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={selectedRiskLevel}
                onChange={(e) => setSelectedRiskLevel(e.target.value)}
                options={riskLevelOptions}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Event Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Events */}
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="relative flex items-start">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute left-2.5 w-3 h-3 rounded-full border-2 border-white',
                      event.riskLevel === 'high'
                        ? 'bg-orange-500'
                        : event.riskLevel === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400',
                    )}
                  />

                  {/* Event content */}
                  <div className="ml-10 flex-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              eventTypeColors[event.type],
                            )}
                          >
                            {eventTypeIcons[event.type]}
                            <span className="ml-1">
                              {event.type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </span>
                          {event.riskLevel && (
                            <span
                              className={cn(
                                'text-xs font-medium uppercase',
                                getRiskLevelColor(event.riskLevel),
                              )}
                            >
                              {event.riskLevel} RISK
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {event.description}
                      </p>

                      {event.location && (
                        <p className="text-sm text-gray-500 mb-2">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {event.location.name ||
                            `${event.location.lat}, ${event.location.lng}`}
                        </p>
                      )}

                      {/* Event-specific details */}
                      {event.relatedVessel && (
                        <p className="text-xs text-gray-600 mt-2">
                          Related vessel: {event.relatedVessel.name} (IMO:{' '}
                          {event.relatedVessel.imo})
                        </p>
                      )}
                      {event.duration && (
                        <p className="text-xs text-gray-600 mt-1">
                          Duration: {event.duration} hours
                        </p>
                      )}
                      {event.details &&
                        Object.keys(event.details).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(event.details).map(
                              ([key, value]) => (
                                <p key={key} className="text-xs text-gray-600">
                                  {key.charAt(0).toUpperCase() +
                                    key.slice(1).replace(/_/g, ' ')}
                                  : {String(value)}
                                </p>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No events found matching your filters
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
