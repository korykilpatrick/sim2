/**
 * Types for PDF report generation
 */

export interface ComplianceCheck {
  id: string
  name: string
  status: 'passed' | 'failed' | 'warning'
  details: string
  timestamp: string
}

export interface SanctionRecord {
  id: string
  listName: string
  matchScore: number
  details: string
  addedDate: string
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface ReportMetadata {
  title: string
  type: string
  generatedAt: string
  requestedBy: string
  period?: {
    start: string
    end: string
  }
}

export interface VesselInfo {
  id: string
  name: string
  imo: string
  mmsi: string
  flag: string
  type: string
  status: string
}

export interface ChronologyEvent {
  id: string
  timestamp: string
  type: string
  description: string
  location?: {
    lat: number
    lng: number
  }
  details?: Record<string, unknown>
}

export interface ChronologyStatistics {
  totalEvents: number
  portCalls: number
  movements: number
  alerts: number
}