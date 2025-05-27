import { describe, it, expect } from 'vitest'
import {
  calculateDurationBasedPrice,
  calculateBulkDiscount,
  getDurationMultiplier,
  getPackagePrice,
  type DurationOption,
  type BulkOption,
} from '@features/vessels/utils/durationPricing'
import type { TrackingCriterion } from '@features/vessels/types/vessel'

describe('Duration-Based Pricing Calculator', () => {
  const mockCriteria: TrackingCriterion[] = [
    {
      id: 'ais-reporting',
      name: 'AIS Reporting',
      description: 'Updated location on intervals',
      category: 'Signal Integrity',
      creditCost: 5,
      config: { interval: '6h' },
    },
    {
      id: 'dark-event',
      name: 'Dark Event Detection',
      description: 'AIS signal loss detection',
      category: 'Signal Integrity',
      creditCost: 5,
    },
  ]

  describe('calculateDurationBasedPrice', () => {
    it('should calculate base price for single vessel with no discounts', () => {
      const result = calculateDurationBasedPrice({
        criteria: mockCriteria,
        durationDays: 7,
        vesselCount: 1,
      })

      // 2 criteria * 5 credits each * 7 days = 70 credits
      expect(result).toEqual({
        basePrice: 70,
        discountedPrice: 70,
        totalCredits: 70,
        pricePerVessel: 70,
        pricePerDay: 10,
        appliedDiscounts: [],
      })
    })

    it('should apply duration discount for longer periods', () => {
      const result = calculateDurationBasedPrice({
        criteria: mockCriteria,
        durationDays: 30,
        vesselCount: 1,
      })

      // 2 criteria * 5 credits * 30 days = 300 base
      // 30 days should get 10% discount
      expect(result.basePrice).toBe(300)
      expect(result.discountedPrice).toBe(270)
      expect(result.appliedDiscounts).toContain('duration')
    })

    it('should apply bulk discount for multiple vessels', () => {
      const result = calculateDurationBasedPrice({
        criteria: mockCriteria,
        durationDays: 7,
        vesselCount: 10,
      })

      // 2 criteria * 5 credits * 7 days * 10 vessels = 700 base
      // 10 vessels should get 15% discount
      expect(result.basePrice).toBe(700)
      expect(result.discountedPrice).toBe(595)
      expect(result.appliedDiscounts).toContain('bulk')
    })

    it('should apply both duration and bulk discounts', () => {
      const result = calculateDurationBasedPrice({
        criteria: mockCriteria,
        durationDays: 90,
        vesselCount: 25,
      })

      // Base: 2 * 5 * 90 * 25 = 22,500
      // Duration discount (90 days): 20%
      // Bulk discount (25 vessels): 20%
      // Combined discount should be calculated correctly
      expect(result.basePrice).toBe(22500)
      expect(result.appliedDiscounts).toContain('duration')
      expect(result.appliedDiscounts).toContain('bulk')
      expect(result.discountedPrice).toBeLessThan(22500)
    })

    it('should handle package pricing tiers', () => {
      const result = calculateDurationBasedPrice({
        criteria: mockCriteria,
        durationDays: 30,
        vesselCount: 5,
        pricingTier: 'gold',
      })

      // Gold tier should apply additional discount
      expect(result.appliedDiscounts).toContain('package')
      expect(result.discountedPrice).toBeLessThan(result.basePrice)
    })

    it('should calculate correct per-vessel and per-day prices', () => {
      const result = calculateDurationBasedPrice({
        criteria: mockCriteria,
        durationDays: 10,
        vesselCount: 5,
      })

      expect(result.pricePerVessel).toBe(result.totalCredits / 5)
      expect(result.pricePerDay).toBe(result.totalCredits / 10)
    })

    it('should handle empty criteria array', () => {
      const result = calculateDurationBasedPrice({
        criteria: [],
        durationDays: 7,
        vesselCount: 1,
      })

      expect(result.totalCredits).toBe(0)
      expect(result.basePrice).toBe(0)
      expect(result.discountedPrice).toBe(0)
    })

    it('should handle fractional days by rounding up', () => {
      const result = calculateDurationBasedPrice({
        criteria: mockCriteria,
        durationDays: 7.5,
        vesselCount: 1,
      })

      // Should calculate as 8 days
      expect(result.basePrice).toBe(80) // 2 * 5 * 8
    })
  })

  describe('getDurationMultiplier', () => {
    it('should return 1.0 for durations up to 7 days', () => {
      expect(getDurationMultiplier(1)).toBe(1.0)
      expect(getDurationMultiplier(6)).toBe(1.0)
      expect(getDurationMultiplier(7)).toBe(1.0)
    })

    it('should return 0.95 for 8-29 days (5% discount)', () => {
      expect(getDurationMultiplier(8)).toBe(0.95)
      expect(getDurationMultiplier(15)).toBe(0.95)
      expect(getDurationMultiplier(29)).toBe(0.95)
    })

    it('should return 0.90 for 30-89 days (10% discount)', () => {
      expect(getDurationMultiplier(30)).toBe(0.9)
      expect(getDurationMultiplier(60)).toBe(0.9)
      expect(getDurationMultiplier(89)).toBe(0.9)
    })

    it('should return 0.80 for 90-179 days (20% discount)', () => {
      expect(getDurationMultiplier(90)).toBe(0.8)
      expect(getDurationMultiplier(120)).toBe(0.8)
      expect(getDurationMultiplier(179)).toBe(0.8)
    })

    it('should return 0.70 for 180+ days (30% discount)', () => {
      expect(getDurationMultiplier(180)).toBe(0.7)
      expect(getDurationMultiplier(365)).toBe(0.7)
    })
  })

  describe('calculateBulkDiscount', () => {
    it('should return 0 for single vessel', () => {
      expect(calculateBulkDiscount(1)).toBe(0)
    })

    it('should return 10% for 5-9 vessels', () => {
      expect(calculateBulkDiscount(5)).toBe(0.1)
      expect(calculateBulkDiscount(7)).toBe(0.1)
      expect(calculateBulkDiscount(9)).toBe(0.1)
    })

    it('should return 15% for 10-24 vessels', () => {
      expect(calculateBulkDiscount(10)).toBe(0.15)
      expect(calculateBulkDiscount(20)).toBe(0.15)
      expect(calculateBulkDiscount(24)).toBe(0.15)
    })

    it('should return 20% for 25-49 vessels', () => {
      expect(calculateBulkDiscount(25)).toBe(0.2)
      expect(calculateBulkDiscount(40)).toBe(0.2)
      expect(calculateBulkDiscount(49)).toBe(0.2)
    })

    it('should return 25% for 50+ vessels', () => {
      expect(calculateBulkDiscount(50)).toBe(0.25)
      expect(calculateBulkDiscount(100)).toBe(0.25)
    })
  })

  describe('getPackagePrice', () => {
    it('should return correct prices for each tier', () => {
      expect(getPackagePrice('bronze')).toEqual({
        name: 'Bronze',
        baseDiscount: 0,
        features: ['Basic monitoring', 'Email alerts'],
      })

      expect(getPackagePrice('silver')).toEqual({
        name: 'Silver',
        baseDiscount: 0.05,
        features: [
          'Enhanced monitoring',
          'Email & SMS alerts',
          'Basic reports',
        ],
      })

      expect(getPackagePrice('gold')).toEqual({
        name: 'Gold',
        baseDiscount: 0.1,
        features: [
          'Premium monitoring',
          'Priority alerts',
          'Advanced reports',
          'API access',
        ],
      })

      expect(getPackagePrice('platinum')).toEqual({
        name: 'Platinum',
        baseDiscount: 0.15,
        features: [
          'Enterprise monitoring',
          '24/7 support',
          'Custom reports',
          'Full API access',
          'Dedicated account manager',
        ],
      })
    })

    it('should handle invalid tier gracefully', () => {
      // @ts-expect-error - Testing invalid input
      expect(getPackagePrice('invalid')).toEqual({
        name: 'Bronze',
        baseDiscount: 0,
        features: ['Basic monitoring', 'Email alerts'],
      })
    })
  })

  describe('DurationOption and BulkOption types', () => {
    it('should have correct duration option structure', () => {
      const option: DurationOption = {
        days: 30,
        label: '30 days',
        discount: 0.1,
      }

      expect(option.days).toBe(30)
      expect(option.label).toBe('30 days')
      expect(option.discount).toBe(0.1)
    })

    it('should have correct bulk option structure', () => {
      const option: BulkOption = {
        vesselCount: 10,
        label: '10 vessels',
        discount: 0.15,
      }

      expect(option.vesselCount).toBe(10)
      expect(option.label).toBe('10 vessels')
      expect(option.discount).toBe(0.15)
    })
  })

  describe('Edge cases', () => {
    it('should handle zero duration', () => {
      const result = calculateDurationBasedPrice({
        criteria: mockCriteria,
        durationDays: 0,
        vesselCount: 1,
      })

      expect(result.totalCredits).toBe(0)
    })

    it('should handle zero vessels', () => {
      const result = calculateDurationBasedPrice({
        criteria: mockCriteria,
        durationDays: 7,
        vesselCount: 0,
      })

      expect(result.totalCredits).toBe(0)
    })

    it('should handle very large numbers', () => {
      const result = calculateDurationBasedPrice({
        criteria: mockCriteria,
        durationDays: 365,
        vesselCount: 1000,
      })

      expect(result.totalCredits).toBeGreaterThan(0)
      expect(result.appliedDiscounts).toContain('duration')
      expect(result.appliedDiscounts).toContain('bulk')
    })

    it('should handle criteria with different costs', () => {
      const variedCriteria: TrackingCriterion[] = [
        { ...mockCriteria[0], creditCost: 3 },
        { ...mockCriteria[1], creditCost: 7 },
      ]

      const result = calculateDurationBasedPrice({
        criteria: variedCriteria,
        durationDays: 10,
        vesselCount: 1,
      })

      // (3 + 7) * 10 = 100
      expect(result.basePrice).toBe(100)
    })
  })
})
