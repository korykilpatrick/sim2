/**
 * Credit pricing utilities and constants
 *
 * Centralized pricing configuration for all services in the application.
 * All credit costs and calculations should use these utilities to ensure
 * consistency across the platform.
 *
 * @module features/shared/utils/creditPricing
 */

/**
 * Centralized pricing constants for all services
 *
 * @example
 * ```typescript
 * // Get vessel tracking rate
 * const ratePerDay = PRICING.vessel.tracking.baseRate
 *
 * // Get report cost
 * const complianceCost = PRICING.reports.compliance
 *
 * // Get credit package info
 * const packages = PRICING.credits.packages
 * ```
 */
export const PRICING = {
  vessel: {
    tracking: {
      baseRate: 5, // credits per criteria per day
      min: 5,
      max: 15,
    },
    fleet: {
      monthlyRate: 100, // credits per vessel per month
    },
  },
  area: {
    monitoring: {
      baseRate: 10, // base credits per day
      min: 10,
      max: 50,
      multipliers: {
        small: 1,
        medium: 1.5,
        large: 2,
        veryLarge: 3,
      },
    },
  },
  reports: {
    compliance: 50,
    chronology: 75,
    custom: 100,
  },
  credits: {
    packages: [
      { credits: 100, price: 100, bonus: 0 },
      { credits: 500, price: 450, bonus: 50 },
      { credits: 1000, price: 800, bonus: 200 },
      { credits: 5000, price: 3500, bonus: 1500 },
      { credits: 10000, price: 6000, bonus: 4000 },
    ],
  },
} as const

/**
 * Calculate the cost for vessel tracking based on criteria and duration
 * @param {number} criteriaCount - Number of tracking criteria
 * @param {number} durationDays - Duration in days
 * @returns {number} Total credits required
 * @example
 * ```typescript
 * // Track 3 vessels for 7 days
 * const cost = calculateVesselTrackingCost(3, 7) // 105 credits
 * ```
 */
export function calculateVesselTrackingCost(
  criteriaCount: number,
  durationDays: number,
): number {
  return criteriaCount * PRICING.vessel.tracking.baseRate * durationDays
}

/**
 * Calculate the cost for area monitoring based on size and duration
 * @param {'small' | 'medium' | 'large' | 'veryLarge'} size - Area size category
 * @param {number} durationDays - Duration in days
 * @param {number} [criteriaCount=1] - Number of monitoring criteria
 * @returns {number} Total credits required
 * @example
 * ```typescript
 * // Monitor a large area for 30 days
 * const cost = calculateAreaMonitoringCost('large', 30) // 600 credits
 *
 * // Monitor with multiple criteria
 * const costWithCriteria = calculateAreaMonitoringCost('medium', 7, 3) // 315 credits
 * ```
 */
export function calculateAreaMonitoringCost(
  size: 'small' | 'medium' | 'large' | 'veryLarge',
  durationDays: number,
  criteriaCount: number = 1,
): number {
  const sizeMultiplier = PRICING.area.monitoring.multipliers[size]
  return (
    PRICING.area.monitoring.baseRate *
    sizeMultiplier *
    durationDays *
    criteriaCount
  )
}

/**
 * Calculate detailed area monitoring cost with breakdown
 * @param {number} areaSize - Area size in square kilometers
 * @param {number} criteriaCount - Number of monitoring criteria
 * @param {number} updateFrequency - Update frequency in hours
 * @param {number} durationMonths - Duration in months
 * @returns {Object} Detailed cost breakdown
 * @returns {number} returns.baseCredits - Base credits per update
 * @returns {number} returns.criteriaCredits - Additional credits for criteria
 * @returns {number} returns.creditsPerDay - Total credits per day
 * @returns {number} returns.totalCredits - Total credits for duration
 * @example
 * ```typescript
 * const breakdown = calculateAreaMonitoringCostDetailed(
 *   2500,  // 2500 km² area
 *   5,     // 5 criteria
 *   6,     // Update every 6 hours
 *   3      // 3 months
 * )
 * console.log(`Daily cost: ${breakdown.creditsPerDay} credits`)
 * console.log(`Total cost: ${breakdown.totalCredits} credits`)
 * ```
 */
export function calculateAreaMonitoringCostDetailed(
  areaSize: number,
  criteriaCount: number,
  updateFrequency: number,
  durationMonths: number,
): {
  baseCredits: number
  criteriaCredits: number
  creditsPerDay: number
  totalCredits: number
} {
  // Determine area size category based on area size in square km
  let sizeCategory: 'small' | 'medium' | 'large' | 'veryLarge'
  if (areaSize < 1000) sizeCategory = 'small'
  else if (areaSize < 5000) sizeCategory = 'medium'
  else if (areaSize < 10000) sizeCategory = 'large'
  else sizeCategory = 'veryLarge'

  const sizeMultiplier = PRICING.area.monitoring.multipliers[sizeCategory]
  const updatesPerDay = Math.floor(24 / updateFrequency)
  const durationDays = durationMonths * 30

  const baseCredits = PRICING.area.monitoring.baseRate * sizeMultiplier
  const criteriaCredits = criteriaCount * 2 // 2 credits per criteria
  const creditsPerDay = (baseCredits + criteriaCredits) * updatesPerDay
  const totalCredits = creditsPerDay * durationDays

  return {
    baseCredits,
    criteriaCredits,
    creditsPerDay,
    totalCredits,
  }
}

/**
 * Calculate the cost for fleet tracking
 * @param {number} vesselCount - Number of vessels in the fleet
 * @param {number} months - Duration in months
 * @returns {number} Total credits required
 * @example
 * ```typescript
 * // Track a fleet of 10 vessels for 6 months
 * const cost = calculateFleetTrackingCost(10, 6) // 6000 credits
 * ```
 */
export function calculateFleetTrackingCost(
  vesselCount: number,
  months: number,
): number {
  return vesselCount * PRICING.vessel.fleet.monthlyRate * months
}

/**
 * Get the cost for a specific report type
 * @param {'compliance' | 'chronology' | 'custom'} reportType - Type of report
 * @returns {number} Credits required for the report
 * @example
 * ```typescript
 * const complianceCost = getReportCost('compliance') // 50 credits
 * const chronologyCost = getReportCost('chronology') // 75 credits
 * ```
 */
export function getReportCost(
  reportType: keyof typeof PRICING.reports,
): number {
  return PRICING.reports[reportType]
}

/**
 * Get detailed information about a credit package
 * @param {number} credits - Base credits in the package
 * @returns {Object} Package details
 * @returns {number} returns.basePrice - Price in USD
 * @returns {number} returns.bonus - Bonus credits included
 * @returns {number} returns.totalCredits - Total credits (base + bonus)
 * @returns {number} returns.pricePerCredit - Price per credit after bonus
 * @throws {Error} If no package exists for the specified credit amount
 * @example
 * ```typescript
 * const package = getCreditPackageValue(1000)
 * console.log(`Price: $${package.basePrice}`)
 * console.log(`Total credits: ${package.totalCredits}`)
 * console.log(`Price per credit: $${package.pricePerCredit.toFixed(2)}`)
 * ```
 */
export function getCreditPackageValue(credits: number): {
  basePrice: number
  bonus: number
  totalCredits: number
  pricePerCredit: number
} {
  const pkg = PRICING.credits.packages.find((p) => p.credits === credits)
  if (!pkg) {
    throw new Error(`No package found for ${credits} credits`)
  }

  const totalCredits = pkg.credits + pkg.bonus
  const pricePerCredit = pkg.price / totalCredits

  return {
    basePrice: pkg.price,
    bonus: pkg.bonus,
    totalCredits,
    pricePerCredit,
  }
}

/**
 * Legacy credit costs object for backwards compatibility
 * @deprecated Use PRICING object instead
 * @example
 * ```typescript
 * // Old way (deprecated)
 * const cost = CREDIT_COSTS.VESSEL_TRACKING.PER_CRITERIA_PER_DAY
 *
 * // New way (preferred)
 * const cost = PRICING.vessel.tracking.baseRate
 * ```
 */
export const CREDIT_COSTS = {
  VESSEL_TRACKING: {
    PER_CRITERIA_PER_DAY: PRICING.vessel.tracking.baseRate,
  },
  AREA_MONITORING: {
    BASE_PER_DAY: PRICING.area.monitoring.baseRate,
  },
  FLEET_TRACKING: {
    PER_VESSEL_PER_MONTH: PRICING.vessel.fleet.monthlyRate,
  },
  REPORTS: {
    COMPLIANCE: PRICING.reports.compliance,
    CHRONOLOGY: PRICING.reports.chronology,
  },
  INVESTIGATION: {
    STANDARD: 5000,
    COMPLEX: 10000,
  },
}
