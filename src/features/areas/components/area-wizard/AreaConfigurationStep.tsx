import Select from '@/components/forms/Select'
import { MonitoringCriteriaSelector } from './MonitoringCriteriaSelector'
import { AreaCostSummary } from './AreaCostSummary'
import { Clock, Calendar } from 'lucide-react'

interface AreaConfigurationStepProps {
  monitoringCriteria: string[]
  onMonitoringCriteriaChange: (criteria: string[]) => void
  updateFrequency: 3 | 6 | 12 | 24
  onUpdateFrequencyChange: (frequency: 3 | 6 | 12 | 24) => void
  durationMonths: number
  onDurationMonthsChange: (months: number) => void
  areaSize: number
}

export function AreaConfigurationStep({
  monitoringCriteria,
  onMonitoringCriteriaChange,
  updateFrequency,
  onUpdateFrequencyChange,
  durationMonths,
  onDurationMonthsChange,
  areaSize,
}: AreaConfigurationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Monitoring Configuration
        </h3>

        <MonitoringCriteriaSelector
          selectedCriteria={monitoringCriteria}
          onCriteriaChange={onMonitoringCriteriaChange}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Update Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline-block h-4 w-4 mr-1" />
              Update Frequency
            </label>
            <Select
              value={updateFrequency.toString()}
              onChange={(e) =>
                onUpdateFrequencyChange(
                  Number(e.target.value) as 3 | 6 | 12 | 24,
                )
              }
            >
              <option value="3">Every 3 hours</option>
              <option value="6">Every 6 hours</option>
              <option value="12">Every 12 hours</option>
              <option value="24">Every 24 hours</option>
            </Select>
            <p className="mt-1 text-sm text-gray-500">
              How often you'll receive updates
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline-block h-4 w-4 mr-1" />
              Monitoring Duration
            </label>
            <Select
              value={durationMonths.toString()}
              onChange={(e) => onDurationMonthsChange(Number(e.target.value))}
            >
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </Select>
            <p className="mt-1 text-sm text-gray-500">
              How long to monitor this area
            </p>
          </div>
        </div>
      </div>

      <AreaCostSummary
        areaSize={areaSize}
        criteriaCount={monitoringCriteria.length}
        updateFrequency={updateFrequency}
        durationMonths={durationMonths}
      />
    </div>
  )
}
