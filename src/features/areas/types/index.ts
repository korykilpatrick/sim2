/**
 * Represents a geographic area for maritime monitoring.
 */
export interface Area {
  /** Unique area identifier */
  id: string
  /** Area name */
  name: string
  /** Optional area description */
  description?: string
  /** GeoJSON geometry defining the area boundaries */
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
  /** Bounding box coordinates for quick spatial queries */
  bounds: {
    /** Northern boundary (latitude) */
    north: number
    /** Southern boundary (latitude) */
    south: number
    /** Eastern boundary (longitude) */
    east: number
    /** Western boundary (longitude) */
    west: number
  }
  /** Area size in square kilometers */
  sizeKm2: number
  /** Whether monitoring is currently active */
  isActive: boolean
  /** IDs of monitoring criteria applied to this area */
  criteria: string[]
  /** Whether alerts are enabled for this area */
  alertsEnabled: boolean
  /** ISO timestamp of area creation */
  createdAt: string
  /** ISO timestamp of last update */
  updatedAt: string
  /** ISO timestamp when monitoring expires */
  expiresAt?: string
  /** Daily credit cost for monitoring this area */
  creditsPerDay: number
  /** Total number of alerts generated */
  totalAlerts: number
}

/**
 * Active monitoring configuration for a geographic area.
 */
export interface AreaMonitoring {
  id: string
  areaId: string
  area: Area
  status: 'active' | 'paused' | 'expired'
  startDate: string
  endDate: string
  /** Update frequency in hours */
  updateFrequency: 3 | 6 | 12 | 24
  criteria: MonitoringCriteria[]
  vesselsInArea: number
  lastUpdate: string
  alertsToday: number
  creditsPerDay: number
  totalCreditsUsed: number
}

/**
 * Specific monitoring criterion that can trigger alerts.
 */
export interface MonitoringCriteria {
  id: string
  name: string
  description: string
  /** Criterion category for grouping and filtering */
  category:
    | 'vessel_activity'
    | 'risk_assessment'
    | 'compliance'
    | 'environmental'
  creditsPerAlert: number
  enabled: boolean
}

/**
 * Alert generated from area monitoring activities.
 */
export interface AreaAlert {
  id: string
  areaId: string
  monitoringId: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  /** Information about the vessel that triggered the alert */
  vesselInfo?: {
    /** Vessel ID */
    id: string
    /** Vessel name */
    name: string
    /** IMO number */
    imo: string
    /** Flag state */
    flag: string
  }
  /** Location where the alert was triggered */
  location: {
    /** Latitude in decimal degrees */
    lat: number
    /** Longitude in decimal degrees */
    lng: number
  }
  timestamp: string
  isRead: boolean
  creditsUsed: number
}

/**
 * Request payload for creating a new monitoring area.
 */
export interface CreateAreaRequest {
  name: string
  description?: string
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
  criteria: string[]
  updateFrequency: 3 | 6 | 12 | 24
  /** Monitoring duration in days */
  duration: number
  alertsEnabled: boolean
}

/**
 * Aggregate statistics for all user monitoring areas.
 */
export interface AreaStatistics {
  totalAreas: number
  activeMonitoring: number
  alertsToday: number
  creditsPerDay: number
  vesselsMonitored: number
  highRiskVessels: number
}

/**
 * Filter and sort options for area listings.
 */
export interface AreaFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  hasAlerts?: boolean
  sortBy?: 'name' | 'createdAt' | 'size' | 'alerts'
  sortOrder?: 'asc' | 'desc'
}
