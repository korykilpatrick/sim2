/**
 * Tracking-related API endpoints
 * Manages vessel tracking configurations, events, and historical data
 * @module api/endpoints/tracking
 */

import { apiClient } from '../client'
import type { ApiResponse, PaginatedResponse } from '../types'
import type { VesselTracking } from '@/features/vessels/types'

/**
 * Tracking API client for managing vessel tracking sessions and events
 */
export const trackingApi = {
  /**
   * Get all active trackings for the current user
   * @param {Object} [params] - Pagination parameters
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=20] - Results per page (max 100)
   * @returns {Promise<PaginatedResponse<VesselTracking>>} Active tracking list
   * @throws {ApiError} 401 - Not authenticated
   * @example
   * ```typescript
   * const response = await trackingApi.getActive({ page: 1, limit: 20 })
   * const { data: trackings, pagination } = response.data
   * console.log(`${pagination.total} active trackings`)
   * trackings.forEach(tracking => {
   *   console.log(`${tracking.vessel.name} - ${tracking.criteria.join(', ')}`)
   *   console.log(`Expires: ${new Date(tracking.endDate).toLocaleDateString()}`)
   * })
   * ```
   */
  getActive: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<VesselTracking>>('/tracking/active', {
      params,
    }),

  /**
   * Get detailed tracking information
   * @param {string} id - Tracking UUID
   * @returns {Promise<ApiResponse<VesselTracking>>} Complete tracking details
   * @throws {ApiError} 404 - Tracking not found
   * @throws {ApiError} 403 - Not authorized to view this tracking
   * @example
   * ```typescript
   * const response = await trackingApi.getById(trackingId)
   * const tracking = response.data.data
   * console.log(`Tracking: ${tracking.vessel.name}`)
   * console.log(`Status: ${tracking.status}`)
   * console.log(`Events: ${tracking.eventCount}`)
   * if (tracking.isPaused) {
   *   console.log('Tracking is currently paused')
   * }
   * ```
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<VesselTracking>>(`/tracking/${id}`),

  /**
   * Pause an active tracking (stops consuming credits)
   * @param {string} id - Tracking UUID
   * @returns {Promise<ApiResponse<VesselTracking>>} Updated tracking with paused status
   * @throws {ApiError} 404 - Tracking not found
   * @throws {ApiError} 400 - Tracking already paused or expired
   * @example
   * ```typescript
   * const response = await trackingApi.pause(trackingId)
   * console.log('Tracking paused, credit consumption stopped')
   * console.log(`Resume before: ${response.data.data.endDate}`)
   * ```
   */
  pause: (id: string) =>
    apiClient.post<ApiResponse<VesselTracking>>(`/tracking/${id}/pause`),

  /**
   * Resume a paused tracking
   * @param {string} id - Tracking UUID
   * @returns {Promise<ApiResponse<VesselTracking>>} Updated tracking with active status
   * @throws {ApiError} 404 - Tracking not found
   * @throws {ApiError} 400 - Tracking not paused or expired
   * @example
   * ```typescript
   * const response = await trackingApi.resume(trackingId)
   * console.log('Tracking resumed')
   * const tracking = response.data.data
   * console.log(`New end date: ${new Date(tracking.endDate).toLocaleDateString()}`)
   * ```
   */
  resume: (id: string) =>
    apiClient.post<ApiResponse<VesselTracking>>(`/tracking/${id}/resume`),

  /**
   * Update tracking configuration
   * @param {string} id - Tracking UUID
   * @param {Object} config - Configuration updates
   * @param {string[]} [config.criteria] - New monitoring criteria
   * @param {boolean} [config.alertsEnabled] - Enable/disable alerts
   * @param {string} [config.endDate] - New end date (can only extend, not shorten)
   * @returns {Promise<ApiResponse<VesselTracking>>} Updated tracking configuration
   * @throws {ApiError} 400 - Invalid configuration
   * @throws {ApiError} 404 - Tracking not found
   * @throws {ApiError} 402 - Insufficient credits for extension
   * @example
   * ```typescript
   * // Add new criteria and extend tracking
   * const response = await trackingApi.update(trackingId, {
   *   criteria: ['sanctions', 'dark_activity', 'zone_entry'],
   *   endDate: '2024-12-31T23:59:59Z',
   *   alertsEnabled: true
   * })
   * console.log('Tracking updated')
   * console.log(`Additional cost: ${response.data.data.additionalCost} credits`)
   * ```
   */
  update: (
    id: string,
    config: {
      criteria?: string[]
      alertsEnabled?: boolean
      endDate?: string
    },
  ) => apiClient.patch<ApiResponse<VesselTracking>>(`/tracking/${id}`, config),

  /**
   * Get tracking events with filtering
   * @param {string} trackingId - Tracking UUID
   * @param {Object} [params] - Filter parameters
   * @param {string} [params.startDate] - Filter events after date (ISO 8601)
   * @param {string} [params.endDate] - Filter events before date (ISO 8601)
   * @param {string[]} [params.eventTypes] - Filter by event types
   * @param {number} [params.limit=100] - Maximum events to return (max 1000)
   * @returns {Promise<ApiResponse<Array>>} List of tracking events
   * @throws {ApiError} 404 - Tracking not found
   * @example
   * ```typescript
   * const response = await trackingApi.getEvents(trackingId, {
   *   eventTypes: ['sanctions_match', 'dark_activity'],
   *   startDate: '2024-01-01T00:00:00Z',
   *   limit: 50
   * })
   * const events = response.data.data
   * 
   * events.forEach(event => {
   *   console.log(`${event.timestamp}: ${event.type}`)
   *   if (!event.acknowledged) {
   *     console.log('⚠️ Unacknowledged alert')
   *   }
   * })
   * ```
   */
  getEvents: (
    trackingId: string,
    params?: {
      startDate?: string
      endDate?: string
      eventTypes?: string[]
      limit?: number
    },
  ) =>
    apiClient.get<
      ApiResponse<
        Array<{
          id: string
          type: string
          timestamp: string
          data: Record<string, unknown>
          acknowledged: boolean
        }>
      >
    >(`/tracking/${trackingId}/events`, { params }),

  /**
   * Acknowledge a tracking event/alert
   * @param {string} trackingId - Tracking UUID
   * @param {string} eventId - Event UUID
   * @returns {Promise<ApiResponse<{message: string}>>} Success message
   * @throws {ApiError} 404 - Tracking or event not found
   * @throws {ApiError} 400 - Event already acknowledged
   * @example
   * ```typescript
   * await trackingApi.acknowledgeEvent(trackingId, eventId)
   * console.log('Event acknowledged')
   * // Event will no longer appear in unacknowledged alerts
   * ```
   */
  acknowledgeEvent: (trackingId: string, eventId: string) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      `/tracking/${trackingId}/events/${eventId}/acknowledge`,
    ),

  /**
   * Get tracking history including expired trackings
   * @param {Object} [params] - Filter and pagination parameters
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=20] - Results per page (max 100)
   * @param {'active'|'expired'} [params.status] - Filter by tracking status
   * @returns {Promise<PaginatedResponse<VesselTracking>>} Tracking history
   * @throws {ApiError} 401 - Not authenticated
   * @example
   * ```typescript
   * const response = await trackingApi.getHistory({
   *   status: 'expired',
   *   page: 1,
   *   limit: 50
   * })
   * const { data: trackings } = response.data
   * 
   * console.log('Expired trackings:')
   * trackings.forEach(tracking => {
   *   console.log(`${tracking.vessel.name} - ${tracking.startDate} to ${tracking.endDate}`)
   *   console.log(`Total events: ${tracking.eventCount}`)
   * })
   * ```
   */
  getHistory: (params?: {
    page?: number
    limit?: number
    status?: 'active' | 'expired'
  }) =>
    apiClient.get<PaginatedResponse<VesselTracking>>('/tracking/history', {
      params,
    }),

  /**
   * Export tracking data in various formats
   * @param {string} trackingId - Tracking UUID
   * @param {'csv'|'pdf'|'json'} format - Export format
   * @returns {Promise<Blob>} Exported data as blob
   * @throws {ApiError} 404 - Tracking not found
   * @throws {ApiError} 400 - Invalid format
   * @example
   * ```typescript
   * const response = await trackingApi.export(trackingId, 'pdf')
   * const blob = response.data
   * 
   * // Create download link
   * const url = window.URL.createObjectURL(blob)
   * const a = document.createElement('a')
   * a.href = url
   * a.download = `tracking-${trackingId}-report.pdf`
   * a.click()
   * window.URL.revokeObjectURL(url)
   * ```
   */
  export: (trackingId: string, format: 'csv' | 'pdf' | 'json') =>
    apiClient.get(`/tracking/${trackingId}/export`, {
      params: { format },
      responseType: 'blob',
    }),
}
