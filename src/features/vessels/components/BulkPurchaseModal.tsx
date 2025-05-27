import { useState, useEffect } from 'react'
import Modal from '@components/common/Modal'
import Button from '@components/common/Button'
import Alert from '@components/feedback/Alert'
import { BulkPurchaseOptions } from './BulkPurchaseOptions'
import { calculateDurationBasedPrice } from '../utils/durationPricing'
import { cn } from '@utils/cn'
import type {
  TrackingCriterion,
  PricingResult,
  PricingTier,
} from '../utils/durationPricing'

interface BulkPurchaseModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal is closed */
  onClose: () => void
  /** Callback when purchase is confirmed */
  onConfirm: (details: PurchaseDetails) => void | Promise<void>
  /** Selected tracking criteria */
  selectedCriteria: TrackingCriterion[]
  /** Duration in days for tracking */
  durationDays: number
  /** Initial vessel count */
  initialVesselCount?: number
  /** User's current credit balance */
  userCredits?: number
  /** Whether to show package tier selection */
  showPackageTiers?: boolean
  /** Whether to allow vessel name input */
  allowVesselNames?: boolean
  /** Callback to add more credits */
  onAddCredits?: () => void
}

export interface PurchaseDetails {
  vesselCount: number
  totalCredits: number
  criteria: TrackingCriterion[]
  durationDays: number
  pricingTier?: PricingTier
  appliedDiscounts: string[]
  vesselNames?: string[]
}

const PACKAGE_TIERS: Array<{
  id: PricingTier
  name: string
  features: string[]
}> = [
  {
    id: 'bronze',
    name: 'Bronze',
    features: ['Basic monitoring', 'Email alerts'],
  },
  {
    id: 'silver',
    name: 'Silver',
    features: ['Enhanced monitoring', 'Email & SMS alerts', 'Basic reports'],
  },
  {
    id: 'gold',
    name: 'Gold',
    features: [
      'Premium monitoring',
      'Priority alerts',
      'Advanced reports',
      'API access',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    features: [
      'Enterprise monitoring',
      '24/7 support',
      'Custom reports',
      'Full API access',
      'Dedicated account manager',
    ],
  },
]

/**
 * Modal for configuring and confirming bulk vessel tracking purchases
 */
export function BulkPurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCriteria,
  durationDays,
  initialVesselCount = 1,
  userCredits,
  showPackageTiers = false,
  allowVesselNames = false,
  onAddCredits,
}: BulkPurchaseModalProps) {
  const [vesselCount, setVesselCount] = useState(initialVesselCount)
  const [selectedTier, setSelectedTier] = useState<PricingTier | undefined>()
  const [vesselNames, setVesselNames] = useState<string[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  // Calculate pricing
  const pricing = calculateDurationBasedPrice({
    criteria: selectedCriteria,
    durationDays,
    vesselCount,
    pricingTier: selectedTier,
  })

  const hasInsufficientCredits =
    userCredits !== undefined && pricing.totalCredits > userCredits

  // Initialize vessel names array when count changes
  useEffect(() => {
    if (allowVesselNames) {
      setVesselNames((prev) => {
        const newNames = [...prev]
        // Add empty strings if needed
        while (newNames.length < vesselCount) {
          newNames.push('')
        }
        // Remove extra names if count decreased
        return newNames.slice(0, vesselCount)
      })
    }
  }, [vesselCount, allowVesselNames])

  const handleConfirm = async () => {
    if (vesselCount === 0 || hasInsufficientCredits) return

    setIsConfirming(true)
    try {
      await onConfirm({
        vesselCount,
        totalCredits: pricing.totalCredits,
        criteria: selectedCriteria,
        durationDays,
        pricingTier: selectedTier,
        appliedDiscounts: pricing.appliedDiscounts,
        vesselNames: allowVesselNames ? vesselNames : undefined,
      })
      onClose()
    } finally {
      setIsConfirming(false)
    }
  }

  const priceCalculator = (count: number): PricingResult => {
    return calculateDurationBasedPrice({
      criteria: selectedCriteria,
      durationDays,
      vesselCount: count,
      pricingTier: selectedTier,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Vessel Tracking Purchase"
      size="xl"
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Tracking criteria:</span>
              <span className="ml-2 font-medium">
                {selectedCriteria.length} tracking criteria selected
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2 font-medium">
                {durationDays} days monitoring
              </span>
            </div>
          </div>
        </div>

        {/* Vessel Count Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Select number of vessels
          </h3>
          <BulkPurchaseOptions
            selectedVesselCount={vesselCount}
            onVesselCountChange={setVesselCount}
            priceCalculator={priceCalculator}
            allowCustom
            showSavings
            disabled={isConfirming}
          />
        </div>

        {/* Package Tier Selection */}
        {showPackageTiers && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Select package tier</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PACKAGE_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  disabled={isConfirming}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    'hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                    selectedTier === tier.id &&
                      'border-primary ring-2 ring-primary',
                    selectedTier !== tier.id && 'border-border',
                    isConfirming && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <div className="font-medium">{tier.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {tier.features[0]}...
                  </div>
                </button>
              ))}
            </div>
            {selectedTier && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                Package discount applied
              </div>
            )}
          </div>
        )}

        {/* Vessel Names */}
        {allowVesselNames && vesselCount > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Vessel names (optional)
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Array.from({ length: vesselCount }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Vessel ${index + 1}`}
                  value={vesselNames[index] || ''}
                  onChange={(e) => {
                    const newNames = [...vesselNames]
                    newNames[index] = e.target.value
                    setVesselNames(newNames)
                  }}
                  disabled={isConfirming}
                  aria-label={`Vessel ${index + 1} name`}
                  className={cn(
                    'w-full px-3 py-2 border rounded-md',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20',
                    isConfirming && 'opacity-50 cursor-not-allowed',
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Price Details */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary hover:underline focus:outline-none"
          >
            {showDetails ? 'Hide' : 'View'} price breakdown
          </button>

          {showDetails && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base price:</span>
                <span>{pricing.basePrice.toLocaleString()} credits</span>
              </div>
              {pricing.appliedDiscounts.includes('duration') && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Duration discount:
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    Applied
                  </span>
                </div>
              )}
              {pricing.appliedDiscounts.includes('bulk') && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bulk discount:</span>
                  <span className="text-green-600 dark:text-green-400">
                    Applied
                  </span>
                </div>
              )}
              {pricing.appliedDiscounts.includes('package') && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Package discount:
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    Applied
                  </span>
                </div>
              )}
              <div className="border-t pt-1 mt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Price per vessel:
                  </span>
                  <span>
                    {Math.round(pricing.pricePerVessel).toLocaleString()}{' '}
                    credits
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per day:</span>
                  <span>
                    {Math.round(pricing.pricePerDay).toLocaleString()} credits
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Total and Actions */}
        <div className="border-t pt-4 space-y-3">
          {/* Credit Balance Warning */}
          {userCredits !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Available: {userCredits.toLocaleString()} credits
              </span>
              {hasInsufficientCredits && (
                <span className="text-destructive font-medium">
                  Insufficient credits
                </span>
              )}
            </div>
          )}

          {/* Total Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold">
              {pricing.totalCredits.toLocaleString()} credits
            </span>
          </div>

          {/* Insufficient Credits Alert */}
          {hasInsufficientCredits && onAddCredits && (
            <Alert
              variant="warning"
              message={
                <div className="flex items-center justify-between">
                  <span>
                    You need{' '}
                    {(pricing.totalCredits - userCredits).toLocaleString()} more
                    credits
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onAddCredits}
                    disabled={isConfirming}
                  >
                    Add Credits
                  </Button>
                </div>
              }
            />
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isConfirming}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                vesselCount === 0 || hasInsufficientCredits || isConfirming
              }
              loading={isConfirming}
            >
              {isConfirming ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
