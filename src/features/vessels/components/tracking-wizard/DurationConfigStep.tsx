import Input from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import TrackingCostSummary from '../TrackingCostSummary'
import { DURATION_OPTIONS, addDuration, formatInputDate } from '@/utils/date'
import { useVesselTrackingCost } from '@/features/shared/hooks'
import type { Vessel } from '../../types'

interface DurationConfigStepProps {
  vessel: Vessel | null
  selectedCriteria: string[]
  trackingDays: number
  endDate: string
  onDaysChange: (days: number) => void
  onEndDateChange: (date: string) => void
}

export function DurationConfigStep({
  vessel,
  selectedCriteria,
  trackingDays,
  endDate,
  onDaysChange,
  onEndDateChange,
}: DurationConfigStepProps) {
  const { totalCost, creditsPerDay } = useVesselTrackingCost({
    criteriaCount: selectedCriteria.length,
    durationDays: trackingDays,
  })

  const handleDurationPresetChange = (value: string) => {
    const days = parseInt(value, 10)
    onDaysChange(days)

    // Update end date based on selected duration
    const newEndDate = addDuration(new Date(), days, 'days')
    onEndDateChange(formatInputDate(newEndDate))
  }

  const handleEndDateChange = (date: string) => {
    onEndDateChange(date)

    // Calculate days from today to selected date
    const today = new Date()
    const selectedDate = new Date(date)
    const diffTime = Math.abs(selectedDate.getTime() - today.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    onDaysChange(diffDays)
  }

  const minDate = formatInputDate(new Date())

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-2">
          Set tracking duration
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how long you want to track this vessel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Duration preset"
          value={trackingDays.toString()}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleDurationPresetChange(e.target.value)
          }
        >
          <option value="">Custom duration</option>
          {DURATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Input
          label="End date"
          type="date"
          value={endDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleEndDateChange(e.target.value)
          }
          min={minDate}
          required
        />
      </div>

      <Input
        label="Tracking duration (days)"
        type="number"
        value={trackingDays}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onDaysChange(Number(e.target.value))
        }
        min={1}
        max={365}
      />

      {vessel && selectedCriteria.length > 0 && (
        <TrackingCostSummary
          creditsPerDay={creditsPerDay}
          totalCredits={totalCost}
          trackingDays={trackingDays}
        />
      )}
    </div>
  )
}
