import { describe, it, expect } from 'vitest'
import {
  TRACKING_CRITERIA,
  TRACKING_CRITERIA_NAMES,
  TRACKING_CRITERIA_CATEGORIES,
  DEFAULT_ENABLED_CRITERIA,
  CRITICAL_CRITERIA,
  getTrackingCriteriaByType,
  getTrackingCriteriaByCategory,
  isCriticalCriteria,
  getSuggestedCriteria,
} from '@/constants/tracking-criteria'
import type { TrackingCriteria } from '@features/vessels/types/vessel'

describe('Tracking Criteria Constants', () => {
  describe('TRACKING_CRITERIA', () => {
    it('should define all 11 tracking criteria types', () => {
      expect(TRACKING_CRITERIA).toHaveLength(11)
    })

    it('should have unique criteria types', () => {
      const types = TRACKING_CRITERIA.map((c) => c.type)
      const uniqueTypes = new Set(types)
      expect(uniqueTypes.size).toBe(types.length)
    })

    it('should have required fields for each criteria', () => {
      TRACKING_CRITERIA.forEach((criteria) => {
        expect(criteria.type).toBeDefined()
        expect(criteria.name).toBeDefined()
        expect(criteria.description).toBeDefined()
        expect(criteria.config).toBeDefined()
      })
    })

    it('should not include id or enabled fields', () => {
      TRACKING_CRITERIA.forEach((criteria) => {
        expect('id' in criteria).toBe(false)
        expect('enabled' in criteria).toBe(false)
      })
    })

    it('should have proper config for AIS reporting', () => {
      const aisConfig = TRACKING_CRITERIA.find(
        (c) => c.type === 'ais_reporting',
      )?.config
      expect(aisConfig).toMatchObject({
        minDarkDuration: 300,
        alertOnReappearance: true,
        checkReportingFrequency: true,
      })
    })

    it('should have proper config for geofence', () => {
      const geoConfig = TRACKING_CRITERIA.find(
        (c) => c.type === 'geofence',
      )?.config
      expect(geoConfig).toMatchObject({
        alertOnEntry: true,
        alertOnExit: true,
        alertOnLoitering: true,
        loiteringDuration: 7200,
        supportedShapes: ['polygon', 'circle', 'rectangle'],
      })
    })
  })

  describe('TRACKING_CRITERIA_NAMES', () => {
    it('should have names for all criteria types', () => {
      const expectedTypes: TrackingCriteria['type'][] = [
        'ais_reporting',
        'dark_event',
        'spoofing',
        'sts_event',
        'port_call',
        'distress',
        'ownership_change',
        'flag_change',
        'geofence',
        'risk_change',
        'high_risk_area',
      ]

      expectedTypes.forEach((type) => {
        expect(TRACKING_CRITERIA_NAMES[type]).toBeDefined()
        expect(TRACKING_CRITERIA_NAMES[type]).toBeTruthy()
      })
    })

    it('should match names in TRACKING_CRITERIA', () => {
      TRACKING_CRITERIA.forEach((criteria) => {
        expect(TRACKING_CRITERIA_NAMES[criteria.type]).toBe(criteria.name)
      })
    })
  })

  describe('TRACKING_CRITERIA_CATEGORIES', () => {
    it('should have 4 categories', () => {
      const categories = Object.keys(TRACKING_CRITERIA_CATEGORIES)
      expect(categories).toHaveLength(4)
      expect(categories).toContain('signal_integrity')
      expect(categories).toContain('vessel_activity')
      expect(categories).toContain('compliance_risk')
      expect(categories).toContain('safety_security')
    })

    it('should categorize all criteria types', () => {
      const allCategorizedCriteria = Object.values(
        TRACKING_CRITERIA_CATEGORIES,
      ).flatMap((cat) => cat.criteria)

      expect(allCategorizedCriteria).toHaveLength(11)
      expect(new Set(allCategorizedCriteria).size).toBe(11)
    })

    it('should have proper signal integrity criteria', () => {
      const signalIntegrity = TRACKING_CRITERIA_CATEGORIES.signal_integrity
      expect(signalIntegrity.criteria).toEqual([
        'ais_reporting',
        'dark_event',
        'spoofing',
      ])
    })

    it('should have proper compliance risk criteria', () => {
      const complianceRisk = TRACKING_CRITERIA_CATEGORIES.compliance_risk
      expect(complianceRisk.criteria).toEqual([
        'ownership_change',
        'flag_change',
        'risk_change',
      ])
    })
  })

  describe('DEFAULT_ENABLED_CRITERIA', () => {
    it('should include commonly used criteria', () => {
      expect(DEFAULT_ENABLED_CRITERIA).toHaveLength(4)
      expect(DEFAULT_ENABLED_CRITERIA).toContain('ais_reporting')
      expect(DEFAULT_ENABLED_CRITERIA).toContain('dark_event')
      expect(DEFAULT_ENABLED_CRITERIA).toContain('port_call')
      expect(DEFAULT_ENABLED_CRITERIA).toContain('risk_change')
    })

    it('should only include valid criteria types', () => {
      const validTypes = TRACKING_CRITERIA.map((c) => c.type)
      DEFAULT_ENABLED_CRITERIA.forEach((type) => {
        expect(validTypes).toContain(type)
      })
    })
  })

  describe('CRITICAL_CRITERIA', () => {
    it('should identify critical alert criteria', () => {
      expect(CRITICAL_CRITERIA).toHaveLength(3)
      expect(CRITICAL_CRITERIA).toContain('distress')
      expect(CRITICAL_CRITERIA).toContain('spoofing')
      expect(CRITICAL_CRITERIA).toContain('high_risk_area')
    })
  })

  describe('getTrackingCriteriaByType', () => {
    it('should return criteria for valid type', () => {
      const criteria = getTrackingCriteriaByType('ais_reporting')
      expect(criteria).toBeDefined()
      expect(criteria?.type).toBe('ais_reporting')
      expect(criteria?.name).toBe('AIS Signal Monitoring')
    })

    it('should return undefined for invalid type', () => {
      const criteria = getTrackingCriteriaByType(
        'invalid_type' as TrackingCriteria['type'],
      )
      expect(criteria).toBeUndefined()
    })

    it('should return complete criteria config', () => {
      const criteria = getTrackingCriteriaByType('sts_event')
      expect(criteria).toMatchObject({
        type: 'sts_event',
        name: 'Ship-to-Ship Transfer',
        description: expect.any(String),
        config: expect.objectContaining({
          proximityThreshold: 0.5,
          minDuration: 1800,
        }),
      })
    })
  })

  describe('getTrackingCriteriaByCategory', () => {
    it('should return criteria for valid category', () => {
      const criteria = getTrackingCriteriaByCategory('signal_integrity')
      expect(criteria).toHaveLength(3)
      expect(criteria.map((c) => c.type)).toEqual([
        'ais_reporting',
        'dark_event',
        'spoofing',
      ])
    })

    it('should return empty array for invalid category', () => {
      const criteria = getTrackingCriteriaByCategory(
        'invalid_category' as keyof typeof TRACKING_CRITERIA_CATEGORIES,
      )
      expect(criteria).toEqual([])
    })

    it('should return complete criteria objects', () => {
      const criteria = getTrackingCriteriaByCategory('safety_security')
      expect(criteria).toHaveLength(2)
      criteria.forEach((c) => {
        expect(c.type).toBeDefined()
        expect(c.name).toBeDefined()
        expect(c.description).toBeDefined()
        expect(c.config).toBeDefined()
      })
    })
  })

  describe('isCriticalCriteria', () => {
    it('should identify critical criteria', () => {
      expect(isCriticalCriteria('distress')).toBe(true)
      expect(isCriticalCriteria('spoofing')).toBe(true)
      expect(isCriticalCriteria('high_risk_area')).toBe(true)
    })

    it('should identify non-critical criteria', () => {
      expect(isCriticalCriteria('ais_reporting')).toBe(false)
      expect(isCriticalCriteria('port_call')).toBe(false)
      expect(isCriticalCriteria('ownership_change')).toBe(false)
    })
  })

  describe('getSuggestedCriteria', () => {
    it('should suggest compliance criteria', () => {
      const suggested = getSuggestedCriteria('tanker', 'compliance')
      expect(suggested).toContain('ais_reporting')
      expect(suggested).toContain('dark_event')
      expect(suggested).toContain('spoofing')
      expect(suggested).toContain('sts_event')
      expect(suggested).toContain('ownership_change')
      expect(suggested).toContain('flag_change')
      expect(suggested).toContain('risk_change')
    })

    it('should suggest safety criteria', () => {
      const suggested = getSuggestedCriteria('passenger', 'safety')
      expect(suggested).toContain('ais_reporting')
      expect(suggested).toContain('distress')
      expect(suggested).toContain('high_risk_area')
      expect(suggested).toContain('port_call')
      expect(suggested).toContain('risk_change')
    })

    it('should suggest security criteria', () => {
      const suggested = getSuggestedCriteria('cargo', 'security')
      expect(suggested).toContain('ais_reporting')
      expect(suggested).toContain('dark_event')
      expect(suggested).toContain('spoofing')
      expect(suggested).toContain('geofence')
      expect(suggested).toContain('high_risk_area')
      expect(suggested).toContain('risk_change')
    })

    it('should return default criteria for general use case', () => {
      const suggested = getSuggestedCriteria('bulk_carrier', 'general')
      expect(suggested).toEqual(DEFAULT_ENABLED_CRITERIA)
    })

    it('should handle unknown use case', () => {
      const suggested = getSuggestedCriteria(
        'yacht',
        'unknown' as 'compliance' | 'safety' | 'security' | 'general',
      )
      expect(suggested).toEqual(DEFAULT_ENABLED_CRITERIA)
    })

    it('should not include duplicate criteria', () => {
      const useCases = ['compliance', 'safety', 'security', 'general'] as const
      useCases.forEach((useCase) => {
        const suggested = getSuggestedCriteria('tanker', useCase)
        const unique = new Set(suggested)
        expect(unique.size).toBe(suggested.length)
      })
    })
  })

  describe('Data Consistency', () => {
    it('should have consistent criteria across all exports', () => {
      const criteriaTypes = TRACKING_CRITERIA.map((c) => c.type)
      const nameTypes = Object.keys(
        TRACKING_CRITERIA_NAMES,
      ) as TrackingCriteria['type'][]
      const categoryTypes = Object.values(TRACKING_CRITERIA_CATEGORIES).flatMap(
        (cat) => cat.criteria,
      )

      // All should have the same 11 types
      expect(new Set(criteriaTypes).size).toBe(11)
      expect(new Set(nameTypes).size).toBe(11)
      expect(new Set(categoryTypes).size).toBe(11)

      // All types should match
      criteriaTypes.forEach((type) => {
        expect(nameTypes).toContain(type)
        expect(categoryTypes).toContain(type)
      })
    })

    it('should have all default criteria in main list', () => {
      const criteriaTypes = TRACKING_CRITERIA.map((c) => c.type)
      DEFAULT_ENABLED_CRITERIA.forEach((type) => {
        expect(criteriaTypes).toContain(type)
      })
    })

    it('should have all critical criteria in main list', () => {
      const criteriaTypes = TRACKING_CRITERIA.map((c) => c.type)
      CRITICAL_CRITERIA.forEach((type) => {
        expect(criteriaTypes).toContain(type)
      })
    })
  })
})
