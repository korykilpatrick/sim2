/**
 * Vessel-related API endpoints
 */

import { apiClient } from '../client'
import type {
  ApiResponse,
  PaginatedResponse,
  VesselSearchParams,
} from '../types'
import type { Vessel } from '@/features/vessels/types'

export const vesselsApi = {
  /**
   * Search vessels with filters
   */
  search: (params: VesselSearchParams) =>
    apiClient.get<PaginatedResponse<Vessel>>('/vessels/search', { params }),

  /**
   * Get vessel by ID
   */
  getById: (id: string) => apiClient.get<ApiResponse<Vessel>>(`/vessels/${id}`),

  /**
   * Get vessel by IMO number
   */
  getByImo: (imo: string) =>
    apiClient.get<ApiResponse<Vessel>>(`/vessels/imo/${imo}`),

  /**
   * Get vessel tracking status
   */
  getTrackingStatus: (vesselId: string) =>
    apiClient.get<ApiResponse<{ isTracking: boolean; trackingId?: string }>>(
      `/vessels/${vesselId}/tracking-status`,
    ),

  /**
   * Start tracking a vessel
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
   */
  stopTracking: (vesselId: string, trackingId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(
      `/vessels/${vesselId}/track/${trackingId}`,
    ),

  /**
   * Get vessel position history
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
   * Get vessel compliance status
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
