/**
 * WebSocket types for server-side implementation
 */

export interface VesselPosition {
  vesselId: string
  timestamp: string
  position: {
    lat: number
    lng: number
  }
  heading: number
  speed: number
  status: string
}

export interface AreaAlert {
  id: string
  areaId: string
  areaName: string
  type: 'vessel_entered' | 'vessel_exited' | 'threshold_exceeded' | 'unusual_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  data?: Record<string, unknown>
}