import { useCredits } from '@/features/credits/hooks/useCredits'

interface CostCalculation {
  cost: number
  hasSufficientCredits: boolean
  shortfall: number
}

interface CostBreakdown {
  baseRate: number
  multiplier: number
  duration: number
  total: number
  dailyCost: number
}

export function useCostCalculation() {
  const { balance } = useCredits()

  const calculateCost = (service: string, params: Record<string, any>): CostCalculation => {
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

  const getCostBreakdown = (service: string, params: Record<string, any>): CostBreakdown | null => {
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