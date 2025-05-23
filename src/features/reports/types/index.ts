export interface ComplianceReport {
  id: string
  vesselId: string
  vessel: {
    id: string
    name: string
    imo: string
    flag: string
    type: string
  }
  reportDate: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  sanctionsScreening: {
    status: 'clear' | 'flagged' | 'blocked'
    matchedLists: string[]
    lastChecked: string
  }
  regulatoryCompliance: {
    imoCompliant: boolean
    solasCompliant: boolean
    marpolCompliant: boolean
    issues: string[]
  }
  aisIntegrity: {
    spoofingDetected: boolean
    darkPeriodsCount: number
    manipulationEvents: number
  }
  ownership: {
    registeredOwner: string
    beneficialOwner: string
    sanctionsRisk: 'low' | 'medium' | 'high'
  }
  operationalHistory: {
    darkVoyages: number
    stsTransfers: number
    highRiskPortCalls: number
  }
  portStateControl: {
    detentions: number
    deficiencies: number
    lastInspection: string
  }
  riskAssessment: {
    overallScore: number
    level: 'low' | 'medium' | 'high' | 'critical'
    factors: Array<{
      category: string
      severity: string
      description: string
    }>
  }
  credits: number
  generatedAt: string
  expiresAt: string
}

export interface ChronologyReport {
  id: string
  vesselId: string
  vessel: {
    id: string
    name: string
    imo: string
    flag: string
  }
  reportDate: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  timeRange: {
    start: string
    end: string
    days: number
  }
  events: ChronologyEvent[]
  summary: {
    totalEvents: number
    portCalls: number
    stsTransfers: number
    darkPeriods: number
    flagChanges: number
    ownershipChanges: number
  }
  credits: number
  generatedAt: string
}

export interface ChronologyEvent {
  id: string
  timestamp: string
  type: 'port_call' | 'sts_transfer' | 'dark_period' | 'spoofing' | 'flag_change' | 'ownership_change' | 'bunkering' | 'risk_change'
  title: string
  description: string
  location?: {
    lat: number
    lng: number
    name?: string
  }
  duration?: number // in hours
  relatedVessel?: {
    id: string
    name: string
    imo: string
  }
  riskLevel?: 'low' | 'medium' | 'high'
  details?: Record<string, any>
}

export interface ReportRequest {
  vesselId: string
  reportType: 'compliance' | 'chronology'
  options?: {
    timeRange?: {
      start: string
      end: string
    }
    includeDetails?: boolean
    format?: 'pdf' | 'excel' | 'json'
  }
}

export interface ReportFilters {
  search?: string
  status?: 'all' | 'pending' | 'completed' | 'failed'
  reportType?: 'compliance' | 'chronology' | 'all'
  dateRange?: {
    start: string
    end: string
  }
  sortBy?: 'createdAt' | 'vesselName' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface ReportStatistics {
  totalReports: number
  completedToday: number
  pendingReports: number
  creditsUsedToday: number
  averageProcessingTime: number // in seconds
  popularReportType: 'compliance' | 'chronology'
}

export interface ReportTemplate {
  id: string
  name: string
  type: 'compliance' | 'chronology'
  description: string
  baseCredits: number
  processingTime: string // e.g., "2-5 minutes"
  features: string[]
}

export interface BulkReportRequest {
  vesselIds: string[]
  reportType: 'compliance' | 'chronology'
  options?: ReportRequest['options']
}