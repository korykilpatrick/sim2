/**
 * Extended credit pricing helper utilities
 *
 * Additional pricing calculation functions that provide more detailed
 * calculations with discounts, validations, and bulk pricing.
 *
 * @module features/shared/utils/creditPricingHelpers
 */

import { CREDIT_COSTS } from './creditPricing'

/**
 * Calculate vessel tracking cost with minimum day threshold
 * @param {Object} params - Calculation parameters
 * @param {number} params.criteriaCount - Number of tracking criteria
 * @param {number} params.durationDays - Duration in days (minimum 1 day)
 * @returns {number} Total credits required
 * @example
 * ```typescript
 * const cost = calculateVesselTrackingCost({
 *   criteriaCount: 5,
 *   durationDays: 0.5 // Will be rounded up to 1 day
 * }) // 25 credits
 * ```
 */
export const calculateVesselTrackingCost = ({
  criteriaCount,
  durationDays,
}: {
  criteriaCount: number
  durationDays: number
}): number => {
  if (criteriaCount === 0 || durationDays === 0) return 0

  // Apply minimum 1 day threshold
  const effectiveDays = Math.max(1, Math.ceil(durationDays))

  return (
    criteriaCount *
    CREDIT_COSTS.VESSEL_TRACKING.PER_CRITERIA_PER_DAY *
    effectiveDays
  )
}

/**
 * Calculate area monitoring cost with size-based multipliers
 * @param {Object} params - Calculation parameters
 * @param {number} params.areaSizeKm2 - Area size in square kilometers
 * @param {number} params.durationDays - Duration in days
 * @returns {number} Total credits required
 * @example
 * ```typescript
 * // Small area (100 km²) for 30 days
 * const smallCost = calculateAreaMonitoringCost({
 *   areaSizeKm2: 100,
 *   durationDays: 30
 * }) // 300 credits (base cost only)
 *
 * // Large area (1500 km²) for 7 days
 * const largeCost = calculateAreaMonitoringCost({
 *   areaSizeKm2: 1500,
 *   durationDays: 7
 * }) // 385 credits (includes size multiplier)
 * ```
 */
export const calculateAreaMonitoringCost = ({
  areaSizeKm2,
  durationDays,
}: {
  areaSizeKm2: number
  durationDays: number
}): number => {
  if (durationDays === 0) return 0

  let multiplier = 0

  // Size-based multipliers
  if (areaSizeKm2 <= 100) {
    multiplier = 0 // Small area - base cost only
  } else if (areaSizeKm2 <= 500) {
    multiplier = 0.1 // Medium area
  } else if (areaSizeKm2 <= 1000) {
    multiplier = 0.2 // Large area
  } else {
    multiplier = 0.3 // Very large area
  }

  const basePerDay = CREDIT_COSTS.AREA_MONITORING.BASE_PER_DAY
  const additionalCost = areaSizeKm2 * multiplier
  const totalPerDay = basePerDay + additionalCost

  return Math.round(totalPerDay * durationDays)
}

/**
 * Calculate fleet tracking cost with bulk discounts
 * @param {Object} params - Calculation parameters
 * @param {number} params.vesselCount - Number of vessels in fleet
 * @param {number} params.durationMonths - Duration in months
 * @returns {number} Total credits required (with discounts applied)
 * @example
 * ```typescript
 * // Small fleet (10 vessels) for 3 months
 * const smallFleet = calculateFleetTrackingCost({
 *   vesselCount: 10,
 *   durationMonths: 3
 * }) // 3000 credits (no discount)
 *
 * // Large fleet (25 vessels) for 6 months
 * const largeFleet = calculateFleetTrackingCost({
 *   vesselCount: 25,
 *   durationMonths: 6
 * }) // 13500 credits (10% discount applied)
 * ```
 */
export const calculateFleetTrackingCost = ({
  vesselCount,
  durationMonths,
}: {
  vesselCount: number
  durationMonths: number
}): number => {
  const baseCost =
    vesselCount *
    CREDIT_COSTS.FLEET_TRACKING.PER_VESSEL_PER_MONTH *
    durationMonths

  // Apply bulk discounts
  let discount = 0
  if (vesselCount >= 50) {
    discount = 0.2 // 20% discount
  } else if (vesselCount >= 20) {
    discount = 0.1 // 10% discount
  }

  return Math.round(baseCost * (1 - discount))
}

/**
 * Calculate report generation cost by type
 * @param {'compliance' | 'chronology'} reportType - Type of report
 * @returns {number} Credits required for the report
 * @example
 * ```typescript
 * const complianceCost = calculateReportCost('compliance') // 50 credits
 * const chronologyCost = calculateReportCost('chronology') // 75 credits
 * ```
 */
export const calculateReportCost = (
  reportType: 'compliance' | 'chronology',
): number => {
  return (
    CREDIT_COSTS.REPORTS[
      reportType.toUpperCase() as keyof typeof CREDIT_COSTS.REPORTS
    ] || CREDIT_COSTS.REPORTS.COMPLIANCE
  )
}

/**
 * Calculate investigation cost by type
 * @param {'basic' | 'comprehensive' | 'custom'} investigationType - Type of investigation
 * @param {number} [customAmount] - Custom amount for 'custom' type investigations
 * @returns {number} Credits required for the investigation
 * @example
 * ```typescript
 * const basicCost = calculateInvestigationCost('basic') // 5000 credits
 * const comprehensiveCost = calculateInvestigationCost('comprehensive') // 10000 credits
 * const customCost = calculateInvestigationCost('custom', 7500) // 7500 credits
 * ```
 */
export const calculateInvestigationCost = (
  investigationType: 'basic' | 'comprehensive' | 'custom',
  customAmount?: number,
): number => {
  switch (investigationType) {
    case 'basic':
      return EXTENDED_CREDIT_COSTS.INVESTIGATIONS.BASIC
    case 'comprehensive':
      return EXTENDED_CREDIT_COSTS.INVESTIGATIONS.COMPREHENSIVE
    case 'custom':
      return customAmount || EXTENDED_CREDIT_COSTS.INVESTIGATIONS.BASIC
    default:
      return EXTENDED_CREDIT_COSTS.INVESTIGATIONS.BASIC
  }
}

/**
 * Calculate cost for any service type with appropriate parameters
 * @param {string} serviceType - Type of service
 * @param {Record<string, unknown>} params - Service-specific parameters
 * @returns {number} Total credits required
 * @throws {Error} If service type is unknown
 * @example
 * ```typescript
 * // Vessel tracking
 * const vesselCost = calculateServiceCost('vessel-tracking', {
 *   criteriaCount: 3,
 *   durationDays: 7
 * })
 *
 * // Area monitoring
 * const areaCost = calculateServiceCost('area-monitoring', {
 *   areaSizeKm2: 500,
 *   durationDays: 30
 * })
 *
 * // Investigation
 * const investigationCost = calculateServiceCost('investigation', {
 *   investigationType: 'comprehensive'
 * })
 * ```
 */
export const calculateServiceCost = (
  serviceType:
    | 'vessel-tracking'
    | 'area-monitoring'
    | 'fleet-tracking'
    | 'report-generation'
    | 'investigation',
  params: Record<string, unknown>,
): number => {
  switch (serviceType) {
    case 'vessel-tracking':
      return calculateVesselTrackingCost(
        params as { criteriaCount: number; durationDays: number },
      )
    case 'area-monitoring':
      return calculateAreaMonitoringCost(
        params as { areaSizeKm2: number; durationDays: number },
      )
    case 'fleet-tracking':
      return calculateFleetTrackingCost(
        params as { vesselCount: number; durationMonths: number },
      )
    case 'report-generation':
      return calculateReportCost(
        params.reportType as 'compliance' | 'chronology',
      )
    case 'investigation':
      return calculateInvestigationCost(
        params.investigationType as 'basic' | 'comprehensive' | 'custom',
        params.customAmount as number | undefined,
      )
    default:
      throw new Error(`Unknown service type: ${serviceType}`)
  }
}

/**
 * Format credit amount with locale-appropriate separators
 * @param {number} amount - Credit amount to format
 * @returns {string} Formatted credit amount
 * @example
 * ```typescript
 * formatCreditAmount(1000) // "1,000"
 * formatCreditAmount(1500000) // "1,500,000"
 * ```
 */
export const formatCreditAmount = (amount: number): string => {
  return amount.toLocaleString()
}

/**
 * Get discount percentage for credit packages
 * @param {number} creditAmount - Base credit amount
 * @returns {number} Discount percentage (0-30)
 * @example
 * ```typescript
 * getCreditPackageDiscount(100) // 0 (no discount)
 * getCreditPackageDiscount(1000) // 20 (20% discount)
 * getCreditPackageDiscount(5000) // 30 (30% discount)
 * ```
 */
export const getCreditPackageDiscount = (creditAmount: number): number => {
  const discounts: Record<number, number> = {
    100: 0,
    500: 10,
    1000: 20,
    5000: 30,
  }

  return discounts[creditAmount] || 0
}

/**
 * Validate if user has sufficient credits for a purchase
 * @param {number} currentBalance - User's current credit balance
 * @param {number} requiredAmount - Credits required for purchase
 * @returns {Object} Validation result
 * @returns {boolean} returns.sufficient - Whether balance is sufficient
 * @returns {number} returns.shortfall - Credits needed (0 if sufficient)
 * @example
 * ```typescript
 * const result = validateCreditSufficiency(500, 300)
 * // { sufficient: true, shortfall: 0 }
 *
 * const insufficient = validateCreditSufficiency(100, 300)
 * // { sufficient: false, shortfall: 200 }
 * ```
 */
export const validateCreditSufficiency = (
  currentBalance: number,
  requiredAmount: number,
): { sufficient: boolean; shortfall: number } => {
  const sufficient = currentBalance >= requiredAmount
  const shortfall = sufficient ? 0 : requiredAmount - currentBalance

  return { sufficient, shortfall }
}

/**
 * Extended credit costs including investigation pricing
 * @extends CREDIT_COSTS
 */
export const EXTENDED_CREDIT_COSTS = {
  ...CREDIT_COSTS,
  INVESTIGATIONS: {
    BASIC: 5000,
    COMPREHENSIVE: 10000,
  },
}
