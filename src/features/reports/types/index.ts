/**
 * Comprehensive compliance report for a vessel containing risk assessments,
 * regulatory compliance status, and operational history analysis.
 */
export interface ComplianceReport {
  /** Unique identifier for the report */
  id: string
  /** ID of the vessel this report is for */
  vesselId: string
  /** Basic vessel information */
  vessel: {
    /** Unique vessel identifier */
    id: string
    /** Vessel name */
    name: string
    /** International Maritime Organization number */
    imo: string
    /** Flag state of the vessel */
    flag: string
    /** Type of vessel (e.g., cargo, tanker, passenger) */
    type: string
  }
  /** Date when the report was generated (ISO 8601 format) */
  reportDate: string
  /** Current processing status of the report */
  status: 'pending' | 'processing' | 'completed' | 'failed'
  /** Sanctions screening results and watchlist matches */
  sanctionsScreening: {
    /** Overall sanctions status */
    status: 'clear' | 'flagged' | 'blocked'
    /** List of matched sanctions lists or watchlists */
    matchedLists: string[]
    /** Timestamp of last sanctions check (ISO 8601 format) */
    lastChecked: string
  }
  /** International regulatory compliance status */
  regulatoryCompliance: {
    /** Whether vessel complies with IMO regulations */
    imoCompliant: boolean
    /** Whether vessel complies with SOLAS (Safety of Life at Sea) */
    solasCompliant: boolean
    /** Whether vessel complies with MARPOL (pollution prevention) */
    marpolCompliant: boolean
    /** List of specific compliance issues found */
    issues: string[]
  }
  /** AIS (Automatic Identification System) integrity analysis */
  aisIntegrity: {
    /** Whether AIS spoofing has been detected */
    spoofingDetected: boolean
    /** Number of periods where AIS was turned off */
    darkPeriodsCount: number
    /** Number of detected AIS manipulation events */
    manipulationEvents: number
  }
  /** Vessel ownership information and risk assessment */
  ownership: {
    /** Name of the registered owner */
    registeredOwner: string
    /** Name of the beneficial owner if known */
    beneficialOwner: string
    /** Sanctions risk level for ownership structure */
    sanctionsRisk: 'low' | 'medium' | 'high'
  }
  /** Historical operational patterns and risk indicators */
  operationalHistory: {
    /** Number of voyages with AIS turned off */
    darkVoyages: number
    /** Number of ship-to-ship transfers */
    stsTransfers: number
    /** Number of calls to high-risk ports */
    highRiskPortCalls: number
  }
  /** Port State Control inspection history */
  portStateControl: {
    /** Number of vessel detentions */
    detentions: number
    /** Number of deficiencies found during inspections */
    deficiencies: number
    /** Date of last PSC inspection (ISO 8601 format) */
    lastInspection: string
  }
  /** Overall risk assessment summary */
  riskAssessment: {
    /** Numerical risk score (0-100) */
    overallScore: number
    /** Categorical risk level */
    level: 'low' | 'medium' | 'high' | 'critical'
    /** Detailed risk factors contributing to the assessment */
    factors: Array<{
      /** Risk category (e.g., sanctions, operations, compliance) */
      category: string
      /** Severity level of this risk factor */
      severity: string
      /** Detailed description of the risk */
      description: string
    }>
  }
  /** Number of credits consumed to generate this report */
  credits: number
  /** Timestamp when report was generated (ISO 8601 format) */
  generatedAt: string
  /** Timestamp when report expires (ISO 8601 format) */
  expiresAt: string
}

/**
 * Chronological report detailing a vessel's historical events, movements,
 * and activities over a specified time period.
 */
export interface ChronologyReport {
  /** Unique identifier for the report */
  id: string
  /** ID of the vessel this report is for */
  vesselId: string
  /** Basic vessel information */
  vessel: {
    /** Unique vessel identifier */
    id: string
    /** Vessel name */
    name: string
    /** International Maritime Organization number */
    imo: string
    /** Flag state of the vessel */
    flag: string
  }
  /** Date when the report was generated (ISO 8601 format) */
  reportDate: string
  /** Current processing status of the report */
  status: 'pending' | 'processing' | 'completed' | 'failed'
  /** Time period covered by this report */
  timeRange: {
    /** Start date of the report period (ISO 8601 format) */
    start: string
    /** End date of the report period (ISO 8601 format) */
    end: string
    /** Total number of days covered */
    days: number
  }
  /** Array of chronological events during the time period */
  events: ChronologyEvent[]
  /** Summary statistics of events in the report */
  summary: {
    /** Total number of events recorded */
    totalEvents: number
    /** Number of port calls made */
    portCalls: number
    /** Number of ship-to-ship transfers */
    stsTransfers: number
    /** Number of dark periods (AIS off) */
    darkPeriods: number
    /** Number of flag state changes */
    flagChanges: number
    /** Number of ownership changes */
    ownershipChanges: number
  }
  /** Number of credits consumed to generate this report */
  credits: number
  /** Timestamp when report was generated (ISO 8601 format) */
  generatedAt: string
}

/**
 * Individual event in a vessel's chronological history with detailed
 * information about the event type, location, and related entities.
 */
export interface ChronologyEvent {
  /** Unique identifier for the event */
  id: string
  /** When the event occurred (ISO 8601 format) */
  timestamp: string
  /** Type of event that occurred */
  type: 'port_call' | 'sts_transfer' | 'dark_period' | 'spoofing' | 'flag_change' | 'ownership_change' | 'bunkering' | 'risk_change'
  /** Brief title describing the event */
  title: string
  /** Detailed description of what happened */
  description: string
  /** Geographic location where the event occurred */
  location?: {
    /** Latitude coordinate */
    lat: number
    /** Longitude coordinate */
    lng: number
    /** Human-readable location name */
    name?: string
  }
  /** Duration of the event in hours (for applicable event types) */
  duration?: number
  /** Information about another vessel involved in the event */
  relatedVessel?: {
    /** Related vessel's unique identifier */
    id: string
    /** Related vessel's name */
    name: string
    /** Related vessel's IMO number */
    imo: string
  }
  /** Risk level associated with this event */
  riskLevel?: 'low' | 'medium' | 'high'
  /** Additional event-specific details */
  details?: Record<string, unknown>
}

/**
 * Request parameters for generating a new vessel report with optional
 * configuration for time range, detail level, and output format.
 */
export interface ReportRequest {
  /** ID of the vessel to generate report for */
  vesselId: string
  /** Type of report to generate */
  reportType: 'compliance' | 'chronology'
  /** Optional configuration for the report */
  options?: {
    /** Time range for chronology reports */
    timeRange?: {
      /** Start date for the report (ISO 8601 format) */
      start: string
      /** End date for the report (ISO 8601 format) */
      end: string
    }
    /** Whether to include detailed information */
    includeDetails?: boolean
    /** Desired output format for the report */
    format?: 'pdf' | 'excel' | 'json'
  }
}

/**
 * Filter and sorting options for querying and displaying report lists
 * in the user interface.
 */
export interface ReportFilters {
  /** Text search query for vessel names or IMO numbers */
  search?: string
  /** Filter by report processing status */
  status?: 'all' | 'pending' | 'completed' | 'failed'
  /** Filter by report type */
  reportType?: 'compliance' | 'chronology' | 'all'
  /** Filter by report generation date range */
  dateRange?: {
    /** Start date for filtering (ISO 8601 format) */
    start: string
    /** End date for filtering (ISO 8601 format) */
    end: string
  }
  /** Field to sort results by */
  sortBy?: 'createdAt' | 'vesselName' | 'status'
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Aggregated statistics about report generation activity and system usage
 * for displaying in dashboards and analytics views.
 */
export interface ReportStatistics {
  /** Total number of reports in the system */
  totalReports: number
  /** Number of reports completed today */
  completedToday: number
  /** Number of reports currently being processed */
  pendingReports: number
  /** Total credits consumed today */
  creditsUsedToday: number
  /** Average time to process a report in seconds */
  averageProcessingTime: number
  /** Most frequently generated report type */
  popularReportType: 'compliance' | 'chronology'
}

/**
 * Template definition for available report types, including metadata
 * about credits required and features included.
 */
export interface ReportTemplate {
  /** Unique identifier for the template */
  id: string
  /** Display name of the report template */
  name: string
  /** Type of report this template generates */
  type: 'compliance' | 'chronology'
  /** Detailed description of what the report includes */
  description: string
  /** Base number of credits required to generate this report */
  baseCredits: number
  /** Estimated processing time (e.g., "2-5 minutes") */
  processingTime: string
  /** List of features included in this report type */
  features: string[]
}

/**
 * Request parameters for generating multiple reports in a single batch
 * operation for efficiency and bulk processing.
 */
export interface BulkReportRequest {
  /** Array of vessel IDs to generate reports for */
  vesselIds: string[]
  /** Type of report to generate for all vessels */
  reportType: 'compliance' | 'chronology'
  /** Optional configuration applying to all reports in the batch */
  options?: ReportRequest['options']
}