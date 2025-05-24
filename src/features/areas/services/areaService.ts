import { apiClient } from '@/api/client'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type {
  Area,
  AreaMonitoring,
  AreaAlert,
  CreateAreaRequest,
  AreaStatistics,
  AreaFilters,
  MonitoringCriteria,
} from '../types'
import type { Vessel } from '@/features/vessels/types'

const BASE_URL = '/api/v1/areas'

export const areaApi = {
  // Areas
  getAreas: async (filters?: AreaFilters) => {
    const response = await apiClient.get<PaginatedResponse<Area>>(BASE_URL, {
      params: filters,
    })
    return {
      items: response.data.data,
      meta: response.data.meta,
    }
  },

  getArea: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Area>>(`${BASE_URL}/${id}`)
    return response.data.data // Return just the area object
  },

  createArea: async (data: CreateAreaRequest) => {
    const response = await apiClient.post<ApiResponse<Area>>(BASE_URL, data)
    return response.data.data // Return just the created area
  },

  updateArea: async (id: string, data: Partial<CreateAreaRequest>) => {
    const response = await apiClient.patch<ApiResponse<Area>>(
      `${BASE_URL}/${id}`,
      data,
    )
    return response.data.data // Return just the updated area
  },

  deleteArea: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${BASE_URL}/${id}`,
    )
    return response.data
  },

  // Monitoring
  getAreaMonitoring: async (areaId: string) => {
    const response = await apiClient.get<ApiResponse<AreaMonitoring>>(
      `${BASE_URL}/${areaId}/monitoring`,
    )
    return response.data.data // Return just the monitoring data
  },

  startMonitoring: async (
    areaId: string,
    config: {
      criteria: string[]
      updateFrequency: 3 | 6 | 12 | 24
      duration: number
      alertsEnabled: boolean
    },
  ) => {
    const response = await apiClient.post<ApiResponse<AreaMonitoring>>(
      `${BASE_URL}/${areaId}/monitoring`,
      config,
    )
    return response.data.data // Return just the monitoring data
  },

  pauseMonitoring: async (areaId: string) => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${BASE_URL}/${areaId}/monitoring/pause`,
    )
    return response.data
  },

  resumeMonitoring: async (areaId: string) => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${BASE_URL}/${areaId}/monitoring/resume`,
    )
    return response.data
  },

  // Alerts
  getAreaAlerts: async (
    areaId: string,
    filters?: {
      severity?: 'low' | 'medium' | 'high' | 'critical'
      type?: string
      isRead?: boolean
      limit?: number
      page?: number
    },
  ) => {
    const response = await apiClient.get<PaginatedResponse<AreaAlert>>(
      `${BASE_URL}/${areaId}/alerts`,
      { params: filters },
    )
    return {
      items: response.data.data,
      meta: response.data.meta,
    }
  },

  markAlertRead: async (areaId: string, alertId: string) => {
    const response = await apiClient.patch<ApiResponse<void>>(
      `${BASE_URL}/${areaId}/alerts/${alertId}/read`,
    )
    return response.data
  },

  // Statistics
  getAreaStatistics: async () => {
    const response = await apiClient.get<ApiResponse<AreaStatistics>>(
      `${BASE_URL}/statistics`,
    )
    return response.data.data // Return just the statistics object
  },

  // Criteria
  getMonitoringCriteria: async () => {
    const response = await apiClient.get<ApiResponse<MonitoringCriteria[]>>(
      `${BASE_URL}/criteria`,
    )
    return response.data.data // Return just the criteria array
  },

  // Cost calculation
  calculateCost: async (config: {
    sizeKm2: number
    criteria: string[]
    updateFrequency: number
    duration: number
  }) => {
    const response = await apiClient.post<
      ApiResponse<{ creditsPerDay: number; totalCredits: number }>
    >(`${BASE_URL}/calculate-cost`, config)
    return response.data.data // Return just the cost calculation
  },

  // Vessels in area
  getVesselsInArea: async (areaId: string) => {
    const response = await apiClient.get<PaginatedResponse<Vessel>>(
      `${BASE_URL}/${areaId}/vessels`,
    )
    return {
      items: response.data.data,
      meta: response.data.meta,
    }
  },
}
