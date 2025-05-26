/**
 * Area monitoring API endpoints
 * Manages geographic areas for vessel monitoring, alerts, and activity analysis
 * @module api/endpoints/areas
 */

import { apiClient } from '../client'
import type { ApiResponse, PaginatedResponse, AreaSearchParams } from '../types'
import type { Area } from '@/features/areas/types'
import type { Vessel } from '@/features/vessels/types'

/**
 * Area monitoring API client for geographic zone management and vessel tracking
 */
export const areasApi = {
  /**
   * Get all areas for the current user with pagination and filtering
   * @param {AreaSearchParams} [params] - Optional search and filter parameters
   * @param {string} [params.query] - Search by area name or description
   * @param {boolean} [params.active] - Filter by active/inactive status
   * @param {string} [params.sortBy] - Sort field (name, createdAt, lastActivity)
   * @param {string} [params.sortOrder] - Sort order (asc, desc)
   * @param {number} [params.page] - Page number (1-based)
   * @param {number} [params.limit] - Results per page (max 50)
   * @returns {Promise<PaginatedResponse<Area>>} Paginated list of user's areas
   * @throws {ApiError} 401 - Not authenticated
   * @throws {ApiError} 429 - Rate limit exceeded
   * @example
   * ```typescript
   * const response = await areasApi.getAll({
   *   active: true,
   *   sortBy: 'lastActivity',
   *   sortOrder: 'desc',
   *   page: 1,
   *   limit: 20
   * })
   * const { data: areas, pagination } = response.data
   * console.log(`Showing ${areas.length} of ${pagination.total} areas`)
   * areas.forEach(area => {
   *   console.log(`${area.name}: ${area.vesselsInArea} vessels`)
   * })
   * ```
   */
  getAll: (params?: AreaSearchParams) =>
    apiClient.get<PaginatedResponse<Area>>('/areas', { params }),

  /**
   * Get detailed information for a specific area
   * @param {string} id - Area UUID
   * @returns {Promise<ApiResponse<Area>>} Complete area details
   * @throws {ApiError} 404 - Area not found
   * @throws {ApiError} 403 - Not authorized to view this area
   * @example
   * ```typescript
   * const response = await areasApi.getById('123e4567-e89b-12d3-a456-426614174000')
   * const area = response.data.data
   * console.log(`Area: ${area.name}`)
   * console.log(`Active: ${area.isActive}`)
   * console.log(`Vessels in area: ${area.vesselsInArea}`)
   * console.log(`Monthly cost: ${area.monthlyCredits} credits`)
   * ```
   */
  getById: (id: string) => apiClient.get<ApiResponse<Area>>(`/areas/${id}`),

  /**
   * Create a new area for monitoring
   * @param {Object} data - Area configuration
   * @param {string} data.name - Area name (max 100 characters)
   * @param {string} [data.description] - Area description (max 500 characters)
   * @param {Array<{lat: number; lng: number}>} data.polygon - Area boundary coordinates (3-100 points)
   * @param {string[]} data.criteria - Monitoring criteria (sanctions, dark_activity, etc.)
   * @param {Object} [data.alertPreferences] - Alert configuration
   * @param {boolean} [data.alertPreferences.email=true] - Email alerts enabled
   * @param {boolean} [data.alertPreferences.sms=false] - SMS alerts enabled
   * @returns {Promise<ApiResponse<Area>>} Created area with ID and cost info
   * @throws {ApiError} 400 - Invalid polygon or criteria
   * @throws {ApiError} 402 - Insufficient credits
   * @throws {ApiError} 409 - Area name already exists
   * @example
   * ```typescript
   * const response = await areasApi.create({
   *   name: 'Singapore Strait Monitor',
   *   description: 'Monitor vessel traffic in Singapore Strait',
   *   polygon: [
   *     { lat: 1.2, lng: 103.6 },
   *     { lat: 1.2, lng: 104.0 },
   *     { lat: 1.4, lng: 104.0 },
   *     { lat: 1.4, lng: 103.6 }
   *   ],
   *   criteria: ['sanctions', 'dark_activity'],
   *   alertPreferences: {
   *     email: true,
   *     sms: false
   *   }
   * })
   * const area = response.data.data
   * console.log(`Created area ${area.id}, monthly cost: ${area.monthlyCredits} credits`)
   * ```
   */
  create: (data: {
    name: string
    description?: string
    polygon: Array<{ lat: number; lng: number }>
    criteria: string[]
    alertPreferences?: {
      email: boolean
      sms: boolean
    }
  }) => apiClient.post<ApiResponse<Area>>('/areas', data),

  /**
   * Update an existing area
   * @param {string} id - Area UUID
   * @param {Partial<Area>} data - Fields to update
   * @returns {Promise<ApiResponse<Area>>} Updated area
   * @throws {ApiError} 400 - Invalid update data
   * @throws {ApiError} 404 - Area not found
   * @throws {ApiError} 403 - Not authorized to update this area
   * @example
   * ```typescript
   * // Update alert preferences
   * const response = await areasApi.update(areaId, {
   *   alertPreferences: {
   *     email: true,
   *     sms: true
   *   }
   * })
   * 
   * // Deactivate area temporarily
   * await areasApi.update(areaId, {
   *   isActive: false
   * })
   * ```
   */
  update: (id: string, data: Partial<Area>) =>
    apiClient.patch<ApiResponse<Area>>(`/areas/${id}`, data),

  /**
   * Delete an area permanently
   * @param {string} id - Area UUID
   * @returns {Promise<ApiResponse<{message: string}>>} Success message
   * @throws {ApiError} 404 - Area not found
   * @throws {ApiError} 403 - Not authorized to delete this area
   * @example
   * ```typescript
   * if (confirm('Delete this area? This cannot be undone.')) {
   *   await areasApi.delete(areaId)
   *   console.log('Area deleted successfully')
   *   // Remove from UI
   * }
   * ```
   */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/areas/${id}`),

  /**
   * Get vessels currently within the area boundaries
   * @param {string} areaId - Area UUID
   * @returns {Promise<ApiResponse<Array>>} List of vessels with entry time and position
   * @throws {ApiError} 404 - Area not found
   * @throws {ApiError} 403 - Not authorized to view this area
   * @example
   * ```typescript
   * const response = await areasApi.getVesselsInArea(areaId)
   * const vessels = response.data.data
   * console.log(`${vessels.length} vessels in area:`)
   * vessels.forEach(({ vessel, enteredAt, lastPosition }) => {
   *   const duration = Date.now() - new Date(enteredAt).getTime()
   *   const hours = Math.floor(duration / (1000 * 60 * 60))
   *   console.log(`${vessel.name} - ${hours}h in area`)
   *   console.log(`Last position: ${lastPosition.latitude}, ${lastPosition.longitude}`)
   * })
   * ```
   */
  getVesselsInArea: (areaId: string) =>
    apiClient.get<
      ApiResponse<
        Array<{
          vessel: Vessel
          enteredAt: string
          lastPosition: {
            latitude: number
            longitude: number
            timestamp: string
          }
        }>
      >
    >(`/areas/${areaId}/vessels`),

  /**
   * Get historical vessel activity for the area
   * @param {string} areaId - Area UUID
   * @param {Object} [params] - Query parameters
   * @param {string} [params.startDate] - Start date (ISO 8601 format)
   * @param {string} [params.endDate] - End date (ISO 8601 format)
   * @param {number} [params.limit=100] - Maximum events to return (max 1000)
   * @returns {Promise<ApiResponse<Array>>} Entry/exit events in chronological order
   * @throws {ApiError} 400 - Invalid date range (max 90 days)
   * @throws {ApiError} 404 - Area not found
   * @example
   * ```typescript
   * const response = await areasApi.getActivityHistory(areaId, {
   *   startDate: '2024-01-01T00:00:00Z',
   *   endDate: '2024-01-31T23:59:59Z',
   *   limit: 500
   * })
   * const events = response.data.data
   * 
   * // Group by vessel
   * const vesselActivity = events.reduce((acc, event) => {
   *   const vesselId = event.vessel.id
   *   if (!acc[vesselId]) acc[vesselId] = []
   *   acc[vesselId].push(event)
   *   return acc
   * }, {})
   * ```
   */
  getActivityHistory: (
    areaId: string,
    params?: {
      startDate?: string
      endDate?: string
      limit?: number
    },
  ) =>
    apiClient.get<
      ApiResponse<
        Array<{
          vessel: Vessel
          event: 'entry' | 'exit'
          timestamp: string
          position: {
            latitude: number
            longitude: number
          }
        }>
      >
    >(`/areas/${areaId}/activity`, { params }),

  /**
   * Get aggregated statistics for the area
   * @param {string} areaId - Area UUID
   * @returns {Promise<ApiResponse<Object>>} Area statistics and analytics
   * @throws {ApiError} 404 - Area not found
   * @throws {ApiError} 403 - Not authorized to view this area
   * @example
   * ```typescript
   * const response = await areasApi.getStatistics(areaId)
   * const stats = response.data.data
   * 
   * console.log(`Current vessels: ${stats.currentVessels}`)
   * console.log(`Total events: ${stats.totalEvents}`)
   * console.log(`Average dwell time: ${stats.averageDwellTime} hours`)
   * 
   * console.log('Most frequent visitors:')
   * stats.topVessels.forEach(({ vessel, visitCount }) => {
   *   console.log(`${vessel.name}: ${visitCount} visits`)
   * })
   * ```
   */
  getStatistics: (areaId: string) =>
    apiClient.get<
      ApiResponse<{
        currentVessels: number
        totalEvents: number
        averageDwellTime: number
        topVessels: Array<{
          vessel: Vessel
          visitCount: number
        }>
      }>
    >(`/areas/${areaId}/statistics`),
}
