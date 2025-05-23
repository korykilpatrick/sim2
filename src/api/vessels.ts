import { apiClient } from './client'
import { ApiResponse, PaginatedResponse } from '@/types/api'
import { Vessel, VesselTracking, VesselSearchParams, TrackingCriteria } from '@/types/vessel'

export const vesselsApi = {
  // Vessel endpoints
  searchVessels: async (params: VesselSearchParams) => {
    const response = await apiClient.get<PaginatedResponse<Vessel>>('/vessels', {
      params,
    })
    return response.data
  },

  getVessel: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Vessel>>(`/vessels/${id}`)
    return response.data
  },

  // Tracking endpoints
  getMyTrackings: async () => {
    const response = await apiClient.get<PaginatedResponse<VesselTracking>>(
      '/tracking/vessels',
    )
    return response.data
  },

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

  getTracking: async (id: string) => {
    const response = await apiClient.get<ApiResponse<VesselTracking>>(
      `/tracking/vessels/${id}`,
    )
    return response.data
  },

  updateTracking: async (id: string, data: Partial<VesselTracking>) => {
    const response = await apiClient.patch<ApiResponse<VesselTracking>>(
      `/tracking/vessels/${id}`,
      data,
    )
    return response.data
  },

  pauseTracking: async (id: string) => {
    const response = await apiClient.post<ApiResponse<VesselTracking>>(
      `/tracking/vessels/${id}/pause`,
    )
    return response.data
  },

  resumeTracking: async (id: string) => {
    const response = await apiClient.post<ApiResponse<VesselTracking>>(
      `/tracking/vessels/${id}/resume`,
    )
    return response.data
  },

  deleteTracking: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(
      `/tracking/vessels/${id}`,
    )
    return response.data
  },

  // Get available tracking criteria
  getTrackingCriteria: async () => {
    const response = await apiClient.get<ApiResponse<TrackingCriteria[]>>(
      '/tracking/criteria',
    )
    return response.data
  },

  // Calculate tracking cost
  calculateCost: async (data: {
    vesselId: string
    criteria: string[]
    days: number
  }) => {
    const response = await apiClient.post<ApiResponse<{ totalCredits: number; creditsPerDay: number }>>(
      '/tracking/calculate-cost',
      data,
    )
    return response.data
  },
}