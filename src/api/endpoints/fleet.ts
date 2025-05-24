/**
 * Fleet management API endpoints
 */

import { apiClient } from '../client'
import type { ApiResponse, PaginatedResponse } from '../types'
import type { Fleet } from '@/features/fleet/types'
import type { Vessel } from '@/features/vessels/types'

export const fleetApi = {
  /**
   * Get all fleets for the current user
   */
  getAll: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Fleet>>('/fleets', { params }),

  /**
   * Get fleet by ID
   */
  getById: (id: string) => apiClient.get<ApiResponse<Fleet>>(`/fleets/${id}`),

  /**
   * Create a new fleet
   */
  create: (data: { name: string; description?: string; vesselIds: string[] }) =>
    apiClient.post<ApiResponse<Fleet>>('/fleets', data),

  /**
   * Update fleet details
   */
  update: (id: string, data: Partial<Fleet>) =>
    apiClient.patch<ApiResponse<Fleet>>(`/fleets/${id}`, data),

  /**
   * Delete a fleet
   */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/fleets/${id}`),

  /**
   * Add vessels to fleet
   */
  addVessels: (fleetId: string, vesselIds: string[]) =>
    apiClient.post<ApiResponse<Fleet>>(`/fleets/${fleetId}/vessels`, {
      vesselIds,
    }),

  /**
   * Remove vessels from fleet
   */
  removeVessels: (fleetId: string, vesselIds: string[]) =>
    apiClient.delete<ApiResponse<Fleet>>(`/fleets/${fleetId}/vessels`, {
      data: { vesselIds },
    }),

  /**
   * Get fleet vessels with details
   */
  getVessels: (fleetId: string) =>
    apiClient.get<ApiResponse<Vessel[]>>(`/fleets/${fleetId}/vessels`),

  /**
   * Get fleet statistics
   */
  getStatistics: (fleetId: string) =>
    apiClient.get<
      ApiResponse<{
        totalVessels: number
        activeVessels: number
        averageRiskScore: number
        complianceRate: number
        vesselsAtSea: number
        vesselsInPort: number
      }>
    >(`/fleets/${fleetId}/statistics`),

  /**
   * Configure fleet-wide alerts
   */
  configureAlerts: (
    fleetId: string,
    config: {
      criteria: string[]
      recipients: string[]
      enabled: boolean
    },
  ) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      `/fleets/${fleetId}/alerts`,
      config,
    ),

  /**
   * Track all vessels in fleet
   */
  trackAll: (
    fleetId: string,
    config: {
      criteria: string[]
      duration: number
    },
  ) =>
    apiClient.post<
      ApiResponse<{
        trackingIds: string[]
        totalCost: number
      }>
    >(`/fleets/${fleetId}/track-all`, config),
}
