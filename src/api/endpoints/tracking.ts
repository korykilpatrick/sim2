/**
 * Tracking-related API endpoints
 */

import { apiClient } from '../client'
import type { ApiResponse, PaginatedResponse } from '../types'

export interface Tracking {
  id: string
  vesselId: string
  vesselName: string
  criteria: string[]
  startDate: string
  endDate: string
  status: 'active' | 'paused' | 'expired'
  cost: number
  alertsEnabled: boolean
  createdAt: string
}

export const trackingApi = {
  /**
   * Get all active trackings for the current user
   */
  getActive: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Tracking>>('/tracking/active', { params }),

  /**
   * Get tracking by ID
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<Tracking>>(`/tracking/${id}`),

  /**
   * Pause tracking
   */
  pause: (id: string) =>
    apiClient.post<ApiResponse<Tracking>>(`/tracking/${id}/pause`),

  /**
   * Resume tracking
   */
  resume: (id: string) =>
    apiClient.post<ApiResponse<Tracking>>(`/tracking/${id}/resume`),

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
  ) => apiClient.patch<ApiResponse<Tracking>>(`/tracking/${id}`, config),

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
    apiClient.get<PaginatedResponse<Tracking>>('/tracking/history', { params }),

  /**
   * Export tracking data
   */
  export: (trackingId: string, format: 'csv' | 'pdf' | 'json') =>
    apiClient.get(`/tracking/${trackingId}/export`, {
      params: { format },
      responseType: 'blob',
    }),
}
