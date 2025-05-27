import { describe, it, expect } from 'vitest'
import type { TrackingCriteria } from '@features/vessels/types/vessel'

describe('Vessel Tracking Criteria', () => {
  describe('Criteria Type Definitions', () => {
    it('should have all required tracking criteria types', () => {
      const validCriteriaTypes: TrackingCriteria['type'][] = [
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

      // Type-level check - this ensures the types match at compile time
      const _typeCheck: TrackingCriteria['type'][] = validCriteriaTypes
      expect(_typeCheck).toBeDefined()

      expect(validCriteriaTypes).toHaveLength(11)
    })
  })

  describe('TrackingCriteria Interface', () => {
    it('should create valid AIS reporting criteria', () => {
      const aisReportingCriteria: TrackingCriteria = {
        id: 'crit-1',
        type: 'ais_reporting',
        name: 'AIS Signal Monitoring',
        description: 'Monitor for AIS signal loss or unexpected signal changes',
        enabled: true,
        config: {
          minDarkDuration: 300, // 5 minutes
          alertOnReappearance: true,
        },
      }

      expect(aisReportingCriteria.type).toBe('ais_reporting')
      expect(aisReportingCriteria.enabled).toBe(true)
      expect(aisReportingCriteria.config).toBeDefined()
    })

    it('should create valid dark event criteria', () => {
      const darkEventCriteria: TrackingCriteria = {
        id: 'crit-2',
        type: 'dark_event',
        name: 'Extended AIS Darkness',
        description: 'Alert when vessel goes dark for extended periods',
        enabled: true,
        config: {
          minDarkDuration: 3600, // 1 hour
          maxAllowedDarkness: 24, // hours
          excludePortAreas: true,
        },
      }

      expect(darkEventCriteria.type).toBe('dark_event')
      expect(darkEventCriteria.config?.minDarkDuration).toBe(3600)
    })

    it('should create valid spoofing criteria', () => {
      const spoofingCriteria: TrackingCriteria = {
        id: 'crit-3',
        type: 'spoofing',
        name: 'Location Manipulation Detection',
        description: 'Detect potential AIS location spoofing or manipulation',
        enabled: true,
        config: {
          maxJumpDistance: 50, // nautical miles
          minJumpTime: 300, // seconds
          checkForImpossibleSpeed: true,
          maxPossibleSpeed: 50, // knots
        },
      }

      expect(spoofingCriteria.type).toBe('spoofing')
      expect(spoofingCriteria.config?.maxJumpDistance).toBe(50)
    })

    it('should create valid STS event criteria', () => {
      const stsEventCriteria: TrackingCriteria = {
        id: 'crit-4',
        type: 'sts_event',
        name: 'Ship-to-Ship Transfer',
        description: 'Monitor for potential ship-to-ship transfer operations',
        enabled: true,
        config: {
          proximityThreshold: 0.5, // nautical miles
          minDuration: 1800, // 30 minutes
          speedThreshold: 5, // knots
          includeAnchoredVessels: true,
        },
      }

      expect(stsEventCriteria.type).toBe('sts_event')
      expect(stsEventCriteria.config?.proximityThreshold).toBe(0.5)
    })

    it('should create valid port call criteria', () => {
      const portCallCriteria: TrackingCriteria = {
        id: 'crit-5',
        type: 'port_call',
        name: 'Port Activity Monitoring',
        description: 'Alert on port arrivals and departures',
        enabled: true,
        config: {
          monitoredPorts: ['USLAX', 'SGSIN', 'NLRTM'],
          alertOnArrival: true,
          alertOnDeparture: true,
          minPortStayDuration: 3600, // 1 hour
        },
      }

      expect(portCallCriteria.type).toBe('port_call')
      expect(portCallCriteria.config?.monitoredPorts).toHaveLength(3)
    })

    it('should create valid distress criteria', () => {
      const distressCriteria: TrackingCriteria = {
        id: 'crit-6',
        type: 'distress',
        name: 'Distress Signal Monitoring',
        description: 'Monitor for distress signals or emergency broadcasts',
        enabled: true,
        config: {
          includeManualDistress: true,
          includeAutomaticDistress: true,
          alertPriority: 'critical',
        },
      }

      expect(distressCriteria.type).toBe('distress')
      expect(distressCriteria.config?.alertPriority).toBe('critical')
    })

    it('should create valid ownership change criteria', () => {
      const ownershipChangeCriteria: TrackingCriteria = {
        id: 'crit-7',
        type: 'ownership_change',
        name: 'Ownership Transfer Detection',
        description: 'Alert when vessel ownership or management changes',
        enabled: true,
        config: {
          checkBeneficialOwner: true,
          checkRegisteredOwner: true,
          checkTechnicalManager: true,
          checkCommercialManager: true,
        },
      }

      expect(ownershipChangeCriteria.type).toBe('ownership_change')
      expect(ownershipChangeCriteria.config?.checkBeneficialOwner).toBe(true)
    })

    it('should create valid flag change criteria', () => {
      const flagChangeCriteria: TrackingCriteria = {
        id: 'crit-8',
        type: 'flag_change',
        name: 'Flag State Change Detection',
        description: 'Monitor for vessel flag/registry changes',
        enabled: true,
        config: {
          previousFlags: ['PA', 'LR'],
          alertOnHighRiskFlag: true,
          highRiskFlags: ['KM', 'TG', 'KH'],
        },
      }

      expect(flagChangeCriteria.type).toBe('flag_change')
      expect(flagChangeCriteria.config?.highRiskFlags).toHaveLength(3)
    })

    it('should create valid geofence criteria', () => {
      const geofenceCriteria: TrackingCriteria = {
        id: 'crit-9',
        type: 'geofence',
        name: 'Geographic Boundary Monitoring',
        description:
          'Alert when vessel enters or exits defined geographic areas',
        enabled: true,
        config: {
          areas: [
            {
              id: 'area-1',
              name: 'Persian Gulf',
              type: 'polygon',
              coordinates: [
                [50.0, 27.0],
                [56.5, 27.0],
                [56.5, 24.0],
                [50.0, 24.0],
              ],
              alertOnEntry: true,
              alertOnExit: true,
            },
          ],
        },
      }

      expect(geofenceCriteria.type).toBe('geofence')
      expect(geofenceCriteria.config?.areas as unknown[]).toHaveLength(1)
    })

    it('should create valid risk change criteria', () => {
      const riskChangeCriteria: TrackingCriteria = {
        id: 'crit-10',
        type: 'risk_change',
        name: 'Risk Level Monitoring',
        description: 'Alert when vessel risk assessment changes',
        enabled: true,
        config: {
          currentRiskLevel: 'low',
          alertOnIncrease: true,
          alertOnDecrease: false,
          minRiskLevel: 'medium',
        },
      }

      expect(riskChangeCriteria.type).toBe('risk_change')
      expect(riskChangeCriteria.config?.alertOnIncrease).toBe(true)
    })

    it('should create valid high risk area criteria', () => {
      const highRiskAreaCriteria: TrackingCriteria = {
        id: 'crit-11',
        type: 'high_risk_area',
        name: 'High Risk Area Entry',
        description: 'Monitor vessel entry into designated high-risk zones',
        enabled: true,
        config: {
          riskAreas: [
            'HRA_GULF_OF_ADEN',
            'HRA_WEST_AFRICA',
            'HRA_MALACCA_STRAIT',
          ],
          alertOnApproach: true,
          approachDistance: 50, // nautical miles
          includeWarRiskAreas: true,
          includePiracyAreas: true,
        },
      }

      expect(highRiskAreaCriteria.type).toBe('high_risk_area')
      expect(highRiskAreaCriteria.config?.riskAreas).toHaveLength(3)
    })
  })

  describe('Criteria Configuration Validation', () => {
    it('should allow optional config for basic criteria', () => {
      const basicCriteria: TrackingCriteria = {
        id: 'crit-basic',
        type: 'ais_reporting',
        name: 'Basic AIS Monitoring',
        description: 'Simple AIS monitoring without custom config',
        enabled: true,
        // config is optional
      }

      expect(basicCriteria.config).toBeUndefined()
      expect(basicCriteria.enabled).toBe(true)
    })

    it('should support disabled criteria', () => {
      const disabledCriteria: TrackingCriteria = {
        id: 'crit-disabled',
        type: 'spoofing',
        name: 'Spoofing Detection (Disabled)',
        description: 'Currently disabled spoofing detection',
        enabled: false,
      }

      expect(disabledCriteria.enabled).toBe(false)
    })

    it('should support complex nested configuration', () => {
      const complexCriteria: TrackingCriteria = {
        id: 'crit-complex',
        type: 'geofence',
        name: 'Multi-Area Geofencing',
        description: 'Complex geofencing with multiple areas and rules',
        enabled: true,
        config: {
          areas: [
            {
              id: 'area-1',
              name: 'Exclusive Economic Zone A',
              type: 'polygon',
              coordinates: [
                [0, 0],
                [0, 10],
                [10, 10],
                [10, 0],
              ],
              alertOnEntry: true,
              alertOnExit: false,
              restrictions: {
                vesselTypes: ['tanker', 'cargo'],
                minDwt: 10000,
                flagStates: ['exclude', ['IR', 'KP']],
              },
            },
            {
              id: 'area-2',
              name: 'Port Security Zone',
              type: 'circle',
              center: [40.7128, -74.006],
              radius: 5, // nautical miles
              alertOnEntry: true,
              alertOnExit: true,
              timeRestrictions: {
                days: ['saturday', 'sunday'],
                hours: { from: '22:00', to: '06:00' },
              },
            },
          ],
          globalSettings: {
            alertCooldown: 3600, // 1 hour between alerts
            combinedAreaLogic: 'OR',
            excludeOwnFleet: true,
          },
        },
      }

      expect(complexCriteria.config).toBeDefined()
      expect(complexCriteria.config?.areas as unknown[]).toHaveLength(2)
      expect(complexCriteria.config?.globalSettings).toBeDefined()
    })
  })

  describe('Criteria Business Rules', () => {
    it('should validate that all criteria have unique IDs when used together', () => {
      const trackingCriteria: TrackingCriteria[] = [
        {
          id: 'crit-1',
          type: 'ais_reporting',
          name: 'AIS Monitoring',
          description: 'Monitor AIS',
          enabled: true,
        },
        {
          id: 'crit-2',
          type: 'dark_event',
          name: 'Dark Event',
          description: 'Monitor darkness',
          enabled: true,
        },
      ]

      const ids = trackingCriteria.map((c) => c.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(trackingCriteria.length)
    })

    it('should support combining multiple criteria for comprehensive monitoring', () => {
      const comprehensiveTracking: TrackingCriteria[] = [
        {
          id: 'comp-1',
          type: 'ais_reporting',
          name: 'AIS Monitoring',
          description: 'Basic AIS signal monitoring',
          enabled: true,
        },
        {
          id: 'comp-2',
          type: 'spoofing',
          name: 'Anti-Spoofing',
          description: 'Detect location manipulation',
          enabled: true,
        },
        {
          id: 'comp-3',
          type: 'geofence',
          name: 'Area Monitoring',
          description: 'Monitor specific zones',
          enabled: true,
          config: {
            areas: [{ id: 'zone-1', name: 'Restricted Zone' }],
          },
        },
        {
          id: 'comp-4',
          type: 'risk_change',
          name: 'Risk Alerts',
          description: 'Monitor risk level changes',
          enabled: true,
        },
      ]

      expect(comprehensiveTracking).toHaveLength(4)
      expect(comprehensiveTracking.every((c) => c.enabled)).toBe(true)
      expect(new Set(comprehensiveTracking.map((c) => c.type)).size).toBe(4)
    })

    it('should calculate different configurations for different use cases', () => {
      // Sanctions compliance monitoring
      const sanctionsMonitoring: TrackingCriteria[] = [
        {
          id: 'sanc-1',
          type: 'dark_event',
          name: 'Sanctions Evasion Detection',
          description:
            'Detect potential sanctions evasion through AIS manipulation',
          enabled: true,
          config: { minDarkDuration: 1800 }, // 30 minutes
        },
        {
          id: 'sanc-2',
          type: 'sts_event',
          name: 'Illicit Transfer Detection',
          description: 'Monitor for ship-to-ship transfers',
          enabled: true,
        },
        {
          id: 'sanc-3',
          type: 'spoofing',
          name: 'Location Falsification',
          description: 'Detect false location broadcasts',
          enabled: true,
        },
        {
          id: 'sanc-4',
          type: 'ownership_change',
          name: 'Ownership Monitoring',
          description:
            'Track ownership changes that might indicate sanctions evasion',
          enabled: true,
        },
      ]

      // Safety monitoring
      const safetyMonitoring: TrackingCriteria[] = [
        {
          id: 'safe-1',
          type: 'distress',
          name: 'Emergency Monitoring',
          description: 'Monitor for distress signals',
          enabled: true,
        },
        {
          id: 'safe-2',
          type: 'high_risk_area',
          name: 'Piracy Zone Alerts',
          description: 'Alert on high-risk area entry',
          enabled: true,
        },
        {
          id: 'safe-3',
          type: 'ais_reporting',
          name: 'Signal Loss Detection',
          description: 'Detect unexpected signal loss',
          enabled: true,
        },
      ]

      expect(sanctionsMonitoring).toHaveLength(4)
      expect(safetyMonitoring).toHaveLength(3)
      expect(sanctionsMonitoring[0].type).toBe('dark_event')
      expect(safetyMonitoring[0].type).toBe('distress')
    })
  })
})
