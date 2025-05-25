import { CREDIT_COSTS } from './creditPricing'

// Extended credit pricing utilities for comprehensive calculations

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

export const calculateReportCost = (
  reportType: 'compliance' | 'chronology',
): number => {
  return (
    CREDIT_COSTS.REPORTS[
      reportType.toUpperCase() as keyof typeof CREDIT_COSTS.REPORTS
    ] || CREDIT_COSTS.REPORTS.COMPLIANCE
  )
}

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

export const calculateServiceCost = (
  serviceType:
    | 'vessel-tracking'
    | 'area-monitoring'
    | 'fleet-tracking'
    | 'report-generation'
    | 'investigation',
  params: Record<string, any>,
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
      return calculateReportCost(params.reportType)
    case 'investigation':
      return calculateInvestigationCost(
        params.investigationType,
        params.customAmount,
      )
    default:
      throw new Error(`Unknown service type: ${serviceType}`)
  }
}

export const formatCreditAmount = (amount: number): string => {
  return amount.toLocaleString()
}

export const getCreditPackageDiscount = (creditAmount: number): number => {
  const discounts: Record<number, number> = {
    100: 0,
    500: 10,
    1000: 20,
    5000: 30,
  }

  return discounts[creditAmount] || 0
}

export const validateCreditSufficiency = (
  currentBalance: number,
  requiredAmount: number,
): { sufficient: boolean; shortfall: number } => {
  const sufficient = currentBalance >= requiredAmount
  const shortfall = sufficient ? 0 : requiredAmount - currentBalance

  return { sufficient, shortfall }
}

// Add missing constants to CREDIT_COSTS
export const EXTENDED_CREDIT_COSTS = {
  ...CREDIT_COSTS,
  INVESTIGATIONS: {
    BASIC: 5000,
    COMPREHENSIVE: 10000,
  },
}
