/**
 * Tracking-related API endpoints
 */

import { apiClient } from '../client'
import type { ApiResponse, PaginatedResponse } from '../types'
import type { VesselTracking } from '@/features/vessels/types'

export const trackingApi = {
  /**
   * Get all active trackings for the current user
   */
  getActive: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<VesselTracking>>('/tracking/active', { params }),

  /**
   * Get tracking by ID
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<VesselTracking>>(`/tracking/${id}`),

  /**
   * Pause tracking
   */
  pause: (id: string) =>
    apiClient.post<ApiResponse<VesselTracking>>(`/tracking/${id}/pause`),

  /**
   * Resume tracking
   */
  resume: (id: string) =>
    apiClient.post<ApiResponse<VesselTracking>>(`/tracking/${id}/resume`),

  /**
   * Update tracking configuration
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
   * Get tracking events
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
   * Acknowledge tracking event
   */
  acknowledgeEvent: (trackingId: string, eventId: string) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      `/tracking/${trackingId}/events/${eventId}/acknowledge`,
    ),

  /**
   * Get tracking history
   */
  getHistory: (params?: {
    page?: number
    limit?: number
    status?: 'active' | 'expired'
  }) =>
    apiClient.get<PaginatedResponse<VesselTracking>>('/tracking/history', { params }),

  /**
   * Export tracking data
   */
  export: (trackingId: string, format: 'csv' | 'pdf' | 'json') =>
    apiClient.get(`/tracking/${trackingId}/export`, {
      params: { format },
      responseType: 'blob',
    }),
}
