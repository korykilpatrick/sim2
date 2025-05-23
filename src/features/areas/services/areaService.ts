import { apiClient } from '@/lib/api/client'
import type {
  Area,
  AreaMonitoring,
  AreaAlert,
  CreateAreaRequest,
  AreaStatistics,
  AreaFilters,
  MonitoringCriteria,
} from '../types'

const BASE_URL = '/api/v1/areas'

export const areaApi = {
  // Areas
  getAreas: async (filters?: AreaFilters) => {
    return apiClient.get<{ data: Area[]; total: number }>(BASE_URL, {
      params: filters,
    })
  },

  getArea: async (id: string) => {
    return apiClient.get<{ data: Area }>(`${BASE_URL}/${id}`)
  },

  createArea: async (data: CreateAreaRequest) => {
    return apiClient.post<{ data: Area }>(BASE_URL, data)
  },

  updateArea: async (id: string, data: Partial<CreateAreaRequest>) => {
    return apiClient.patch<{ data: Area }>(`${BASE_URL}/${id}`, data)
  },

  deleteArea: async (id: string) => {
    return apiClient.delete(`${BASE_URL}/${id}`)
  },

  // Monitoring
  getAreaMonitoring: async (areaId: string) => {
    return apiClient.get<{ data: AreaMonitoring }>(
      `${BASE_URL}/${areaId}/monitoring`,
    )
  },

  startMonitoring: async (areaId: string, config: any) => {
    return apiClient.post<{ data: AreaMonitoring }>(
      `${BASE_URL}/${areaId}/monitoring`,
      config,
    )
  },

  pauseMonitoring: async (areaId: string) => {
    return apiClient.post(`${BASE_URL}/${areaId}/monitoring/pause`)
  },

  resumeMonitoring: async (areaId: string) => {
    return apiClient.post(`${BASE_URL}/${areaId}/monitoring/resume`)
  },

  // Alerts
  getAreaAlerts: async (areaId: string, filters?: any) => {
    return apiClient.get<{ data: AreaAlert[]; total: number }>(
      `${BASE_URL}/${areaId}/alerts`,
      { params: filters },
    )
  },

  markAlertRead: async (areaId: string, alertId: string) => {
    return apiClient.patch(`${BASE_URL}/${areaId}/alerts/${alertId}/read`)
  },

  // Statistics
  getAreaStatistics: async () => {
    return apiClient.get<{ data: AreaStatistics }>(`${BASE_URL}/statistics`)
  },

  // Criteria
  getMonitoringCriteria: async () => {
    return apiClient.get<{ data: MonitoringCriteria[] }>(
      `${BASE_URL}/criteria`,
    )
  },

  // Cost calculation
  calculateCost: async (config: {
    sizeKm2: number
    criteria: string[]
    updateFrequency: number
    duration: number
  }) => {
    return apiClient.post<{
      data: { creditsPerDay: number; totalCredits: number }
    }>(`${BASE_URL}/calculate-cost`, config)
  },

  // Vessels in area
  getVesselsInArea: async (areaId: string) => {
    return apiClient.get<{ data: any[]; total: number }>(
      `${BASE_URL}/${areaId}/vessels`,
    )
  },
}