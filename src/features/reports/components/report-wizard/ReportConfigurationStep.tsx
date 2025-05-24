import { Card } from '@/components/common'
import Input from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import { FileText, Settings } from 'lucide-react'

export interface ReportConfiguration {
  period?: string
  startDate?: string
  endDate?: string
  timeRange?: string
  startDateTime?: string
  endDateTime?: string
  updateFrequency?: string
  sanctions?: boolean
  emissions?: boolean
  certificates?: boolean
  incidents?: boolean
  position?: boolean
  speed?: boolean
  course?: boolean
  portCalls?: boolean
  weather?: boolean
}

interface ReportConfigurationStepProps {
  reportType?: 'compliance' | 'chronology'
  configuration: ReportConfiguration
  onConfigurationChange: (config: ReportConfiguration) => void
}

export function ReportConfigurationStep({
  reportType,
  configuration,
  onConfigurationChange,
}: ReportConfigurationStepProps) {
  const handleChange = (key: keyof ReportConfiguration, value: string | boolean) => {
    onConfigurationChange({
      ...configuration,
      [key]: value,
    })
  }

  if (!reportType) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a report type first
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start space-x-3">
          <Settings className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              Report Configuration
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure the parameters for your {reportType} report
            </p>
          </div>
        </div>
      </Card>

      {reportType === 'compliance' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reporting Period
            </label>
            <Select
              value={configuration.period || '30days'}
              onChange={(e) => handleChange('period', e.target.value)}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="custom">Custom date range</option>
            </Select>
          </div>

          {configuration.period === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={configuration.startDate || ''}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={configuration.endDate || ''}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Sections
            </label>
            <div className="space-y-2">
              {[
                { id: 'sanctions', label: 'Sanctions Compliance' },
                { id: 'emissions', label: 'Emissions Data' },
                { id: 'certificates', label: 'Certificate Status' },
                { id: 'incidents', label: 'Incident History' },
              ].map((section) => (
                <label key={section.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600"
                    checked={configuration[section.id as keyof ReportConfiguration] !== false}
                    onChange={(e) => handleChange(section.id as keyof ReportConfiguration, e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {section.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {reportType === 'chronology' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <Select
              value={configuration.timeRange || '24hours'}
              onChange={(e) => handleChange('timeRange', e.target.value)}
            >
              <option value="24hours">Last 24 hours</option>
              <option value="48hours">Last 48 hours</option>
              <option value="7days">Last 7 days</option>
              <option value="custom">Custom range</option>
            </Select>
          </div>

          {configuration.timeRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date/Time
                </label>
                <Input
                  type="datetime-local"
                  value={configuration.startDateTime || ''}
                  onChange={(e) => handleChange('startDateTime', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date/Time
                </label>
                <Input
                  type="datetime-local"
                  value={configuration.endDateTime || ''}
                  onChange={(e) => handleChange('endDateTime', e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Frequency
            </label>
            <Select
              value={configuration.updateFrequency || 'hourly'}
              onChange={(e) => handleChange('updateFrequency', e.target.value)}
            >
              <option value="realtime">Real-time</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Data
            </label>
            <div className="space-y-2">
              {[
                { id: 'position', label: 'Position Updates' },
                { id: 'speed', label: 'Speed Changes' },
                { id: 'course', label: 'Course Changes' },
                { id: 'portCalls', label: 'Port Calls' },
                { id: 'weather', label: 'Weather Conditions' },
              ].map((dataType) => (
                <label key={dataType.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600"
                    checked={configuration[dataType.id as keyof ReportConfiguration] !== false}
                    onChange={(e) => handleChange(dataType.id as keyof ReportConfiguration, e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {dataType.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900">
              Report Format
            </h4>
            <p className="mt-1 text-sm text-blue-700">
              Your report will be available in PDF, Excel, and JSON formats
              once generated.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}