/**
 * Represents a maritime vessel with tracking and identification data.
 */
export interface Vessel {
  /** Unique vessel identifier in our system */
  id: string
  /** International Maritime Organization number */
  imo: string
  /** Maritime Mobile Service Identity number */
  mmsi: string
  /** Vessel name */
  name: string
  /** Flag state ISO code */
  flag: string
  /** Vessel type (e.g., 'Cargo', 'Tanker', 'Passenger') */
  type: string
  /** Current operational status */
  status: 'active' | 'inactive' | 'dark' | 'distress'
  /** Most recent AIS position data */
  lastPosition: {
    /** Latitude in decimal degrees */
    lat: number
    /** Longitude in decimal degrees */
    lng: number
    /** ISO timestamp of position report */
    timestamp: string
    /** Speed over ground in knots */
    speed: number
    /** Course over ground in degrees */
    course: number
  }
  /** Calculated risk assessment level */
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  /** Vessel owner/operator name */
  owner?: string
  /** Current destination port */
  destination?: string
  /** Estimated time of arrival ISO timestamp */
  eta?: string
  /** Current draught in meters */
  draught?: number
  /** Vessel length in meters */
  length?: number
  /** Vessel width/beam in meters */
  width?: number
}

/**
 * Represents an active vessel tracking subscription.
 * Tracks a specific vessel based on selected monitoring criteria.
 */
export interface VesselTracking {
  /** Unique tracking subscription ID */
  id: string
  /** ID of the vessel being tracked */
  vesselId: string
  /** Full vessel data */
  vessel: Vessel
  /** Active monitoring criteria for this tracking */
  criteria: TrackingCriteria[]
  /** Current tracking subscription status */
  status: 'active' | 'paused' | 'expired'
  /** ISO timestamp when tracking started */
  startDate: string
  /** ISO timestamp when tracking expires */
  endDate: string
  /** Total number of alerts generated */
  alertsCount: number
  /** Daily credit cost for this tracking */
  creditsPerDay: number
  /** ID of user who created this tracking */
  userId: string
}

/**
 * Defines monitoring criteria for vessel tracking alerts.
 * Each criterion type triggers specific alert conditions.
 */
export interface TrackingCriteria {
  /** Unique criterion identifier */
  id: string
  /** Type of monitoring criterion */
  type:
    | 'ais_reporting' // AIS signal loss/gain
    | 'dark_event' // Extended AIS darkness
    | 'spoofing' // Location manipulation detection
    | 'sts_event' // Ship-to-ship transfer
    | 'port_call' // Port arrival/departure
    | 'distress' // Distress signal broadcast
    | 'ownership_change' // Vessel ownership transfer
    | 'flag_change' // Flag state change
    | 'geofence' // Geographic boundary crossing
    | 'risk_change' // Risk level escalation
    | 'high_risk_area' // Entry into high-risk zones
  /** Human-readable criterion name */
  name: string
  /** Detailed description of what this criterion monitors */
  description: string
  /** Whether this criterion is currently active */
  enabled: boolean
  /** Type-specific configuration (e.g., geofence coordinates) */
  config?: Record<string, unknown>
}

/**
 * Alert generated when a vessel meets tracking criteria conditions.
 */
export interface VesselAlert {
  /** Unique alert identifier */
  id: string
  /** ID of the tracking subscription that generated this alert */
  trackingId: string
  /** ID of the vessel that triggered the alert */
  vesselId: string
  /** Type of criterion that triggered this alert */
  type: TrackingCriteria['type']
  /** Alert severity level */
  severity: 'info' | 'warning' | 'critical'
  /** Brief alert title */
  title: string
  /** Detailed alert description */
  description: string
  /** ISO timestamp when alert was generated */
  timestamp: string
  /** Additional context data specific to alert type */
  data?: Record<string, unknown>
  /** Whether user has acknowledged this alert */
  acknowledged: boolean
}

/**
 * Search parameters for vessel lookup operations.
 * All fields are optional and will be combined with AND logic.
 */
export interface VesselSearchParams {
  /** General search query (searches multiple fields) */
  query?: string
  /** IMO number exact match */
  imo?: string
  /** MMSI number exact match */
  mmsi?: string
  /** Vessel name partial match */
  name?: string
  /** Flag state filter */
  flag?: string
  /** Vessel type filter */
  type?: string
  /** Risk level filter */
  riskLevel?: Vessel['riskLevel']
}
