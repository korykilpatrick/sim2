/**
 * Represents a collection of vessels managed as a group.
 */
export interface Fleet {
  /** Unique fleet identifier */
  id: string
  /** Fleet name */
  name: string
  /** Optional fleet description */
  description?: string
  /** Number of vessels in this fleet */
  vesselCount: number
  /** Number of active alerts across all vessels */
  activeAlerts: number
  /** Total monthly credit cost for all vessel trackings */
  creditsPerMonth: number
  /** ID of the user who owns this fleet */
  ownerId: string
  /** ISO timestamp of fleet creation */
  createdAt: string
  /** ISO timestamp of last update */
  updatedAt: string
}

/**
 * Association between a fleet and a vessel.
 */
export interface FleetVessel {
  /** Unique association identifier */
  id: string
  /** ID of the fleet */
  fleetId: string
  /** ID of the vessel */
  vesselId: string
  /** ISO timestamp when vessel was added to fleet */
  addedAt: string
  /** ID of user who added the vessel */
  addedBy: string
}

/**
 * Aggregate statistics for all user fleets.
 */
export interface FleetStats {
  /** Total number of fleets */
  totalFleets: number
  /** Total vessels across all fleets */
  trackedVessels: number
  /** Total active alerts across all fleets */
  activeAlerts: number
  /** Total monthly credit cost */
  creditsPerMonth: number
}

/**
 * Input data for creating a new fleet.
 */
export interface CreateFleetInput {
  /** Fleet name (required) */
  name: string
  /** Optional fleet description */
  description?: string
}

/**
 * Input data for updating an existing fleet.
 */
export interface UpdateFleetInput {
  /** New fleet name */
  name?: string
  /** New fleet description */
  description?: string
}

/**
 * Input data for adding a vessel to a fleet.
 */
export interface AddVesselToFleetInput {
  /** Target fleet ID */
  fleetId: string
  /** Vessel ID to add */
  vesselId: string
}

/**
 * Input data for removing a vessel from a fleet.
 */
export interface RemoveVesselFromFleetInput {
  /** Target fleet ID */
  fleetId: string
  /** Vessel ID to remove */
  vesselId: string
}

/**
 * Available tabs in the fleet management interface.
 */
export type FleetTab = 'fleets' | 'vessels'

/**
 * Filter and sort options for fleet listings.
 */
export interface FleetFilters {
  /** Text search query */
  searchQuery: string
  /** Field to sort by */
  sortBy?: 'name' | 'vesselCount' | 'createdAt'
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}
