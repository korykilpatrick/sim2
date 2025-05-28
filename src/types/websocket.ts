export interface WebSocketEvents {
  // Connection events
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
  reconnect: (attempt: number) => void
  reconnect_attempt: (attempt: number) => void
  reconnect_error: (error: Error) => void
  reconnect_failed: () => void

  // Authentication events
  authenticated: (data: { userId: string; success: boolean }) => void
  unauthorized: (data: { message: string }) => void

  // Vessel tracking events
  vessel_position_update: (data: VesselPositionUpdate) => void
  vessel_status_change: (data: VesselStatusChange) => void
  vessel_tracking_started: (data: {
    vesselId: string
    trackingId: string
  }) => void
  vessel_tracking_stopped: (data: {
    vesselId: string
    trackingId: string
  }) => void

  // Area monitoring events
  area_alert: (data: AreaAlert) => void
  area_vessel_entered: (data: AreaVesselEvent) => void
  area_vessel_exited: (data: AreaVesselEvent) => void
  area_monitoring_started: (data: { areaId: string }) => void
  area_monitoring_stopped: (data: { areaId: string }) => void

  // Alert events
  alert_created: (data: Alert) => void
  alert_updated: (data: Alert) => void
  alert_dismissed: (data: { alertId: string }) => void

  // Credit events
  credit_balance_updated: (data: { balance: number; change: number }) => void
  credit_low_balance: (data: { balance: number; threshold: number }) => void

  // Room events
  room_joined: (data: { room: string; type: 'vessel' | 'area' }) => void
  room_left: (data: { room: string; type: 'vessel' | 'area' }) => void
  room_join_error: (data: { room: string; error: string }) => void

  // System events
  server_message: (data: {
    message: string
    type: 'info' | 'warning' | 'error'
  }) => void
  maintenance_mode: (data: { active: boolean; message?: string }) => void
}

export interface VesselPositionUpdate {
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

export interface VesselStatusChange {
  vesselId: string
  previousStatus: string
  newStatus: string
  timestamp: string
  reason?: string
}

export interface AreaAlert {
  id: string
  areaId: string
  areaName: string
  type:
    | 'vessel_entered'
    | 'vessel_exited'
    | 'threshold_exceeded'
    | 'unusual_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  data?: Record<string, unknown>
}

export interface AreaVesselEvent {
  areaId: string
  areaName: string
  vesselId: string
  vesselName: string
  timestamp: string
  position: {
    lat: number
    lng: number
  }
}

export interface Alert {
  id: string
  type: 'vessel' | 'area' | 'compliance' | 'system'
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  timestamp: string
  read: boolean
  actionUrl?: string
  data?: Record<string, unknown>
}

export type WebSocketStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error'

export interface WebSocketState {
  status: WebSocketStatus
  isAuthenticated: boolean
  error?: string
  reconnectAttempts: number
}

export interface RoomSubscription {
  room: string
  type: 'vessel' | 'area' | 'global'
  joinedAt: string
}

export interface WebSocketEmitEvents {
  // Authentication
  authenticate: (token: string) => void

  // Vessel tracking
  join_vessel_room: (vesselId: string) => void
  leave_vessel_room: (vesselId: string) => void

  // Area monitoring
  join_area_room: (areaId: string) => void
  leave_area_room: (areaId: string) => void

  // Alert management
  mark_alert_read: (alertId: string) => void
  dismiss_alert: (alertId: string) => void
}
