/**
 * @module constants/tracking-criteria
 * @description Centralized tracking criteria definitions for vessel monitoring.
 * These constants define all available tracking criteria types with their
 * configurations, descriptions, and default settings.
 */

import type { TrackingCriteria } from '@features/vessels/types/vessel'

/**
 * Default tracking criteria configurations.
 * These are the standard monitoring criteria available for vessel tracking.
 */
export const TRACKING_CRITERIA: Omit<TrackingCriteria, 'id' | 'enabled'>[] = [
  {
    type: 'ais_reporting',
    name: 'AIS Signal Monitoring',
    description:
      'Monitor for AIS signal loss, unexpected signal changes, or irregular reporting patterns',
    config: {
      minDarkDuration: 300, // 5 minutes minimum before alerting
      alertOnReappearance: true,
      checkReportingFrequency: true,
    },
  },
  {
    type: 'dark_event',
    name: 'Extended AIS Darkness',
    description:
      'Alert when vessel goes dark for extended periods, potentially indicating illicit activity',
    config: {
      minDarkDuration: 3600, // 1 hour minimum
      maxAllowedDarkness: 24, // hours before critical alert
      excludePortAreas: true,
      excludeAnchorageAreas: true,
    },
  },
  {
    type: 'spoofing',
    name: 'Location Manipulation Detection',
    description:
      'Detect potential AIS location spoofing, impossible movements, or signal manipulation',
    config: {
      maxJumpDistance: 50, // nautical miles
      minJumpTime: 300, // seconds
      checkForImpossibleSpeed: true,
      maxPossibleSpeed: 50, // knots
      checkForInlandBroadcast: true,
    },
  },
  {
    type: 'sts_event',
    name: 'Ship-to-Ship Transfer',
    description:
      'Monitor for potential ship-to-ship transfer operations, including at-sea transshipments',
    config: {
      proximityThreshold: 0.5, // nautical miles
      minDuration: 1800, // 30 minutes
      speedThreshold: 5, // knots - both vessels below this speed
      includeAnchoredVessels: true,
      includeDriftingVessels: true,
    },
  },
  {
    type: 'port_call',
    name: 'Port Activity Monitoring',
    description:
      'Track port arrivals, departures, and unusual port visit patterns',
    config: {
      alertOnArrival: true,
      alertOnDeparture: true,
      minPortStayDuration: 3600, // 1 hour to count as port call
      detectUnusualDuration: true,
      trackPortSequence: true,
    },
  },
  {
    type: 'distress',
    name: 'Distress Signal Monitoring',
    description:
      'Monitor for distress signals, emergency broadcasts, or safety-related alerts',
    config: {
      includeManualDistress: true,
      includeAutomaticDistress: true,
      includeUrgencySignals: true,
      includeSafetySignals: true,
      alertPriority: 'critical',
    },
  },
  {
    type: 'ownership_change',
    name: 'Ownership Transfer Detection',
    description:
      'Alert when vessel ownership, management, or beneficial ownership changes',
    config: {
      checkBeneficialOwner: true,
      checkRegisteredOwner: true,
      checkTechnicalManager: true,
      checkCommercialManager: true,
      checkISMManager: true,
    },
  },
  {
    type: 'flag_change',
    name: 'Flag State Change Detection',
    description:
      'Monitor for vessel flag/registry changes, especially to flags of convenience',
    config: {
      alertOnAnyChange: true,
      alertOnHighRiskFlag: true,
      highRiskFlags: ['KM', 'TG', 'KH', 'PW', 'SL'], // Comoros, Togo, Cambodia, Palau, Sierra Leone
      trackFlagHistory: true,
    },
  },
  {
    type: 'geofence',
    name: 'Geographic Boundary Monitoring',
    description:
      'Alert when vessel enters, exits, or operates within defined geographic areas',
    config: {
      alertOnEntry: true,
      alertOnExit: true,
      alertOnLoitering: true,
      loiteringDuration: 7200, // 2 hours
      supportedShapes: ['polygon', 'circle', 'rectangle'],
    },
  },
  {
    type: 'risk_change',
    name: 'Risk Level Monitoring',
    description:
      'Track changes in vessel risk assessment based on behavior, history, and associations',
    config: {
      alertOnIncrease: true,
      alertOnDecrease: false,
      includeReasons: true,
      riskFactors: [
        'sanctions_exposure',
        'adverse_media',
        'inspection_deficiencies',
        'incident_history',
        'fleet_risk',
        'age_condition',
      ],
    },
  },
  {
    type: 'high_risk_area',
    name: 'High Risk Area Entry',
    description:
      'Monitor vessel entry into designated high-risk zones including war risk and piracy areas',
    config: {
      alertOnApproach: true,
      approachDistance: 50, // nautical miles
      alertOnEntry: true,
      alertOnExit: true,
      includeWarRiskAreas: true,
      includePiracyAreas: true,
      includeSanctionedWaters: true,
    },
  },
]

/**
 * Map of tracking criteria types to their display names.
 * Useful for UI components that need to display human-readable names.
 */
export const TRACKING_CRITERIA_NAMES: Record<TrackingCriteria['type'], string> =
  {
    ais_reporting: 'AIS Signal Monitoring',
    dark_event: 'Extended AIS Darkness',
    spoofing: 'Location Manipulation Detection',
    sts_event: 'Ship-to-Ship Transfer',
    port_call: 'Port Activity Monitoring',
    distress: 'Distress Signal Monitoring',
    ownership_change: 'Ownership Transfer Detection',
    flag_change: 'Flag State Change Detection',
    geofence: 'Geographic Boundary Monitoring',
    risk_change: 'Risk Level Monitoring',
    high_risk_area: 'High Risk Area Entry',
  }

/**
 * Tracking criteria categories for grouping in UI.
 */
export const TRACKING_CRITERIA_CATEGORIES = {
  signal_integrity: {
    name: 'Signal Integrity',
    description: 'Monitor AIS signal quality and authenticity',
    criteria: ['ais_reporting', 'dark_event', 'spoofing'] as const,
  },
  vessel_activity: {
    name: 'Vessel Activity',
    description: 'Track vessel movements and operations',
    criteria: ['sts_event', 'port_call', 'geofence'] as const,
  },
  compliance_risk: {
    name: 'Compliance & Risk',
    description: 'Monitor compliance and risk indicators',
    criteria: ['ownership_change', 'flag_change', 'risk_change'] as const,
  },
  safety_security: {
    name: 'Safety & Security',
    description: 'Safety and security monitoring',
    criteria: ['distress', 'high_risk_area'] as const,
  },
} as const

/**
 * Default enabled criteria for new vessel trackings.
 * These are the most commonly used criteria.
 */
export const DEFAULT_ENABLED_CRITERIA: TrackingCriteria['type'][] = [
  'ais_reporting',
  'dark_event',
  'port_call',
  'risk_change',
]

/**
 * Critical criteria that trigger immediate alerts.
 */
export const CRITICAL_CRITERIA: TrackingCriteria['type'][] = [
  'distress',
  'spoofing',
  'high_risk_area',
]

/**
 * Get tracking criteria by type.
 * @param type - The criteria type to retrieve
 * @returns The tracking criteria configuration or undefined
 */
export function getTrackingCriteriaByType(
  type: TrackingCriteria['type'],
): Omit<TrackingCriteria, 'id' | 'enabled'> | undefined {
  return TRACKING_CRITERIA.find((criteria) => criteria.type === type)
}

/**
 * Get tracking criteria by category.
 * @param category - The category to retrieve criteria for
 * @returns Array of tracking criteria in the category
 */
export function getTrackingCriteriaByCategory(
  category: keyof typeof TRACKING_CRITERIA_CATEGORIES,
): Array<Omit<TrackingCriteria, 'id' | 'enabled'>> {
  const categoryData = TRACKING_CRITERIA_CATEGORIES[category]
  if (!categoryData) return []

  return categoryData.criteria
    .map((type) => getTrackingCriteriaByType(type))
    .filter(
      (criteria): criteria is Omit<TrackingCriteria, 'id' | 'enabled'> =>
        criteria !== undefined,
    )
}

/**
 * Check if a criteria type is critical.
 * @param type - The criteria type to check
 * @returns True if the criteria triggers critical alerts
 */
export function isCriticalCriteria(type: TrackingCriteria['type']): boolean {
  return CRITICAL_CRITERIA.includes(type)
}

/**
 * Get suggested criteria based on vessel type and use case.
 * @param vesselType - The type of vessel being tracked
 * @param useCase - The monitoring use case
 * @returns Array of suggested criteria types
 */
export function getSuggestedCriteria(
  _vesselType: string,
  useCase: 'compliance' | 'safety' | 'security' | 'general',
): TrackingCriteria['type'][] {
  const baseCriteria: TrackingCriteria['type'][] = [
    'ais_reporting',
    'risk_change',
  ]

  switch (useCase) {
    case 'compliance':
      return [
        ...baseCriteria,
        'dark_event',
        'spoofing',
        'sts_event',
        'ownership_change',
        'flag_change',
      ]

    case 'safety':
      return [...baseCriteria, 'distress', 'high_risk_area', 'port_call']

    case 'security':
      return [
        ...baseCriteria,
        'dark_event',
        'spoofing',
        'geofence',
        'high_risk_area',
      ]

    case 'general':
    default:
      return DEFAULT_ENABLED_CRITERIA
  }
}
