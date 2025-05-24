/**
 * Represents a compliance or chronology report for a vessel.
 */
export interface ComplianceReport {
  /** Unique report identifier */
  id: string
  /** ID of the vessel this report covers */
  vesselId: string
  /** Name of the vessel */
  vesselName: string
  /** IMO number of the vessel */
  vesselImo: string
  /** ISO timestamp when report was generated */
  generatedAt: string
  /** ISO timestamp when report expires */
  expiresAt: string
  /** Current generation status */
  status: 'pending' | 'completed' | 'failed'
  /** Type of report */
  type: 'compliance' | 'chronology'
  /** Credit cost for this report */
  credits: number
  /** Report data (available when status is 'completed') */
  data?: ComplianceReportData | ChronologyReportData
}

/**
 * Detailed compliance assessment data for a vessel.
 * Contains risk analysis, sanctions checks, and regulatory compliance status.
 */
export interface ComplianceReportData {
  /** Numerical risk score (0-100) */
  riskScore: number
  /** Categorical risk level based on score */
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  /** ISO timestamp of last data update */
  lastUpdated: string
  /** Sanctions screening results */
  sanctions: SanctionsCheck
  /** Regulatory compliance status */
  regulatory: RegulatoryCompliance
  /** AIS transmission analysis */
  aisIntegrity: AISIntegrity
  /** Ownership structure analysis */
  ownership: OwnershipAnalysis
  /** Executive summary of findings */
  summary: string
  /** Actionable compliance recommendations */
  recommendations: string[]
}

/**
 * Historical event data for vessel chronology reports.
 * Tracks vessel movements, activities, and significant events over time.
 */
export interface ChronologyReportData {
  /** Time period covered by the report */
  period: {
    /** ISO timestamp of period start */
    start: string
    /** ISO timestamp of period end */
    end: string
  }
  /** Chronological list of vessel events */
  events: ChronologyEvent[]
  /** Statistical summary of the period */
  statistics: ChronologyStatistics
}

/**
 * Results of sanctions screening against global watchlists.
 */
export interface SanctionsCheck {
  status: 'clear' | 'flagged' | 'blocked'
  lastChecked: string
  lists: {
    ofac: boolean
    eu: boolean
    un: boolean
    other: string[]
  }
  matches: SanctionMatch[]
}

/**
 * Details of a potential sanctions list match.
 */
export interface SanctionMatch {
  list: string
  entity: string
  matchScore: number
  addedDate: string
  reason: string
}

/**
 * Vessel regulatory compliance status across major conventions.
 */
export interface RegulatoryCompliance {
  imo: boolean
  solas: boolean
  marpol: boolean
  isps: boolean
  mlc: boolean
  certificates: Certificate[]
}

/**
 * Vessel certificate information and validity status.
 */
export interface Certificate {
  name: string
  status: 'valid' | 'expired' | 'pending'
  issueDate: string
  expiryDate: string
  issuingAuthority: string
}

/**
 * Analysis of AIS transmission integrity and anomalies.
 */
export interface AISIntegrity {
  spoofingDetected: boolean
  anomalies: AISAnomaly[]
  darkPeriods: DarkPeriod[]
  transmissionQuality: number
}

/**
 * Detected anomaly in AIS transmissions.
 */
export interface AISAnomaly {
  /** Type of AIS anomaly detected */
  type:
    | 'location_jump' // Impossible position change
    | 'speed_anomaly' // Speed exceeds vessel capability
    | 'duplicate_mmsi' // MMSI used by multiple vessels
    | 'identity_mismatch' // AIS data doesn't match vessel records
  /** ISO timestamp when anomaly was detected */
  timestamp: string
  /** Human-readable anomaly description */
  description: string
  /** Assessed severity of the anomaly */
  severity: 'low' | 'medium' | 'high'
}

/**
 * Period when vessel stopped transmitting AIS signals.
 */
export interface DarkPeriod {
  start: string
  end: string
  duration: number
  lastKnownLocation: {
    lat: number
    lon: number
  }
  nextKnownLocation: {
    lat: number
    lon: number
  }
}

/**
 * Analysis of vessel ownership structure and changes.
 */
export interface OwnershipAnalysis {
  registeredOwner: string
  beneficialOwner: string
  flag: string
  flagChanges: FlagChange[]
  ownershipChanges: OwnershipChange[]
  complexityScore: number
}

/**
 * Record of vessel flag state change.
 */
export interface FlagChange {
  date: string
  from: string
  to: string
  reason?: string
}

/**
 * Record of vessel ownership transfer.
 */
export interface OwnershipChange {
  date: string
  from: string
  to: string
  type: 'sale' | 'transfer' | 'restructure'
}

/**
 * Significant event in vessel's operational history.
 */
export interface ChronologyEvent {
  id: string
  timestamp: string
  /** Type of chronology event */
  type:
    | 'port_call' // Vessel visited a port
    | 'sts_transfer' // Ship-to-ship transfer
    | 'dark_period' // AIS turned off
    | 'ownership_change' // Vessel ownership changed
    | 'flag_change' // Vessel flag changed
    | 'incident' // Maritime incident
  /** Event location (if applicable) */
  location?: {
    /** Latitude in decimal degrees */
    lat: number
    /** Longitude in decimal degrees */
    lon: number
    /** Location name (e.g., port name) */
    name?: string
  }
  /** Event description */
  description: string
  /** Event duration in hours */
  duration?: number
  /** Other vessels involved (for STS transfers) */
  vessels?: string[]
  /** Additional event-specific details */
  details?: Record<string, unknown>
}

/**
 * Statistical summary of vessel activities over a period.
 */
export interface ChronologyStatistics {
  totalEvents: number
  portCalls: number
  stsTransfers: number
  darkPeriods: number
  totalDarkTime: number
  averagePortStay: number
  uniquePorts: number
  totalDistance: number
}

/**
 * Request parameters for generating a new report.
 */
export interface ReportRequest {
  vesselId: string
  reportType: 'compliance' | 'chronology'
  options?: {
    period?: {
      start: string
      end: string
    }
    includeHistorical?: boolean
    depth?: 'basic' | 'standard' | 'comprehensive'
  }
}

/**
 * Filter criteria for searching and listing reports.
 */
export interface ReportFilter {
  vesselId?: string
  type?: 'compliance' | 'chronology'
  status?: 'pending' | 'completed' | 'failed'
  dateFrom?: string
  dateTo?: string
}
