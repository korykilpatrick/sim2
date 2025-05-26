/**
 * Vessel-related API endpoints
 * Provides vessel search, tracking, position history, and compliance monitoring
 * @module api/endpoints/vessels
 */

import { apiClient } from '../client'
import type {
  ApiResponse,
  PaginatedResponse,
  VesselSearchParams,
} from '../types'
import type { Vessel } from '@/features/vessels/types'

/**
 * Vessel API client for maritime vessel data and tracking operations
 */
export const vesselsApi = {
  /**
   * Search vessels with filters and pagination
   * @param {VesselSearchParams} params - Search parameters and filters
   * @param {string} [params.query] - Search query (name, IMO, MMSI, call sign)
   * @param {string} [params.type] - Vessel type filter
   * @param {string} [params.flag] - Flag state filter (ISO country code)
   * @param {number} [params.minDWT] - Minimum deadweight tonnage
   * @param {number} [params.maxDWT] - Maximum deadweight tonnage
   * @param {number} [params.page] - Page number (1-based)
   * @param {number} [params.limit] - Results per page (max 100)
   * @returns {Promise<PaginatedResponse<Vessel>>} Paginated vessel search results
   * @throws {ApiError} 400 - Invalid search parameters
   * @throws {ApiError} 429 - Rate limit exceeded
   * @example
   * ```typescript
   * const response = await vesselsApi.search({
   *   query: 'EVER GIVEN',
   *   type: 'Container',
   *   flag: 'PA',
   *   page: 1,
   *   limit: 20
   * })
   * const { data, pagination } = response.data
   * console.log(`Found ${pagination.total} vessels`)
   * data.forEach(vessel => {
   *   console.log(`${vessel.name} (IMO: ${vessel.imo})`)
   * })
   * ```
   */
  search: (params: VesselSearchParams) =>
    apiClient.get<PaginatedResponse<Vessel>>('/vessels/search', { params }),

  /**
   * Get detailed vessel information by ID
   * @param {string} id - Vessel UUID from the system
   * @returns {Promise<ApiResponse<Vessel>>} Complete vessel details
   * @throws {ApiError} 404 - Vessel not found
   * @throws {ApiError} 401 - Authentication required
   * @example
   * ```typescript
   * const response = await vesselsApi.getById('123e4567-e89b-12d3-a456-426614174000')
   * const vessel = response.data.data
   * console.log(`${vessel.name} - ${vessel.type}`)
   * console.log(`Position: ${vessel.position.lat}, ${vessel.position.lng}`)
   * console.log(`Last update: ${vessel.lastPositionUpdate}`)
   * ```
   */
  getById: (id: string) => apiClient.get<ApiResponse<Vessel>>(`/vessels/${id}`),

  /**
   * Get vessel by IMO number (International Maritime Organization number)
   * @param {string} imo - 7-digit IMO number (format: IMO1234567 or 1234567)
   * @returns {Promise<ApiResponse<Vessel>>} Vessel details
   * @throws {ApiError} 400 - Invalid IMO format
   * @throws {ApiError} 404 - Vessel not found
   * @example
   * ```typescript
   * // Both formats work
   * const response = await vesselsApi.getByImo('9811000')
   * // or
   * const response = await vesselsApi.getByImo('IMO9811000')
   * const vessel = response.data.data
   * console.log(`Found: ${vessel.name}`)
   * ```
   */
  getByImo: (imo: string) =>
    apiClient.get<ApiResponse<Vessel>>(`/vessels/imo/${imo}`),

  /**
   * Check if a vessel is currently being tracked
   * @param {string} vesselId - Vessel UUID
   * @returns {Promise<ApiResponse<{isTracking: boolean; trackingId?: string}>>} Tracking status
   * @throws {ApiError} 404 - Vessel not found
   * @example
   * ```typescript
   * const response = await vesselsApi.getTrackingStatus(vesselId)
   * const { isTracking, trackingId } = response.data.data
   * if (isTracking) {
   *   console.log(`Vessel is being tracked with ID: ${trackingId}`)
   * } else {
   *   console.log('Vessel is not currently tracked')
   * }
   * ```
   */
  getTrackingStatus: (vesselId: string) =>
    apiClient.get<ApiResponse<{ isTracking: boolean; trackingId?: string }>>(
      `/vessels/${vesselId}/tracking-status`,
    ),

  /**
   * Start tracking a vessel with specified criteria
   * @param {string} vesselId - Vessel UUID to track
   * @param {Object} config - Tracking configuration
   * @param {string[]} config.criteria - Monitoring criteria (e.g., ['sanctions', 'dark_activity', 'zone_entry'])
   * @param {number} config.duration - Tracking duration in days (1-365)
   * @param {boolean} [config.alerts=false] - Enable real-time alerts
   * @returns {Promise<ApiResponse<{trackingId: string; cost: number}>>} Tracking ID and credit cost
   * @throws {ApiError} 400 - Invalid configuration
   * @throws {ApiError} 402 - Insufficient credits
   * @throws {ApiError} 409 - Vessel already being tracked
   * @example
   * ```typescript
   * try {
   *   const response = await vesselsApi.startTracking(vesselId, {
   *     criteria: ['sanctions', 'dark_activity'],
   *     duration: 30,
   *     alerts: true
   *   })
   *   const { trackingId, cost } = response.data.data
   *   console.log(`Tracking started (ID: ${trackingId}), cost: ${cost} credits`)
   * } catch (error) {
   *   if (error.response?.status === 402) {
   *     console.error('Not enough credits')
   *   }
   * }
   * ```
   */
  startTracking: (
    vesselId: string,
    config: {
      criteria: string[]
      duration: number
      alerts?: boolean
    },
  ) =>
    apiClient.post<ApiResponse<{ trackingId: string; cost: number }>>(
      `/vessels/${vesselId}/track`,
      config,
    ),

  /**
   * Stop tracking a vessel
   * @param {string} vesselId - Vessel UUID
   * @param {string} trackingId - Active tracking ID to stop
   * @returns {Promise<ApiResponse<{message: string}>>} Success message
   * @throws {ApiError} 404 - Tracking not found
   * @throws {ApiError} 403 - Not authorized to stop this tracking
   * @example
   * ```typescript
   * await vesselsApi.stopTracking(vesselId, trackingId)
   * console.log('Vessel tracking stopped')
   * // Note: No credit refund for early stopping
   * ```
   */
  stopTracking: (vesselId: string, trackingId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(
      `/vessels/${vesselId}/track/${trackingId}`,
    ),

  /**
   * Get historical position data for a vessel
   * @param {string} vesselId - Vessel UUID
   * @param {Object} [params] - Query parameters
   * @param {string} [params.startDate] - Start date (ISO 8601 format)
   * @param {string} [params.endDate] - End date (ISO 8601 format)
   * @param {number} [params.limit=100] - Maximum positions to return (max 1000)
   * @returns {Promise<ApiResponse<Array>>} Array of position records
   * @throws {ApiError} 400 - Invalid date range (max 90 days)
   * @throws {ApiError} 404 - Vessel not found
   * @example
   * ```typescript
   * const response = await vesselsApi.getPositionHistory(vesselId, {
   *   startDate: '2024-01-01T00:00:00Z',
   *   endDate: '2024-01-31T23:59:59Z',
   *   limit: 500
   * })
   * const positions = response.data.data
   * positions.forEach(pos => {
   *   console.log(`${pos.timestamp}: ${pos.latitude}, ${pos.longitude} - ${pos.speed}kn`)
   * })
   * ```
   */
  getPositionHistory: (
    vesselId: string,
    params?: {
      startDate?: string
      endDate?: string
      limit?: number
    },
  ) =>
    apiClient.get<
      ApiResponse<
        Array<{
          timestamp: string
          latitude: number
          longitude: number
          speed: number
          course: number
        }>
      >
    >(`/vessels/${vesselId}/positions`, { params }),

  /**
   * Get vessel compliance and risk assessment
   * @param {string} vesselId - Vessel UUID
   * @returns {Promise<ApiResponse<Object>>} Compliance status and risk metrics
   * @throws {ApiError} 404 - Vessel not found
   * @throws {ApiError} 403 - Compliance data requires premium subscription
   * @example
   * ```typescript
   * const response = await vesselsApi.getComplianceStatus(vesselId)
   * const compliance = response.data.data
   * 
   * if (compliance.sanctioned) {
   *   console.warn('⚠️ Vessel is sanctioned!')
   * }
   * if (compliance.darkActivity) {
   *   console.warn('🌑 Dark activity detected')
   * }
   * console.log(`Risk score: ${compliance.riskScore}/100`)
   * console.log(`Last updated: ${compliance.lastUpdated}`)
   * ```
   */
  getComplianceStatus: (vesselId: string) =>
    apiClient.get<
      ApiResponse<{
        sanctioned: boolean
        darkActivity: boolean
        riskScore: number
        lastUpdated: string
      }>
    >(`/vessels/${vesselId}/compliance`),
}
