export interface Area {
  id: string
  name: string
  description?: string
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  sizeKm2: number
  isActive: boolean
  criteria: string[]
  alertsEnabled: boolean
  createdAt: string
  updatedAt: string
  expiresAt?: string
  creditsPerDay: number
  totalAlerts: number
}

export interface AreaMonitoring {
  id: string
  areaId: string
  area: Area
  status: 'active' | 'paused' | 'expired'
  startDate: string
  endDate: string
  updateFrequency: 3 | 6 | 12 | 24 // hours
  criteria: MonitoringCriteria[]
  vesselsInArea: number
  lastUpdate: string
  alertsToday: number
  creditsPerDay: number
  totalCreditsUsed: number
}

export interface MonitoringCriteria {
  id: string
  name: string
  description: string
  category: 'vessel_activity' | 'risk_assessment' | 'compliance' | 'environmental'
  creditsPerAlert: number
  enabled: boolean
}

export interface AreaAlert {
  id: string
  areaId: string
  monitoringId: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  vesselInfo?: {
    id: string
    name: string
    imo: string
    flag: string
  }
  location: {
    lat: number
    lng: number
  }
  timestamp: string
  isRead: boolean
  creditsUsed: number
}

export interface CreateAreaRequest {
  name: string
  description?: string
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
  criteria: string[]
  updateFrequency: 3 | 6 | 12 | 24
  duration: number // days
  alertsEnabled: boolean
}

export interface AreaStatistics {
  totalAreas: number
  activeMonitoring: number
  alertsToday: number
  creditsPerDay: number
  vesselsMonitored: number
  highRiskVessels: number
}

export interface AreaFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  hasAlerts?: boolean
  sortBy?: 'name' | 'createdAt' | 'size' | 'alerts'
  sortOrder?: 'asc' | 'desc'
}