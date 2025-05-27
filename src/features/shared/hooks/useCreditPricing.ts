import { useMemo } from 'react'
import { PRICING, getCreditPackageValue } from '../utils/creditPricing'

/**
 * Hook for credit pricing calculations and package management
 * 
 * Provides comprehensive credit pricing utilities including package calculations,
 * service cost estimations, and formatting functions. All pricing data is
 * memoized for performance.
 * 
 * @returns {Object} Object containing pricing utilities
 * @returns {Array} returns.packages - Available credit packages with calculations
 * @returns {Function} returns.getBestValue - Get the package with best price per credit
 * @returns {Function} returns.getPackageByCredits - Find package by credit amount
 * @returns {Function} returns.calculateCustomPrice - Calculate price for custom amounts
 * @returns {Function} returns.calculateVesselTrackingCost - Calculate vessel tracking costs
 * @returns {Function} returns.calculateAreaMonitoringCost - Calculate area monitoring costs
 * @returns {Function} returns.calculateFleetTrackingCost - Calculate fleet tracking costs
 * @returns {Function} returns.getReportCost - Get cost for specific report type
 * @returns {Function} returns.getInvestigationCost - Get cost for investigation type
 * @returns {Function} returns.formatCredits - Format credit amount with proper pluralization
 * @returns {Function} returns.calculateInvestigationCost - Calculate investigation cost with multipliers
 * 
 * @example
 * ```typescript
 * function CreditPurchase() {
 *   const { packages, getBestValue, formatCredits } = useCreditPricing()
 *   const bestDeal = getBestValue()
 *   
 *   return (
 *     <div>
 *       <h3>Best Value: {formatCredits(bestDeal.totalCredits)}</h3>
 *       <p>${bestDeal.price} ({bestDeal.savings}% bonus)</p>
 *       
 *       {packages.map(pkg => (
 *         <CreditPackageCard
 *           key={pkg.id}
 *           package={pkg}
 *           isPopular={pkg.popular}
 *         />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 * 
 * @example
 * ```typescript
 * function ServiceCostEstimate({ service, params }: Props) {
 *   const { 
 *     calculateVesselTrackingCost,
 *     calculateAreaMonitoringCost,
 *     formatCredits 
 *   } = useCreditPricing()
 *   
 *   const cost = service === 'vessel'
 *     ? calculateVesselTrackingCost(params.criteria, params.days)
 *     : calculateAreaMonitoringCost(params.areaSize, params.days)
 *   
 *   return <p>Estimated cost: {formatCredits(cost)}</p>
 * }
 * ```
 */
export function useCreditPricing() {
  const packages = useMemo(() => {
    return PRICING.credits.packages.map((pkg) => {
      const { totalCredits, pricePerCredit } = getCreditPackageValue(
        pkg.credits,
      )
      const savings =
        pkg.bonus > 0 ? Math.round((pkg.bonus / totalCredits) * 100) : 0

      return {
        id: `credits-${pkg.credits}`,
        baseCredits: pkg.credits,
        bonusCredits: pkg.bonus,
        totalCredits,
        price: pkg.price,
        pricePerCredit,
        savings,
        popular: pkg.credits === 1000, // Mark 1000 credits as popular
      }
    })
  }, [])

  const getBestValue = () => {
    return packages.reduce((best, current) => {
      return current.pricePerCredit < best.pricePerCredit ? current : best
    })
  }

  const getPackageByCredits = (credits: number) => {
    return packages.find((pkg) => pkg.baseCredits === credits)
  }

  const calculateCustomPrice = (credits: number) => {
    // For custom amounts, use the best available rate
    const bestPackage = getBestValue()
    return Math.ceil(credits * bestPackage.pricePerCredit)
  }

  const calculateVesselTrackingCost = (
    criteriaCount: number,
    durationDays: number,
  ) => {
    // 5 credits per criteria per day
    return criteriaCount * 5 * durationDays
  }

  const calculateAreaMonitoringCost = (
    areaSizeKm2: number,
    durationDays: number,
  ) => {
    // Base cost: 10 credits + 0.1 credits per km²
    const dailyCost = 10 + areaSizeKm2 * 0.1
    return Math.round(dailyCost * durationDays)
  }

  const calculateFleetTrackingCost = (
    vesselCount: number,
    durationDays: number,
  ) => {
    // 100 credits per vessel per day
    const baseCost = vesselCount * 100 * durationDays

    // Apply discounts based on fleet size
    let discount = 0
    if (vesselCount >= 50) {
      discount = 0.2 // 20% discount
    } else if (vesselCount >= 20) {
      discount = 0.1 // 10% discount
    }

    return Math.round(baseCost * (1 - discount))
  }

  const getReportCost = (reportType: string) => {
    const costs: Record<string, number> = {
      compliance: 50,
      chronology: 75,
    }
    return costs[reportType] || 0
  }

  const getInvestigationCost = (type: string) => {
    const costs: Record<string, number> = {
      basic: 5000,
      comprehensive: 10000,
    }
    return costs[type] || 0
  }

  const formatCredits = (amount: number) => {
    const formatted = amount.toLocaleString()
    return amount === 1 ? '1 credit' : `${formatted} credits`
  }

  const calculateInvestigationCost = (
    scope: 'vessel' | 'area' | 'event',
    sourceCount: number,
    priority: 'standard' | 'urgent' | 'critical',
  ) => {
    // Base costs by scope
    const baseCosts = {
      vessel: 5000,
      area: 7500,
      event: 10000,
    }

    // Source multiplier (more sources = higher cost)
    const sourceMultiplier = 1 + (sourceCount - 1) * 0.2

    // Priority multiplier
    const priorityMultipliers = {
      standard: 1,
      urgent: 1.5,
      critical: 2,
    }

    const baseCost = baseCosts[scope]
    const cost = baseCost * sourceMultiplier * priorityMultipliers[priority]

    return Math.round(cost / 100) * 100 // Round to nearest 100
  }

  return {
    packages,
    getBestValue,
    getPackageByCredits,
    calculateCustomPrice,
    calculateVesselTrackingCost,
    calculateAreaMonitoringCost,
    calculateFleetTrackingCost,
    getReportCost,
    getInvestigationCost,
    formatCredits,
    calculateInvestigationCost,
  }
}
