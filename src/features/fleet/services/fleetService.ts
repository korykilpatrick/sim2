import { apiClient } from '@/lib/api/client'
import type { ApiResponse } from '@/types/api'
import type {
  Fleet,
  FleetStats,
  CreateFleetInput,
  UpdateFleetInput,
  AddVesselToFleetInput,
  RemoveVesselFromFleetInput,
  FleetVessel,
} from '../types'

export const fleetService = {
  // Fleet CRUD operations
  async getFleets() {
    const response = await apiClient.get<ApiResponse<Fleet[]>>('/fleets')
    return response.data.data
  },

  async getFleet(id: string) {
    const response = await apiClient.get<ApiResponse<Fleet>>(`/fleets/${id}`)
    return response.data.data
  },

  async createFleet(data: CreateFleetInput) {
    const response = await apiClient.post<ApiResponse<Fleet>>('/fleets', data)
    return response.data.data
  },

  async updateFleet(id: string, data: UpdateFleetInput) {
    const response = await apiClient.put<ApiResponse<Fleet>>(`/fleets/${id}`, data)
    return response.data.data
  },

  async deleteFleet(id: string) {
    const response = await apiClient.delete<ApiResponse<void>>(`/fleets/${id}`)
    return response.data.data
  },

  // Fleet stats
  async getFleetStats() {
    const response = await apiClient.get<ApiResponse<FleetStats>>('/fleets/stats')
    return response.data.data
  },

  // Fleet vessel management
  async getFleetVessels(fleetId: string) {
    const response = await apiClient.get<ApiResponse<FleetVessel[]>>(`/fleets/${fleetId}/vessels`)
    return response.data.data
  },

  async addVesselToFleet(data: AddVesselToFleetInput) {
    const response = await apiClient.post<ApiResponse<FleetVessel>>(`/fleets/${data.fleetId}/vessels`, {
      vesselId: data.vesselId,
    })
    return response.data.data
  },

  async removeVesselFromFleet(data: RemoveVesselFromFleetInput) {
    const response = await apiClient.delete<ApiResponse<void>>(`/fleets/${data.fleetId}/vessels/${data.vesselId}`)
    return response.data.data
  },

  // Search operations
  async searchFleets(query: string) {
    const response = await apiClient.get<ApiResponse<Fleet[]>>('/fleets/search', {
      params: { q: query },
    })
    return response.data.data
  },

  async searchFleetVessels(fleetId: string, query: string) {
    const response = await apiClient.get<ApiResponse<FleetVessel[]>>(`/fleets/${fleetId}/vessels/search`, {
      params: { q: query },
    })
    return response.data.data
  },
}
