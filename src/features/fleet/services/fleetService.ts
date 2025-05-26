import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/api/types'
import type {
  Fleet,
  FleetStats,
  CreateFleetInput,
  UpdateFleetInput,
  AddVesselToFleetInput,
  RemoveVesselFromFleetInput,
  FleetVessel,
} from '../types'

/**
 * Service for managing fleet operations
 * @module fleetService
 */
export const fleetService = {
  // Fleet CRUD operations
  
  /**
   * Retrieves all fleets for the current user
   * @returns {Promise<Fleet[]>} Array of fleet objects
   * @throws {ApiError} If the request fails
   * @example
   * ```typescript
   * const fleets = await fleetService.getFleets()
   * console.log(`You have ${fleets.length} fleets`)
   * ```
   */
  async getFleets() {
    const response = await apiClient.get<ApiResponse<Fleet[]>>('/fleets')
    return response.data.data
  },

  /**
   * Retrieves a specific fleet by ID
   * @param {string} id - The fleet ID
   * @returns {Promise<Fleet>} The fleet object
   * @throws {ApiError} If the fleet is not found or request fails
   * @example
   * ```typescript
   * const fleet = await fleetService.getFleet('fleet-123')
   * console.log(`Fleet ${fleet.name} has ${fleet.vesselCount} vessels`)
   * ```
   */
  async getFleet(id: string) {
    const response = await apiClient.get<ApiResponse<Fleet>>(`/fleets/${id}`)
    return response.data.data
  },

  /**
   * Creates a new fleet
   * @param {CreateFleetInput} data - Fleet creation data
   * @returns {Promise<Fleet>} The created fleet object
   * @throws {ApiError} If validation fails or request fails
   * @example
   * ```typescript
   * const newFleet = await fleetService.createFleet({
   *   name: 'North Atlantic Fleet',
   *   description: 'Monitoring vessels in North Atlantic',
   *   tags: ['atlantic', 'monitoring']
   * })
   * ```
   */
  async createFleet(data: CreateFleetInput) {
    const response = await apiClient.post<ApiResponse<Fleet>>('/fleets', data)
    return response.data.data
  },

  /**
   * Updates an existing fleet
   * @param {string} id - The fleet ID to update
   * @param {UpdateFleetInput} data - Fleet update data
   * @returns {Promise<Fleet>} The updated fleet object
   * @throws {ApiError} If the fleet is not found or request fails
   * @example
   * ```typescript
   * const updatedFleet = await fleetService.updateFleet('fleet-123', {
   *   name: 'Updated Fleet Name',
   *   tags: ['updated', 'monitoring']
   * })
   * ```
   */
  async updateFleet(id: string, data: UpdateFleetInput) {
    const response = await apiClient.put<ApiResponse<Fleet>>(
      `/fleets/${id}`,
      data,
    )
    return response.data.data
  },

  /**
   * Deletes a fleet
   * @param {string} id - The fleet ID to delete
   * @returns {Promise<void>}
   * @throws {ApiError} If the fleet is not found or has vessels assigned
   * @example
   * ```typescript
   * await fleetService.deleteFleet('fleet-123')
   * console.log('Fleet deleted successfully')
   * ```
   */
  async deleteFleet(id: string) {
    const response = await apiClient.delete<ApiResponse<void>>(`/fleets/${id}`)
    return response.data.data
  },

  // Fleet stats
  
  /**
   * Retrieves fleet statistics for the current user
   * @returns {Promise<FleetStats>} Fleet statistics including total fleets, vessels, and active trackings
   * @throws {ApiError} If the request fails
   * @example
   * ```typescript
   * const stats = await fleetService.getFleetStats()
   * console.log(`Total fleets: ${stats.totalFleets}`)
   * console.log(`Total vessels: ${stats.totalVessels}`)
   * ```
   */
  async getFleetStats() {
    const response =
      await apiClient.get<ApiResponse<FleetStats>>('/fleets/stats')
    return response.data.data
  },

  // Fleet vessel management
  
  /**
   * Retrieves all vessels assigned to a specific fleet
   * @param {string} fleetId - The fleet ID
   * @returns {Promise<FleetVessel[]>} Array of vessels in the fleet
   * @throws {ApiError} If the fleet is not found or request fails
   * @example
   * ```typescript
   * const vessels = await fleetService.getFleetVessels('fleet-123')
   * vessels.forEach(vessel => {
   *   console.log(`${vessel.name} - ${vessel.imo}`)
   * })
   * ```
   */
  async getFleetVessels(fleetId: string) {
    const response = await apiClient.get<ApiResponse<FleetVessel[]>>(
      `/fleets/${fleetId}/vessels`,
    )
    return response.data.data
  },

  /**
   * Adds a vessel to a fleet
   * @param {AddVesselToFleetInput} data - Contains fleetId and vesselId
   * @returns {Promise<FleetVessel>} The added vessel details
   * @throws {ApiError} If the fleet/vessel is not found or vessel is already in fleet
   * @example
   * ```typescript
   * const vessel = await fleetService.addVesselToFleet({
   *   fleetId: 'fleet-123',
   *   vesselId: 'vessel-456'
   * })
   * console.log(`Added ${vessel.name} to fleet`)
   * ```
   */
  async addVesselToFleet(data: AddVesselToFleetInput) {
    const response = await apiClient.post<ApiResponse<FleetVessel>>(
      `/fleets/${data.fleetId}/vessels`,
      {
        vesselId: data.vesselId,
      },
    )
    return response.data.data
  },

  /**
   * Removes a vessel from a fleet
   * @param {RemoveVesselFromFleetInput} data - Contains fleetId and vesselId
   * @returns {Promise<void>}
   * @throws {ApiError} If the fleet/vessel is not found or vessel is not in fleet
   * @example
   * ```typescript
   * await fleetService.removeVesselFromFleet({
   *   fleetId: 'fleet-123',
   *   vesselId: 'vessel-456'
   * })
   * console.log('Vessel removed from fleet')
   * ```
   */
  async removeVesselFromFleet(data: RemoveVesselFromFleetInput) {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/fleets/${data.fleetId}/vessels/${data.vesselId}`,
    )
    return response.data.data
  },

  // Search operations
  
  /**
   * Searches for fleets by name or description
   * @param {string} query - Search query string
   * @returns {Promise<Fleet[]>} Array of matching fleets
   * @throws {ApiError} If the request fails
   * @example
   * ```typescript
   * const results = await fleetService.searchFleets('atlantic')
   * console.log(`Found ${results.length} matching fleets`)
   * ```
   */
  async searchFleets(query: string) {
    const response = await apiClient.get<ApiResponse<Fleet[]>>(
      '/fleets/search',
      {
        params: { q: query },
      },
    )
    return response.data.data
  },

  /**
   * Searches for vessels within a specific fleet
   * @param {string} fleetId - The fleet ID to search within
   * @param {string} query - Search query string (vessel name, IMO, MMSI)
   * @returns {Promise<FleetVessel[]>} Array of matching vessels in the fleet
   * @throws {ApiError} If the fleet is not found or request fails
   * @example
   * ```typescript
   * const vessels = await fleetService.searchFleetVessels('fleet-123', 'cargo')
   * console.log(`Found ${vessels.length} cargo vessels in fleet`)
   * ```
   */
  async searchFleetVessels(fleetId: string, query: string) {
    const response = await apiClient.get<ApiResponse<FleetVessel[]>>(
      `/fleets/${fleetId}/vessels/search`,
      {
        params: { q: query },
      },
    )
    return response.data.data
  },
}
