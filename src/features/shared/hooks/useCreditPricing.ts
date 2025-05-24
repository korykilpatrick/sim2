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

  return {
    packages,
    getBestValue,
    getPackageByCredits,
    calculateCustomPrice,
  }
}
