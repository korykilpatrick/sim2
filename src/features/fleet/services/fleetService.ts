import { apiClient } from '@/lib/api/client'
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
    const response = await apiClient.get<Fleet[]>('/fleets')
    return response.data
  },

  async getFleet(id: string) {
    const response = await apiClient.get<Fleet>(`/fleets/${id}`)
    return response.data
  },

  async createFleet(data: CreateFleetInput) {
    const response = await apiClient.post<Fleet>('/fleets', data)
    return response.data
  },

  async updateFleet(id: string, data: UpdateFleetInput) {
    const response = await apiClient.put<Fleet>(`/fleets/${id}`, data)
    return response.data
  },

  async deleteFleet(id: string) {
    const response = await apiClient.delete(`/fleets/${id}`)
    return response.data
  },

  // Fleet stats
  async getFleetStats() {
    const response = await apiClient.get<FleetStats>('/fleets/stats')
    return response.data
  },

  // Fleet vessel management
  async getFleetVessels(fleetId: string) {
    const response = await apiClient.get<FleetVessel[]>(`/fleets/${fleetId}/vessels`)
    return response.data
  },

  async addVesselToFleet(data: AddVesselToFleetInput) {
    const response = await apiClient.post<FleetVessel>(`/fleets/${data.fleetId}/vessels`, {
      vesselId: data.vesselId,
    })
    return response.data
  },

  async removeVesselFromFleet(data: RemoveVesselFromFleetInput) {
    const response = await apiClient.delete(`/fleets/${data.fleetId}/vessels/${data.vesselId}`)
    return response.data
  },

  // Search operations
  async searchFleets(query: string) {
    const response = await apiClient.get<Fleet[]>('/fleets/search', {
      params: { q: query },
    })
    return response.data
  },

  async searchFleetVessels(fleetId: string, query: string) {
    const response = await apiClient.get<FleetVessel[]>(`/fleets/${fleetId}/vessels/search`, {
      params: { q: query },
    })
    return response.data
  },
}
