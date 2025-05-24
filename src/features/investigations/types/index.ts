/**
 * Investigation types for the Maritime Investigations Service (MIS)
 */

/**
 * Scope of investigation that can be requested
 */
export type InvestigationScope = 'vessel' | 'area' | 'event'

/**
 * Priority level for investigation requests
 */
export type InvestigationPriority = 'standard' | 'urgent' | 'critical'

/**
 * Current status of an investigation
 */
export type InvestigationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

/**
 * Types of intelligence sources that can be used in an investigation
 */
export interface IntelligenceSources {
  satelliteImagery: boolean
  osint: boolean
  sigint: boolean
  webcams: boolean
  humint: boolean
  proprietaryTools: boolean
}

/**
 * Uploaded document for an investigation
 */
export interface InvestigationDocument {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  uploadedBy: string
  category: 'evidence' | 'reference' | 'supporting'
  description?: string
}

/**
 * Request for Intelligence (RFI) form data
 */
export interface InvestigationRequest {
  /** Unique identifier for the request */
  id?: string
  /** Title of the investigation request */
  title: string
  /** Scope of the investigation */
  scope: InvestigationScope
  /** Priority level */
  priority: InvestigationPriority
  /** Detailed description of what needs to be investigated */
  description: string
  /** Specific objectives or questions to be answered */
  objectives: string[]
  /** Target vessel IMO numbers (for vessel scope) */
  vesselIds?: string[]
  /** Area of interest coordinates (for area scope) */
  areaOfInterest?: {
    type: 'polygon' | 'circle'
    coordinates: number[][]
    radius?: number // for circle type
  }
  /** Specific event details (for event scope) */
  eventDetails?: {
    date: string
    location?: {
      lat: number
      lng: number
      name?: string
    }
    involvedVessels?: string[]
    eventType: string
  }
  /** Requested intelligence sources */
  requestedSources: IntelligenceSources
  /** Desired timeframe for investigation */
  timeframe: {
    start: string
    end: string
  }
  /** Expected delivery date */
  expectedDelivery?: string
  /** Additional data or imagery requests */
  additionalRequests?: string
  /** Attached documents */
  documents?: InvestigationDocument[]
  /** Budget constraints or considerations */
  budgetNotes?: string
  /** Contact preferences */
  contactPreferences: {
    email: boolean
    phone: boolean
    platformMessage: boolean
  }
}

/**
 * Full investigation record including request and processing information
 */
export interface Investigation extends InvestigationRequest {
  /** Unique identifier */
  id: string
  /** Current status of the investigation */
  status: InvestigationStatus
  /** User who created the investigation */
  userId: string
  /** SynMax analyst assigned to the investigation */
  analystId?: string
  /** Analyst name for display */
  analystName?: string
  /** Timestamps */
  createdAt: string
  updatedAt: string
  submittedAt?: string
  completedAt?: string
  /** Progress percentage (0-100) */
  progress: number
  /** Estimated completion date */
  estimatedCompletion?: string
  /** Status updates and notes from analyst */
  updates: InvestigationUpdate[]
  /** Final report information */
  report?: {
    id: string
    fileUrl: string
    fileName: string
    fileSize: number
    generatedAt: string
  }
  /** Credits information */
  estimatedCredits?: number
  finalCredits?: number
  /** Consultation details */
  consultation?: {
    scheduled: boolean
    date?: string
    notes?: string
  }
}

/**
 * Status update from analyst during investigation
 */
export interface InvestigationUpdate {
  id: string
  timestamp: string
  message: string
  author: string
  type: 'status_change' | 'progress_update' | 'question' | 'finding'
}

/**
 * Investigation list filters
 */
export interface InvestigationFilters {
  search?: string
  status?: InvestigationStatus | 'all'
  scope?: InvestigationScope | 'all'
  priority?: InvestigationPriority | 'all'
  dateRange?: {
    start: string
    end: string
  }
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Investigation statistics for dashboard
 */
export interface InvestigationStats {
  total: number
  byStatus: Record<InvestigationStatus, number>
  byScope: Record<InvestigationScope, number>
  averageCompletionTime: number
  activeInvestigations: number
  completedThisMonth: number
}

/**
 * Template for common investigation types
 */
export interface InvestigationTemplate {
  id: string
  name: string
  scope: InvestigationScope
  description: string
  defaultObjectives: string[]
  defaultSources: IntelligenceSources
  estimatedCredits: number
  estimatedDuration: string
}
