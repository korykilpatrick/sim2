export interface Vessel {
  id: string
  imo: string
  mmsi: string
  name: string
  flag: string
  type: string
  status: 'active' | 'inactive' | 'dark' | 'distress'
  lastPosition: {
    lat: number
    lng: number
    timestamp: string
    speed: number
    course: number
  }
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  owner?: string
  destination?: string
  eta?: string
  draught?: number
  length?: number
  width?: number
}

export interface VesselTracking {
  id: string
  vesselId: string
  vessel: Vessel
  criteria: TrackingCriteria[]
  status: 'active' | 'paused' | 'expired'
  startDate: string
  endDate: string
  alertsCount: number
  creditsPerDay: number
  userId: string
}

export interface TrackingCriteria {
  id: string
  type: 
    | 'ais_reporting'
    | 'dark_event'
    | 'spoofing'
    | 'sts_event'
    | 'port_call'
    | 'distress'
    | 'ownership_change'
    | 'flag_change'
    | 'geofence'
    | 'risk_change'
    | 'high_risk_area'
  name: string
  description: string
  enabled: boolean
  config?: any
}

export interface VesselAlert {
  id: string
  trackingId: string
  vesselId: string
  type: TrackingCriteria['type']
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  timestamp: string
  data?: any
  acknowledged: boolean
}

export interface VesselSearchParams {
  query?: string
  imo?: string
  mmsi?: string
  name?: string
  flag?: string
  type?: string
  riskLevel?: Vessel['riskLevel']
}