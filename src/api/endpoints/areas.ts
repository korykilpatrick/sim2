/**
 * Area monitoring API endpoints
 */

import { apiClient } from '../client'
import type { ApiResponse, PaginatedResponse, AreaSearchParams } from '../types'
import type { Area } from '@/features/areas/types'
import type { Vessel } from '@/features/vessels/types'

export const areasApi = {
  /**
   * Get all areas for the current user
   */
  getAll: (params?: AreaSearchParams) =>
    apiClient.get<PaginatedResponse<Area>>('/areas', { params }),

  /**
   * Get area by ID
   */
  getById: (id: string) => apiClient.get<ApiResponse<Area>>(`/areas/${id}`),

  /**
   * Create a new area
   */
  create: (data: {
    name: string
    description?: string
    polygon: Array<{ lat: number; lng: number }>
    criteria: string[]
    alertPreferences?: {
      email: boolean
      sms: boolean
    }
  }) => apiClient.post<ApiResponse<Area>>('/areas', data),

  /**
   * Update an area
   */
  update: (id: string, data: Partial<Area>) =>
    apiClient.patch<ApiResponse<Area>>(`/areas/${id}`, data),

  /**
   * Delete an area
   */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/areas/${id}`),

  /**
   * Get vessels currently in area
   */
  getVesselsInArea: (areaId: string) =>
    apiClient.get<
      ApiResponse<
        Array<{
          vessel: Vessel
          enteredAt: string
          lastPosition: {
            latitude: number
            longitude: number
            timestamp: string
          }
        }>
      >
    >(`/areas/${areaId}/vessels`),

  /**
   * Get area activity history
   */
  getActivityHistory: (
    areaId: string,
    params?: {
      startDate?: string
      endDate?: string
      limit?: number
    },
  ) =>
    apiClient.get<
      ApiResponse<
        Array<{
          vessel: Vessel
          event: 'entry' | 'exit'
          timestamp: string
          position: {
            latitude: number
            longitude: number
          }
        }>
      >
    >(`/areas/${areaId}/activity`, { params }),

  /**
   * Get area statistics
   */
  getStatistics: (areaId: string) =>
    apiClient.get<
      ApiResponse<{
        currentVessels: number
        totalEvents: number
        averageDwellTime: number
        topVessels: Array<{
          vessel: Vessel
          visitCount: number
        }>
      }>
    >(`/areas/${areaId}/statistics`),
}
