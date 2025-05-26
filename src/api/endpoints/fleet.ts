/**
 * Fleet management API endpoints
 * Provides fleet creation, vessel management, and fleet-wide monitoring capabilities
 * @module api/endpoints/fleet
 */

import { apiClient } from '../client'
import type { ApiResponse, PaginatedResponse } from '../types'
import type { Fleet } from '@/features/fleet/types'
import type { Vessel } from '@/features/vessels/types'

/**
 * Fleet API client for managing groups of vessels
 */
export const fleetsApi = {
  /**
   * Get all fleets owned by the current user
   * @param {Object} [params] - Pagination parameters
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=20] - Results per page (max 100)
   * @returns {Promise<PaginatedResponse<Fleet>>} Paginated fleet list
   * @throws {ApiError} 401 - Not authenticated
   * @example
   * ```typescript
   * const response = await fleetsApi.getAll({ page: 1, limit: 10 })
   * const { data: fleets, pagination } = response.data
   * console.log(`Total fleets: ${pagination.total}`)
   * fleets.forEach(fleet => {
   *   console.log(`${fleet.name}: ${fleet.vesselCount} vessels`)
   * })
   * ```
   */
  getAll: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Fleet>>('/fleets', { params }),

  /**
   * Get detailed fleet information including vessel list
   * @param {string} id - Fleet UUID
   * @returns {Promise<ApiResponse<Fleet>>} Complete fleet details
   * @throws {ApiError} 404 - Fleet not found
   * @throws {ApiError} 403 - Not authorized to view this fleet
   * @example
   * ```typescript
   * const response = await fleetsApi.getById('123e4567-e89b-12d3-a456-426614174000')
   * const fleet = response.data.data
   * console.log(`Fleet: ${fleet.name}`)
   * console.log(`Vessels: ${fleet.vesselCount}`)
   * console.log(`Created: ${new Date(fleet.createdAt).toLocaleDateString()}`)
   * ```
   */
  getById: (id: string) => apiClient.get<ApiResponse<Fleet>>(`/fleets/${id}`),

  /**
   * Create a new fleet with initial vessels
   * @param {Object} data - Fleet creation data
   * @param {string} data.name - Fleet name (max 100 characters)
   * @param {string} [data.description] - Fleet description (max 500 characters)
   * @param {string[]} data.vesselIds - Initial vessel UUIDs to add (max 100)
   * @returns {Promise<ApiResponse<Fleet>>} Created fleet with vessels
   * @throws {ApiError} 400 - Invalid data or vessel IDs
   * @throws {ApiError} 404 - One or more vessels not found
   * @throws {ApiError} 409 - Fleet name already exists
   * @example
   * ```typescript
   * const response = await fleetsApi.create({
   *   name: 'Pacific Container Fleet',
   *   description: 'Container vessels operating in Pacific routes',
   *   vesselIds: ['vessel-1-id', 'vessel-2-id', 'vessel-3-id']
   * })
   * const fleet = response.data.data
   * console.log(`Created fleet ${fleet.id} with ${fleet.vesselCount} vessels`)
   * ```
   */
  create: (data: { name: string; description?: string; vesselIds: string[] }) =>
    apiClient.post<ApiResponse<Fleet>>('/fleets', data),

  /**
   * Update fleet information
   * @param {string} id - Fleet UUID
   * @param {Partial<Fleet>} data - Fields to update
   * @returns {Promise<ApiResponse<Fleet>>} Updated fleet
   * @throws {ApiError} 400 - Invalid update data
   * @throws {ApiError} 404 - Fleet not found
   * @throws {ApiError} 403 - Not authorized to update this fleet
   * @example
   * ```typescript
   * // Update fleet name and description
   * const response = await fleetsApi.update(fleetId, {
   *   name: 'Atlantic Container Fleet',
   *   description: 'Updated to include Atlantic routes'
   * })
   * 
   * // Add tags
   * await fleetsApi.update(fleetId, {
   *   tags: ['container', 'atlantic', 'priority']
   * })
   * ```
   */
  update: (id: string, data: Partial<Fleet>) =>
    apiClient.patch<ApiResponse<Fleet>>(`/fleets/${id}`, data),

  /**
   * Delete a fleet (vessels are not deleted, only unassigned)
   * @param {string} id - Fleet UUID
   * @returns {Promise<ApiResponse<{message: string}>>} Success message
   * @throws {ApiError} 404 - Fleet not found
   * @throws {ApiError} 403 - Not authorized to delete this fleet
   * @example
   * ```typescript
   * if (confirm('Delete this fleet? Vessels will not be deleted.')) {
   *   await fleetsApi.delete(fleetId)
   *   console.log('Fleet deleted successfully')
   *   // Redirect to fleet list
   * }
   * ```
   */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/fleets/${id}`),

  /**
   * Add vessels to an existing fleet
   * @param {string} fleetId - Fleet UUID
   * @param {string[]} vesselIds - Vessel UUIDs to add (max 100 per request)
   * @returns {Promise<ApiResponse<Fleet>>} Updated fleet with new vessels
   * @throws {ApiError} 400 - Invalid vessel IDs or too many vessels
   * @throws {ApiError} 404 - Fleet or vessels not found
   * @throws {ApiError} 409 - Some vessels already in fleet
   * @example
   * ```typescript
   * const response = await fleetsApi.addVessels(fleetId, [
   *   'new-vessel-1',
   *   'new-vessel-2'
   * ])
   * const fleet = response.data.data
   * console.log(`Fleet now has ${fleet.vesselCount} vessels`)
   * ```
   */
  addVessels: (fleetId: string, vesselIds: string[]) =>
    apiClient.post<ApiResponse<Fleet>>(`/fleets/${fleetId}/vessels`, {
      vesselIds,
    }),

  /**
   * Remove vessels from a fleet
   * @param {string} fleetId - Fleet UUID
   * @param {string[]} vesselIds - Vessel UUIDs to remove
   * @returns {Promise<ApiResponse<Fleet>>} Updated fleet without removed vessels
   * @throws {ApiError} 400 - Invalid vessel IDs
   * @throws {ApiError} 404 - Fleet not found
   * @throws {ApiError} 409 - Some vessels not in fleet
   * @example
   * ```typescript
   * // Remove selected vessels
   * const response = await fleetsApi.removeVessels(fleetId, selectedVesselIds)
   * const fleet = response.data.data
   * console.log(`Removed ${selectedVesselIds.length} vessels`)
   * console.log(`Fleet now has ${fleet.vesselCount} vessels`)
   * ```
   */
  removeVessels: (fleetId: string, vesselIds: string[]) =>
    apiClient.delete<ApiResponse<Fleet>>(`/fleets/${fleetId}/vessels`, {
      data: { vesselIds },
    }),

  /**
   * Get detailed vessel information for all fleet vessels
   * @param {string} fleetId - Fleet UUID
   * @returns {Promise<ApiResponse<Vessel[]>>} Array of vessel details
   * @throws {ApiError} 404 - Fleet not found
   * @throws {ApiError} 403 - Not authorized to view this fleet
   * @example
   * ```typescript
   * const response = await fleetsApi.getVessels(fleetId)
   * const vessels = response.data.data
   * 
   * // Group vessels by type
   * const vesselsByType = vessels.reduce((acc, vessel) => {
   *   if (!acc[vessel.type]) acc[vessel.type] = []
   *   acc[vessel.type].push(vessel)
   *   return acc
   * }, {})
   * 
   * Object.entries(vesselsByType).forEach(([type, vessels]) => {
   *   console.log(`${type}: ${vessels.length} vessels`)
   * })
   * ```
   */
  getVessels: (fleetId: string) =>
    apiClient.get<ApiResponse<Vessel[]>>(`/fleets/${fleetId}/vessels`),

  /**
   * Get aggregated statistics for the fleet
   * @param {string} fleetId - Fleet UUID
   * @returns {Promise<ApiResponse<Object>>} Fleet statistics and metrics
   * @throws {ApiError} 404 - Fleet not found
   * @throws {ApiError} 403 - Not authorized to view this fleet
   * @example
   * ```typescript
   * const response = await fleetsApi.getStatistics(fleetId)
   * const stats = response.data.data
   * 
   * console.log('Fleet Overview:')
   * console.log(`Total vessels: ${stats.totalVessels}`)
   * console.log(`Active vessels: ${stats.activeVessels}`)
   * console.log(`At sea: ${stats.vesselsAtSea}`)
   * console.log(`In port: ${stats.vesselsInPort}`)
   * console.log(`Average risk score: ${stats.averageRiskScore.toFixed(1)}/100`)
   * console.log(`Compliance rate: ${(stats.complianceRate * 100).toFixed(1)}%`)
   * ```
   */
  getStatistics: (fleetId: string) =>
    apiClient.get<
      ApiResponse<{
        totalVessels: number
        activeVessels: number
        averageRiskScore: number
        complianceRate: number
        vesselsAtSea: number
        vesselsInPort: number
      }>
    >(`/fleets/${fleetId}/statistics`),

  /**
   * Configure alert settings for all vessels in the fleet
   * @param {string} fleetId - Fleet UUID
   * @param {Object} config - Alert configuration
   * @param {string[]} config.criteria - Alert criteria (sanctions, dark_activity, zone_entry, etc.)
   * @param {string[]} config.recipients - Email addresses for alerts
   * @param {boolean} config.enabled - Enable/disable alerts
   * @returns {Promise<ApiResponse<{message: string}>>} Success message
   * @throws {ApiError} 400 - Invalid configuration
   * @throws {ApiError} 404 - Fleet not found
   * @example
   * ```typescript
   * // Enable sanctions and dark activity alerts
   * await fleetsApi.configureAlerts(fleetId, {
   *   criteria: ['sanctions', 'dark_activity'],
   *   recipients: ['ops@company.com', 'compliance@company.com'],
   *   enabled: true
   * })
   * console.log('Fleet alerts configured')
   * 
   * // Disable all alerts
   * await fleetsApi.configureAlerts(fleetId, {
   *   criteria: [],
   *   recipients: [],
   *   enabled: false
   * })
   * ```
   */
  configureAlerts: (
    fleetId: string,
    config: {
      criteria: string[]
      recipients: string[]
      enabled: boolean
    },
  ) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      `/fleets/${fleetId}/alerts`,
      config,
    ),

  /**
   * Start tracking all vessels in the fleet with same criteria
   * @param {string} fleetId - Fleet UUID
   * @param {Object} config - Tracking configuration
   * @param {string[]} config.criteria - Monitoring criteria for all vessels
   * @param {number} config.duration - Tracking duration in days (1-365)
   * @returns {Promise<ApiResponse<Object>>} Tracking IDs and total cost
   * @throws {ApiError} 400 - Invalid configuration
   * @throws {ApiError} 402 - Insufficient credits for all vessels
   * @throws {ApiError} 409 - Some vessels already being tracked
   * @example
   * ```typescript
   * try {
   *   const response = await fleetsApi.trackAll(fleetId, {
   *     criteria: ['sanctions', 'dark_activity', 'zone_entry'],
   *     duration: 30
   *   })
   *   const { trackingIds, totalCost } = response.data.data
   *   console.log(`Started tracking ${trackingIds.length} vessels`)
   *   console.log(`Total cost: ${totalCost} credits`)
   * } catch (error) {
   *   if (error.response?.status === 402) {
   *     console.error(`Need ${error.response.data.requiredCredits} credits`)
   *   }
   * }
   * ```
   */
  trackAll: (
    fleetId: string,
    config: {
      criteria: string[]
      duration: number
    },
  ) =>
    apiClient.post<
      ApiResponse<{
        trackingIds: string[]
        totalCost: number
      }>
    >(`/fleets/${fleetId}/track-all`, config),
}
