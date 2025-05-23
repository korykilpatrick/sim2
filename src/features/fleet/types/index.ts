export interface Fleet {
  id: string
  name: string
  description?: string
  vesselCount: number
  activeAlerts: number
  creditsPerMonth: number
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface FleetVessel {
  id: string
  fleetId: string
  vesselId: string
  addedAt: string
  addedBy: string
}

export interface FleetStats {
  totalFleets: number
  trackedVessels: number
  activeAlerts: number
  creditsPerMonth: number
}

export interface CreateFleetInput {
  name: string
  description?: string
}

export interface UpdateFleetInput {
  name?: string
  description?: string
}

export interface AddVesselToFleetInput {
  fleetId: string
  vesselId: string
}

export interface RemoveVesselFromFleetInput {
  fleetId: string
  vesselId: string
}

export type FleetTab = 'fleets' | 'vessels'

export interface FleetFilters {
  searchQuery: string
  sortBy?: 'name' | 'vesselCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}
