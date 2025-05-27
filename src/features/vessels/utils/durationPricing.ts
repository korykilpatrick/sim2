/**
 * Duration-based pricing calculator for vessel tracking services
 * @module features/vessels/utils/durationPricing
 */

import type { TrackingCriteria } from '@features/vessels/types/vessel'

/**
 * TrackingCriteria extended with credit cost for pricing calculations
 */
export interface TrackingCriterion extends TrackingCriteria {
  /** Daily credit cost for this criterion */
  creditCost: number
}

/**
 * Pricing tier options for vessel tracking packages
 */
export type PricingTier = 'bronze' | 'silver' | 'gold' | 'platinum'

/**
 * Duration option with associated discount
 */
export interface DurationOption {
  days: number
  label: string
  discount: number
}

/**
 * Bulk vessel option with associated discount
 */
export interface BulkOption {
  vesselCount: number
  label: string
  discount: number
}

/**
 * Package pricing details
 */
export interface PackageDetails {
  name: string
  baseDiscount: number
  features: string[]
}

/**
 * Pricing calculation result
 */
export interface PricingResult {
  /** Base price before any discounts */
  basePrice: number
  /** Price after applying discounts */
  discountedPrice: number
  /** Total credits required */
  totalCredits: number
  /** Price per vessel */
  pricePerVessel: number
  /** Price per day */
  pricePerDay: number
  /** List of applied discount types */
  appliedDiscounts: string[]
}

/**
 * Pricing calculation options
 */
export interface PricingOptions {
  /** Selected tracking criteria */
  criteria: TrackingCriterion[]
  /** Duration in days */
  durationDays: number
  /** Number of vessels to track */
  vesselCount: number
  /** Optional pricing tier for package discounts */
  pricingTier?: PricingTier
}

/**
 * Get duration-based discount multiplier
 * @param days - Number of days
 * @returns Discount multiplier (1.0 = no discount, 0.9 = 10% discount)
 *
 * @example
 * getDurationMultiplier(7); // 1.0 (no discount)
 * getDurationMultiplier(15); // 0.95 (5% discount)
 * getDurationMultiplier(30); // 0.90 (10% discount)
 * getDurationMultiplier(180); // 0.70 (30% discount)
 */
export function getDurationMultiplier(days: number): number {
  if (days <= 7) return 1.0
  if (days < 30) return 0.95 // 5% discount
  if (days < 90) return 0.9 // 10% discount
  if (days < 180) return 0.8 // 20% discount
  return 0.7 // 30% discount for 180+ days
}

/**
 * Calculate bulk discount percentage based on vessel count
 * @param vesselCount - Number of vessels
 * @returns Discount percentage (0.0 to 0.25)
 *
 * @example
 * calculateBulkDiscount(1); // 0 (no discount)
 * calculateBulkDiscount(10); // 0.15 (15% discount)
 * calculateBulkDiscount(50); // 0.25 (25% discount)
 */
export function calculateBulkDiscount(vesselCount: number): number {
  if (vesselCount < 5) return 0
  if (vesselCount < 10) return 0.1 // 10% discount
  if (vesselCount < 25) return 0.15 // 15% discount
  if (vesselCount < 50) return 0.2 // 20% discount
  return 0.25 // 25% discount for 50+ vessels
}

/**
 * Get package pricing details
 * @param tier - Pricing tier
 * @returns Package details with features and discount
 *
 * @example
 * getPackagePrice('gold');
 * // { name: 'Gold', baseDiscount: 0.10, features: [...] }
 */
export function getPackagePrice(tier: PricingTier): PackageDetails {
  const packages: Record<PricingTier, PackageDetails> = {
    bronze: {
      name: 'Bronze',
      baseDiscount: 0,
      features: ['Basic monitoring', 'Email alerts'],
    },
    silver: {
      name: 'Silver',
      baseDiscount: 0.05,
      features: ['Enhanced monitoring', 'Email & SMS alerts', 'Basic reports'],
    },
    gold: {
      name: 'Gold',
      baseDiscount: 0.1,
      features: [
        'Premium monitoring',
        'Priority alerts',
        'Advanced reports',
        'API access',
      ],
    },
    platinum: {
      name: 'Platinum',
      baseDiscount: 0.15,
      features: [
        'Enterprise monitoring',
        '24/7 support',
        'Custom reports',
        'Full API access',
        'Dedicated account manager',
      ],
    },
  }

  return packages[tier] || packages.bronze
}

/**
 * Calculate duration-based pricing for vessel tracking
 * @param options - Pricing calculation options
 * @returns Detailed pricing breakdown
 *
 * @example
 * // Single vessel, 7 days, 2 criteria
 * calculateDurationBasedPrice({
 *   criteria: [criterion1, criterion2],
 *   durationDays: 7,
 *   vesselCount: 1
 * });
 * // { basePrice: 70, discountedPrice: 70, totalCredits: 70, ... }
 *
 * @example
 * // Fleet pricing with discounts
 * calculateDurationBasedPrice({
 *   criteria: selectedCriteria,
 *   durationDays: 90,
 *   vesselCount: 25,
 *   pricingTier: 'gold'
 * });
 * // Applies duration, bulk, and package discounts
 */
export function calculateDurationBasedPrice(
  options: PricingOptions,
): PricingResult {
  const { criteria, durationDays, vesselCount, pricingTier } = options

  // Handle edge cases
  if (durationDays === 0 || vesselCount === 0 || criteria.length === 0) {
    return {
      basePrice: 0,
      discountedPrice: 0,
      totalCredits: 0,
      pricePerVessel: 0,
      pricePerDay: 0,
      appliedDiscounts: [],
    }
  }

  // Round up fractional days
  const actualDays = Math.ceil(durationDays)

  // Calculate base price
  const dailyCost = criteria.reduce(
    (sum, criterion) => sum + criterion.creditCost,
    0,
  )
  const basePrice = dailyCost * actualDays * vesselCount

  // Initialize discounts
  const appliedDiscounts: string[] = []
  let totalDiscount = 0

  // Apply duration discount
  const durationMultiplier = getDurationMultiplier(actualDays)
  if (durationMultiplier < 1.0) {
    totalDiscount += 1 - durationMultiplier
    appliedDiscounts.push('duration')
  }

  // Apply bulk discount
  const bulkDiscount = calculateBulkDiscount(vesselCount)
  if (bulkDiscount > 0) {
    // Combine discounts multiplicatively, not additively
    totalDiscount = 1 - (1 - totalDiscount) * (1 - bulkDiscount)
    appliedDiscounts.push('bulk')
  }

  // Apply package discount if specified
  if (pricingTier) {
    const packageDetails = getPackagePrice(pricingTier)
    if (packageDetails.baseDiscount > 0) {
      // Combine with existing discounts
      totalDiscount =
        1 - (1 - totalDiscount) * (1 - packageDetails.baseDiscount)
      appliedDiscounts.push('package')
    }
  }

  // Calculate final price
  const discountedPrice = Math.round(basePrice * (1 - totalDiscount))
  const totalCredits = discountedPrice

  return {
    basePrice,
    discountedPrice,
    totalCredits,
    pricePerVessel: vesselCount > 0 ? totalCredits / vesselCount : 0,
    pricePerDay: actualDays > 0 ? totalCredits / actualDays : 0,
    appliedDiscounts,
  }
}

/**
 * Predefined duration options for UI
 */
export const DURATION_OPTIONS: DurationOption[] = [
  { days: 1, label: '1 day', discount: 0 },
  { days: 7, label: '1 week', discount: 0.05 },
  { days: 30, label: '1 month', discount: 0.1 },
  { days: 90, label: '3 months', discount: 0.2 },
  { days: 180, label: '6 months', discount: 0.3 },
  { days: 365, label: '1 year', discount: 0.3 },
]

/**
 * Predefined bulk options for UI
 */
export const BULK_OPTIONS: BulkOption[] = [
  { vesselCount: 1, label: '1 vessel', discount: 0 },
  { vesselCount: 5, label: '5 vessels', discount: 0.1 },
  { vesselCount: 10, label: '10 vessels', discount: 0.15 },
  { vesselCount: 25, label: '25 vessels', discount: 0.2 },
  { vesselCount: 50, label: '50 vessels', discount: 0.25 },
  { vesselCount: 100, label: '100 vessels', discount: 0.25 },
]
