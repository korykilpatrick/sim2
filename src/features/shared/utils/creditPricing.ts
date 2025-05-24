// Centralized pricing constants
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

// Helper functions
export function calculateVesselTrackingCost(
  criteriaCount: number,
  durationDays: number,
): number {
  return criteriaCount * PRICING.vessel.tracking.baseRate * durationDays
}

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

export function calculateFleetTrackingCost(
  vesselCount: number,
  months: number,
): number {
  return vesselCount * PRICING.vessel.fleet.monthlyRate * months
}

export function getReportCost(
  reportType: keyof typeof PRICING.reports,
): number {
  return PRICING.reports[reportType]
}

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

// Export CREDIT_COSTS for compatibility with creditService
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
