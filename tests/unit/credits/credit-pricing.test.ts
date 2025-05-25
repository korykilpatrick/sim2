import { describe, it, expect } from 'vitest'
import { 
  calculateServiceCost,
  calculateVesselTrackingCost,
  calculateAreaMonitoringCost,
  calculateFleetTrackingCost,
  calculateReportCost,
  calculateInvestigationCost,
  formatCreditAmount,
  getCreditPackageDiscount,
  validateCreditSufficiency,
  EXTENDED_CREDIT_COSTS as CREDIT_COSTS
} from '@/features/shared/utils/creditPricingHelpers'

describe('Credit Pricing Utilities', () => {
  describe('calculateVesselTrackingCost', () => {
    it('should calculate cost based on criteria and duration', () => {
      const cost = calculateVesselTrackingCost({
        criteriaCount: 3,
        durationDays: 10
      })
      
      // 3 criteria × 5 credits × 10 days = 150
      expect(cost).toBe(150)
    })

    it('should handle zero criteria', () => {
      const cost = calculateVesselTrackingCost({
        criteriaCount: 0,
        durationDays: 10
      })
      
      expect(cost).toBe(0)
    })

    it('should handle zero duration', () => {
      const cost = calculateVesselTrackingCost({
        criteriaCount: 5,
        durationDays: 0
      })
      
      expect(cost).toBe(0)
    })

    it('should apply minimum cost threshold', () => {
      const cost = calculateVesselTrackingCost({
        criteriaCount: 1,
        durationDays: 0.5 // Half day
      })
      
      // Should round up to minimum 1 day
      expect(cost).toBe(5)
    })
  })

  describe('calculateAreaMonitoringCost', () => {
    it('should calculate base cost for small areas', () => {
      const cost = calculateAreaMonitoringCost({
        areaSizeKm2: 50,
        durationDays: 30
      })
      
      // Base cost: 10 credits × 30 days = 300
      expect(cost).toBe(300)
    })

    it('should apply size multiplier for medium areas', () => {
      const cost = calculateAreaMonitoringCost({
        areaSizeKm2: 150, // Medium area
        durationDays: 30
      })
      
      // Base: 10 + (150 × 0.1) = 25 credits per day
      // Total: 25 × 30 = 750
      expect(cost).toBe(750)
    })

    it('should apply size multiplier for large areas', () => {
      const cost = calculateAreaMonitoringCost({
        areaSizeKm2: 600, // Large area
        durationDays: 30
      })
      
      // Base: 10 + (600 × 0.2) = 130 credits per day
      // Total: 130 × 30 = 3900
      expect(cost).toBe(3900)
    })

    it('should apply size multiplier for very large areas', () => {
      const cost = calculateAreaMonitoringCost({
        areaSizeKm2: 1200, // Very large area
        durationDays: 30
      })
      
      // Base: 10 + (1200 × 0.3) = 370 credits per day
      // Total: 370 × 30 = 11100
      expect(cost).toBe(11100)
    })

    it('should handle edge case area sizes', () => {
      // Exactly at boundary
      const cost100 = calculateAreaMonitoringCost({
        areaSizeKm2: 100,
        durationDays: 1
      })
      expect(cost100).toBe(10) // Still small area
      
      const cost500 = calculateAreaMonitoringCost({
        areaSizeKm2: 500,
        durationDays: 1
      })
      expect(cost500).toBe(60) // Medium area: 10 + (500 × 0.1)
    })
  })

  describe('calculateFleetTrackingCost', () => {
    it('should calculate monthly cost per vessel', () => {
      const cost = calculateFleetTrackingCost({
        vesselCount: 10,
        durationMonths: 3
      })
      
      // 10 vessels × 100 credits × 3 months = 3000
      expect(cost).toBe(3000)
    })

    it('should apply bulk discount for large fleets', () => {
      const cost = calculateFleetTrackingCost({
        vesselCount: 25, // Qualifies for 10% discount
        durationMonths: 1
      })
      
      // Base: 25 × 100 = 2500
      // Discount: 2500 × 0.9 = 2250
      expect(cost).toBe(2250)
    })

    it('should apply larger discount for very large fleets', () => {
      const cost = calculateFleetTrackingCost({
        vesselCount: 60, // Qualifies for 20% discount
        durationMonths: 1
      })
      
      // Base: 60 × 100 = 6000
      // Discount: 6000 × 0.8 = 4800
      expect(cost).toBe(4800)
    })

    it('should handle fractional months', () => {
      const cost = calculateFleetTrackingCost({
        vesselCount: 5,
        durationMonths: 1.5
      })
      
      // 5 × 100 × 1.5 = 750
      expect(cost).toBe(750)
    })
  })

  describe('calculateReportCost', () => {
    it('should return correct cost for compliance reports', () => {
      const cost = calculateReportCost('compliance')
      expect(cost).toBe(CREDIT_COSTS.REPORTS.COMPLIANCE)
    })

    it('should return correct cost for chronology reports', () => {
      const cost = calculateReportCost('chronology')
      expect(cost).toBe(CREDIT_COSTS.REPORTS.CHRONOLOGY)
    })

    it('should return default cost for unknown report types', () => {
      const cost = calculateReportCost('unknown' as 'compliance' | 'chronology')
      expect(cost).toBe(CREDIT_COSTS.REPORTS.COMPLIANCE) // Default
    })
  })

  describe('calculateInvestigationCost', () => {
    it('should return cost for basic investigation', () => {
      const cost = calculateInvestigationCost('basic')
      expect(cost).toBe(CREDIT_COSTS.INVESTIGATIONS.BASIC)
    })

    it('should return cost for comprehensive investigation', () => {
      const cost = calculateInvestigationCost('comprehensive')
      expect(cost).toBe(CREDIT_COSTS.INVESTIGATIONS.COMPREHENSIVE)
    })

    it('should handle custom investigation costs', () => {
      const cost = calculateInvestigationCost('custom', 7500)
      expect(cost).toBe(7500)
    })

    it('should return base cost for custom without specified amount', () => {
      const cost = calculateInvestigationCost('custom')
      expect(cost).toBe(CREDIT_COSTS.INVESTIGATIONS.BASIC)
    })
  })

  describe('calculateServiceCost', () => {
    it('should delegate to vessel tracking calculator', () => {
      const cost = calculateServiceCost('vessel-tracking', {
        criteriaCount: 2,
        durationDays: 5
      })
      
      expect(cost).toBe(50) // 2 × 5 × 5
    })

    it('should delegate to area monitoring calculator', () => {
      const cost = calculateServiceCost('area-monitoring', {
        areaSizeKm2: 200,
        durationDays: 10
      })
      
      expect(cost).toBe(300) // (10 + 200×0.1) × 10
    })

    it('should delegate to fleet tracking calculator', () => {
      const cost = calculateServiceCost('fleet-tracking', {
        vesselCount: 15,
        durationMonths: 2
      })
      
      expect(cost).toBe(3000) // 15 × 100 × 2
    })

    it('should delegate to report calculator', () => {
      const cost = calculateServiceCost('report-generation', {
        reportType: 'compliance'
      })
      
      expect(cost).toBe(50)
    })

    it('should delegate to investigation calculator', () => {
      const cost = calculateServiceCost('investigation', {
        investigationType: 'comprehensive'
      })
      
      expect(cost).toBe(10000)
    })

    it('should throw error for unknown service type', () => {
      expect(() => {
        calculateServiceCost('unknown' as 'vessel-tracking' | 'area-monitoring' | 'fleet-tracking' | 'report-generation' | 'investigation', {})
      }).toThrow('Unknown service type')
    })
  })

  describe('formatCreditAmount', () => {
    it('should format credit amounts with commas', () => {
      expect(formatCreditAmount(1000)).toBe('1,000')
      expect(formatCreditAmount(10000)).toBe('10,000')
      expect(formatCreditAmount(1000000)).toBe('1,000,000')
    })

    it('should handle small numbers', () => {
      expect(formatCreditAmount(1)).toBe('1')
      expect(formatCreditAmount(99)).toBe('99')
      expect(formatCreditAmount(999)).toBe('999')
    })

    it('should handle zero', () => {
      expect(formatCreditAmount(0)).toBe('0')
    })

    it('should handle negative numbers', () => {
      expect(formatCreditAmount(-1000)).toBe('-1,000')
    })
  })

  describe('getCreditPackageDiscount', () => {
    it('should return correct discount percentages', () => {
      expect(getCreditPackageDiscount(100)).toBe(0)
      expect(getCreditPackageDiscount(500)).toBe(10)
      expect(getCreditPackageDiscount(1000)).toBe(20)
      expect(getCreditPackageDiscount(5000)).toBe(30)
    })

    it('should return 0 for unknown packages', () => {
      expect(getCreditPackageDiscount(250)).toBe(0)
      expect(getCreditPackageDiscount(2000)).toBe(0)
    })
  })

  describe('validateCreditSufficiency', () => {
    it('should return true when sufficient credits', () => {
      const result = validateCreditSufficiency(1000, 500)
      expect(result.sufficient).toBe(true)
      expect(result.shortfall).toBe(0)
    })

    it('should return false when insufficient credits', () => {
      const result = validateCreditSufficiency(100, 500)
      expect(result.sufficient).toBe(false)
      expect(result.shortfall).toBe(400)
    })

    it('should handle exact match', () => {
      const result = validateCreditSufficiency(500, 500)
      expect(result.sufficient).toBe(true)
      expect(result.shortfall).toBe(0)
    })

    it('should handle zero balance', () => {
      const result = validateCreditSufficiency(0, 100)
      expect(result.sufficient).toBe(false)
      expect(result.shortfall).toBe(100)
    })

    it('should handle zero cost', () => {
      const result = validateCreditSufficiency(1000, 0)
      expect(result.sufficient).toBe(true)
      expect(result.shortfall).toBe(0)
    })
  })
})