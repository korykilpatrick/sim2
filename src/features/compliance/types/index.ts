export interface ComplianceReport {
  id: string
  vesselId: string
  vesselName: string
  vesselImo: string
  generatedAt: string
  expiresAt: string
  status: 'pending' | 'completed' | 'failed'
  type: 'compliance' | 'chronology'
  credits: number
  data?: ComplianceReportData | ChronologyReportData
}

export interface ComplianceReportData {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  lastUpdated: string

  sanctions: SanctionsCheck
  regulatory: RegulatoryCompliance
  aisIntegrity: AISIntegrity
  ownership: OwnershipAnalysis

  summary: string
  recommendations: string[]
}

export interface ChronologyReportData {
  period: {
    start: string
    end: string
  }
  events: ChronologyEvent[]
  statistics: ChronologyStatistics
}

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

export interface SanctionMatch {
  list: string
  entity: string
  matchScore: number
  addedDate: string
  reason: string
}

export interface RegulatoryCompliance {
  imo: boolean
  solas: boolean
  marpol: boolean
  isps: boolean
  mlc: boolean
  certificates: Certificate[]
}

export interface Certificate {
  name: string
  status: 'valid' | 'expired' | 'pending'
  issueDate: string
  expiryDate: string
  issuingAuthority: string
}

export interface AISIntegrity {
  spoofingDetected: boolean
  anomalies: AISAnomaly[]
  darkPeriods: DarkPeriod[]
  transmissionQuality: number
}

export interface AISAnomaly {
  type:
    | 'location_jump'
    | 'speed_anomaly'
    | 'duplicate_mmsi'
    | 'identity_mismatch'
  timestamp: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

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

export interface OwnershipAnalysis {
  registeredOwner: string
  beneficialOwner: string
  flag: string
  flagChanges: FlagChange[]
  ownershipChanges: OwnershipChange[]
  complexityScore: number
}

export interface FlagChange {
  date: string
  from: string
  to: string
  reason?: string
}

export interface OwnershipChange {
  date: string
  from: string
  to: string
  type: 'sale' | 'transfer' | 'restructure'
}

export interface ChronologyEvent {
  id: string
  timestamp: string
  type:
    | 'port_call'
    | 'sts_transfer'
    | 'dark_period'
    | 'ownership_change'
    | 'flag_change'
    | 'incident'
  location?: {
    lat: number
    lon: number
    name?: string
  }
  description: string
  duration?: number
  vessels?: string[]
  details?: Record<string, any>
}

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

export interface ReportFilter {
  vesselId?: string
  type?: 'compliance' | 'chronology'
  status?: 'pending' | 'completed' | 'failed'
  dateFrom?: string
  dateTo?: string
}
