import { TrackingCriteria } from '../types/vessel'
import { cn } from '@/utils/cn'

interface CriteriaCheckboxProps {
  criterion: TrackingCriteria
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  showDescription?: boolean
  showConfig?: boolean
  creditCost?: number
  className?: string
}

// Critical criteria types that need special visual treatment
const CRITICAL_CRITERIA_TYPES = ['distress', 'high_risk_area', 'risk_change']

// Format config values for display
const formatConfigValue = (key: string, value: unknown): string => {
  if (key === 'minDarkDuration' && typeof value === 'number') {
    if (value < 3600) {
      return `${value / 60} minutes`
    }
    return `${value / 3600} hours`
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (typeof value === 'number') {
    return value.toString()
  }
  return String(value)
}

export default function CriteriaCheckbox({
  criterion,
  checked,
  onChange,
  disabled = false,
  label,
  showDescription = true,
  showConfig = false,
  creditCost,
  className,
}: CriteriaCheckboxProps) {
  const isCritical = CRITICAL_CRITERIA_TYPES.includes(criterion.type)
  const displayLabel = label || criterion.name

  const handleCardClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }

  return (
    <div
      className={cn(
        'relative border rounded-lg p-4 transition-all',
        checked
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-gray-400',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className
      )}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onChange(!checked)
        }
      }}
    >
      <div className="flex items-start">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:cursor-not-allowed"
          checked={checked}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          disabled={disabled}
          aria-label={`Select ${displayLabel}`}
        />
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <p
              className={cn(
                'font-medium',
                isCritical ? 'text-red-600' : 'text-gray-900'
              )}
            >
              {displayLabel}
            </p>
            {creditCost !== undefined && (
              <span className="text-sm text-gray-500 ml-2">
                {creditCost} credits/day
              </span>
            )}
          </div>
          
          {showDescription && criterion.description && (
            <p className="text-sm text-gray-500 mt-1">{criterion.description}</p>
          )}
          
          {showConfig && criterion.config && (
            <div className="mt-2 text-xs text-gray-600">
              <p className="font-medium mb-1">Configuration:</p>
              <ul className="space-y-0.5">
                {Object.entries(criterion.config).map(([key, value]) => (
                  <li key={key} className="flex items-center">
                    <span className="text-gray-500">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:
                    </span>
                    <span className="ml-1">{formatConfigValue(key, value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}