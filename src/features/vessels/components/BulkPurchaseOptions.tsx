import { useState } from 'react'
import { cn } from '@utils/cn'
import { BULK_OPTIONS } from '../utils/durationPricing'
import type { BulkOption, PricingResult } from '../utils/durationPricing'

interface BulkPurchaseOptionsProps {
  /** Currently selected vessel count */
  selectedVesselCount: number
  /** Callback when vessel count changes */
  onVesselCountChange: (count: number) => void
  /** Optional pricing calculator to show prices */
  priceCalculator?: (vesselCount: number) => PricingResult
  /** Whether to allow custom vessel count input */
  allowCustom?: boolean
  /** Whether to show a range slider */
  showSlider?: boolean
  /** Whether to show savings summary */
  showSavings?: boolean
  /** Whether the component is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Component for selecting bulk vessel purchase options
 * Displays preset vessel counts with associated discounts
 */
export function BulkPurchaseOptions({
  selectedVesselCount,
  onVesselCountChange,
  priceCalculator,
  allowCustom = false,
  showSlider = false,
  showSavings = false,
  disabled = false,
  className,
}: BulkPurchaseOptionsProps) {
  const [customValue, setCustomValue] = useState(selectedVesselCount.toString())

  const handleCustomChange = (value: string) => {
    setCustomValue(value)
  }

  const handleCustomBlur = () => {
    const parsed = parseInt(customValue, 10)
    if (!isNaN(parsed) && parsed > 0) {
      onVesselCountChange(parsed)
    } else {
      setCustomValue(selectedVesselCount.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, vesselCount: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onVesselCountChange(vesselCount)
    }
  }

  const getOptionBadge = (option: BulkOption) => {
    if (option.vesselCount === 10) return 'Most Popular'
    if (option.vesselCount === 50) return 'Best Value'
    return null
  }

  const currentPricing = priceCalculator?.(selectedVesselCount)
  const selectedOption = BULK_OPTIONS.find(
    (opt) => opt.vesselCount === selectedVesselCount,
  )
  const savings =
    currentPricing && selectedOption?.discount
      ? currentPricing.basePrice - currentPricing.discountedPrice
      : 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Bulk Options Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {BULK_OPTIONS.map((option) => {
          const isSelected = option.vesselCount === selectedVesselCount
          const pricing = priceCalculator?.(option.vesselCount)
          const badge = getOptionBadge(option)

          return (
            <button
              key={option.vesselCount}
              role="button"
              onClick={() => onVesselCountChange(option.vesselCount)}
              onKeyDown={(e) => handleKeyDown(e, option.vesselCount)}
              disabled={disabled}
              className={cn(
                'relative p-4 rounded-lg border-2 transition-all',
                'hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                isSelected && 'border-primary ring-2 ring-primary',
                !isSelected && 'border-border',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {/* Badge */}
              {badge && (
                <span className="absolute -top-2 right-2 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                  {badge}
                </span>
              )}

              {/* Content */}
              <div className="space-y-1">
                <div className="font-medium">{option.label}</div>

                {/* Discount */}
                {option.discount > 0 && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {Math.round(option.discount * 100)}% off
                  </div>
                )}

                {/* Price */}
                {pricing && (
                  <div className="text-sm text-muted-foreground">
                    {pricing.totalCredits.toLocaleString()} credits
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Custom Input */}
      {allowCustom && (
        <div className="flex items-center space-x-2">
          <label htmlFor="custom-vessel-count" className="text-sm font-medium">
            Custom:
          </label>
          <input
            id="custom-vessel-count"
            type="number"
            min="1"
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            onBlur={handleCustomBlur}
            disabled={disabled}
            aria-label="Custom vessel count"
            className={cn(
              'w-24 px-3 py-1 text-sm border rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-primary/20',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          />
          <span className="text-sm text-muted-foreground">vessels</span>
        </div>
      )}

      {/* Range Slider */}
      {showSlider && (
        <div className="space-y-2">
          <label htmlFor="vessel-count-slider" className="text-sm font-medium">
            Vessel Count: {selectedVesselCount}
          </label>
          <input
            id="vessel-count-slider"
            type="range"
            min="1"
            max="100"
            value={selectedVesselCount}
            onChange={(e) => onVesselCountChange(parseInt(e.target.value, 10))}
            disabled={disabled}
            aria-label="Vessel count"
            className={cn(
              'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
              'dark:bg-gray-700',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      )}

      {/* Savings Summary */}
      {showSavings && currentPricing && savings > 0 && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-700 dark:text-green-300">
                Save {savings.toLocaleString()} credits
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {selectedOption &&
                  `${Math.round(selectedOption.discount * 100)}% bulk discount`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-semibold">
                {currentPricing.totalCredits.toLocaleString()} credits
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
