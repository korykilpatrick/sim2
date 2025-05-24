import { useMemo } from 'react'
import { PRICING, getCreditPackageValue } from '../utils/creditPricing'

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
    calculateInvestigationCost,
  }
}
