import { apiClient } from '@/lib/api/client'
import { ApiResponse, PaginatedResponse } from '@/types/api'
import {
  Vessel,
  VesselTracking,
  VesselSearchParams,
  TrackingCriteria,
} from '../types/vessel'

/**
 * Vessel and tracking API service for maritime vessel operations.
 */
export const vesselsApi = {
  /**
   * Searches for vessels by various criteria.
   * 
   * @param params - Search parameters (name, IMO, MMSI, etc.)
   * @returns Paginated list of matching vessels
   */
  searchVessels: async (params: VesselSearchParams) => {
    const response = await apiClient.get<PaginatedResponse<Vessel>>(
      '/vessels',
      {
        params,
      },
    )
    return response.data
  },

  /**
   * Fetches detailed information for a specific vessel.
   * 
   * @param id - Vessel ID
   * @returns Complete vessel data
   */
  getVessel: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Vessel>>(`/vessels/${id}`)
    return response.data
  },

  /**
   * Fetches all active vessel trackings for the current user.
   * 
   * @returns List of user's vessel trackings
   */
  getMyTrackings: async () => {
    const response =
      await apiClient.get<PaginatedResponse<VesselTracking>>(
        '/tracking/vessels',
      )
    return response.data
  },

  /**
   * Creates a new vessel tracking subscription.
   * 
   * @param data - Tracking configuration
   * @param data.vesselId - ID of vessel to track
   * @param data.criteria - Array of monitoring criteria IDs
   * @param data.endDate - ISO date when tracking expires
   * @returns Created tracking subscription
   */
  createTracking: async (data: {
    vesselId: string
    criteria: string[]
    endDate: string
  }) => {
    const response = await apiClient.post<ApiResponse<VesselTracking>>(
      '/tracking/vessels',
      data,
    )
    return response.data
  },

  /**
   * Fetches details of a specific tracking subscription.
   * 
   * @param id - Tracking ID
   * @returns Tracking subscription details
   */
  getTracking: async (id: string) => {
    const response = await apiClient.get<ApiResponse<VesselTracking>>(
      `/tracking/vessels/${id}`,
    )
    return response.data
  },

  /**
   * Updates tracking subscription settings.
   * 
   * @param id - Tracking ID
   * @param data - Fields to update
   * @returns Updated tracking subscription
   */
  updateTracking: async (id: string, data: Partial<VesselTracking>) => {
    const response = await apiClient.patch<ApiResponse<VesselTracking>>(
      `/tracking/vessels/${id}`,
      data,
    )
    return response.data
  },

  /**
   * Pauses an active tracking subscription.
   * 
   * @param id - Tracking ID
   * @returns Updated tracking subscription
   */
  pauseTracking: async (id: string) => {
    const response = await apiClient.post<ApiResponse<VesselTracking>>(
      `/tracking/vessels/${id}/pause`,
    )
    return response.data
  },

  /**
   * Resumes a paused tracking subscription.
   * 
   * @param id - Tracking ID
   * @returns Updated tracking subscription
   */
  resumeTracking: async (id: string) => {
    const response = await apiClient.post<ApiResponse<VesselTracking>>(
      `/tracking/vessels/${id}/resume`,
    )
    return response.data
  },

  /**
   * Permanently deletes a tracking subscription.
   * 
   * @param id - Tracking ID
   * @returns Success response
   */
  deleteTracking: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(
      `/tracking/vessels/${id}`,
    )
    return response.data
  },

  /**
   * Fetches all available tracking criteria options.
   * 
   * @returns List of tracking criteria with descriptions and costs
   */
  getTrackingCriteria: async () => {
    const response =
      await apiClient.get<ApiResponse<TrackingCriteria[]>>('/tracking/criteria')
    return response.data
  },

  /**
   * Calculates credit cost for a tracking configuration.
   * 
   * @param data - Cost calculation parameters
   * @param data.vesselId - Target vessel ID
   * @param data.criteria - Selected criteria IDs
   * @param data.days - Tracking duration in days
   * @returns Total and daily credit costs
   */
  calculateCost: async (data: {
    vesselId: string
    criteria: string[]
    days: number
  }) => {
    const response = await apiClient.post<
      ApiResponse<{ totalCredits: number; creditsPerDay: number }>
    >('/tracking/calculate-cost', data)
    return response.data
  },
}
