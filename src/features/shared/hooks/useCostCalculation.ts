import { useCredits } from '@/features/credits'

/**
 * Result of a cost calculation
 */
interface CostCalculation {
  /** Total credit cost for the service */
  cost: number
  /** Whether user has sufficient credits */
  hasSufficientCredits: boolean
  /** Credits needed if insufficient balance */
  shortfall: number
}

/**
 * Detailed breakdown of service costs
 */
interface CostBreakdown {
  /** Base rate per unit */
  baseRate: number
  /** Multiplier applied to base rate */
  multiplier: number
  /** Duration in days */
  duration: number
  /** Total cost */
  total: number
  /** Cost per day */
  dailyCost: number
}

/**
 * Parameters for service cost calculation
 */
interface ServiceParams {
  /** Number of criteria for vessel tracking */
  criteriaCount?: number
  /** Service duration in days */
  durationDays?: number
  /** Area size in square kilometers */
  areaSizeKm2?: number
  /** Number of vessels in fleet */
  vesselCount?: number
  /** Type of report */
  reportType?: string
  /** Data range for reports */
  dataRange?: string
  /** Service type */
  type?: string
}

/**
 * Hook for calculating service costs and checking affordability
 * 
 * Provides utilities for calculating credit costs for various services,
 * checking if user can afford them, and getting detailed cost breakdowns.
 * Automatically integrates with user's current credit balance.
 * 
 * @returns {Object} Cost calculation utilities
 * @returns {number} returns.balance - User's current credit balance
 * @returns {Function} returns.calculateCost - Calculate cost for a service
 * @returns {Function} returns.canAfford - Check if user can afford amount
 * @returns {Function} returns.getCostBreakdown - Get detailed cost breakdown
 * 
 * @example
 * ```typescript
 * function VesselTrackingPurchase({ criteria, days }: Props) {
 *   const { calculateCost, getCostBreakdown } = useCostCalculation()
 *   
 *   const result = calculateCost('vessel-tracking', {
 *     criteriaCount: criteria.length,
 *     durationDays: days
 *   })
 *   
 *   const breakdown = getCostBreakdown('vessel-tracking', {
 *     criteriaCount: criteria.length,
 *     durationDays: days
 *   })
 *   
 *   return (
 *     <div>
 *       <h3>Cost Summary</h3>
 *       <p>Daily Cost: {breakdown?.dailyCost} credits</p>
 *       <p>Total: {result.cost} credits</p>
 *       
 *       {!result.hasSufficientCredits && (
 *         <Alert variant="warning">
 *           You need {result.shortfall} more credits
 *         </Alert>
 *       )}
 *       
 *       <button disabled={!result.hasSufficientCredits}>
 *         Purchase Tracking
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Area monitoring cost calculation
 * function AreaMonitoringCost({ area }: Props) {
 *   const { calculateCost, canAfford } = useCostCalculation()
 *   
 *   const cost = calculateCost('area-monitoring', {
 *     areaSizeKm2: area.size,
 *     durationDays: 30
 *   })
 *   
 *   return (
 *     <CostDisplay
 *       amount={cost.cost}
 *       affordable={canAfford(cost.cost)}
 *     />
 *   )
 * }
 * ```
 */
export function useCostCalculation() {
  const { balance } = useCredits()

  const calculateCost = (
    service: string,
    params: ServiceParams,
  ): CostCalculation => {
    let cost = 0

    switch (service) {
      case 'vessel-tracking': {
        const { criteriaCount = 1, durationDays = 1 } = params
        cost = criteriaCount * 5 * durationDays
        break
      }
      case 'area-monitoring': {
        const { areaSizeKm2 = 0, durationDays = 1 } = params
        // Base cost: 10 credits + 0.3 credits per km² per day
        const dailyCost = 10 + areaSizeKm2 * 0.3
        cost = Math.round(dailyCost * durationDays)
        break
      }
      case 'fleet-tracking': {
        const { vesselCount = 1, durationDays = 1 } = params
        cost = vesselCount * 100 * durationDays
        break
      }
      case 'report': {
        const { reportType = 'compliance' } = params
        cost = reportType === 'chronology' ? 75 : 50
        break
      }
      case 'investigation': {
        const { type = 'basic' } = params
        cost = type === 'comprehensive' ? 10000 : 5000
        break
      }
      default:
        cost = 0
    }

    const hasSufficientCredits = balance >= cost
    const shortfall = Math.max(0, cost - balance)

    return {
      cost,
      hasSufficientCredits,
      shortfall,
    }
  }

  const canAfford = (amount: number): boolean => {
    return balance >= amount
  }

  const getCostBreakdown = (
    service: string,
    params: ServiceParams,
  ): CostBreakdown | null => {
    switch (service) {
      case 'vessel-tracking': {
        const { criteriaCount = 1, durationDays = 1 } = params
        const baseRate = 5
        const total = criteriaCount * baseRate * durationDays
        const dailyCost = criteriaCount * baseRate

        return {
          baseRate,
          multiplier: criteriaCount,
          duration: durationDays,
          total,
          dailyCost,
        }
      }
      case 'area-monitoring': {
        const { areaSizeKm2 = 0, durationDays = 1 } = params
        const baseRate = 10
        const sizeMultiplier = areaSizeKm2 * 0.3
        const dailyCost = baseRate + sizeMultiplier
        const total = Math.round(dailyCost * durationDays)

        return {
          baseRate,
          multiplier: 1 + sizeMultiplier / baseRate,
          duration: durationDays,
          total,
          dailyCost: Math.round(dailyCost),
        }
      }
      default:
        return null
    }
  }

  return {
    balance,
    calculateCost,
    canAfford,
    getCostBreakdown,
  }
}
