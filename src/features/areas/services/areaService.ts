import { apiClient } from '@/api/client'
import type { ApiResponse, PaginatedResponse } from '@/api/types'
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

/**
 * Service for managing area monitoring operations
 * @module areaApi
 */
export const areaApi = {
  // Areas
  
  /**
   * Retrieves a paginated list of areas with optional filtering
   * @param {AreaFilters} [filters] - Optional filters for area listing
   * @param {string} [filters.type] - Filter by area type (fishing, exclusion, transit, custom)
   * @param {string} [filters.status] - Filter by status (active, inactive, pending)
   * @param {number} [filters.limit] - Number of items per page
   * @param {number} [filters.page] - Page number
   * @returns {Promise<{items: Area[], meta: PaginationMeta}>} Paginated area results
   * @throws {ApiError} If the request fails
   * @example
   * ```typescript
   * const areas = await areaApi.getAreas({ type: 'fishing', status: 'active', limit: 20 })
   * console.log(`Found ${areas.items.length} active fishing areas`)
   * ```
   */
  getAreas: async (filters?: AreaFilters) => {
    const response = await apiClient.get<PaginatedResponse<Area>>(BASE_URL, {
      params: filters,
    })
    return {
      items: response.data.data,
      meta: response.data.meta,
    }
  },

  /**
   * Retrieves a specific area by ID
   * @param {string} id - The area ID
   * @returns {Promise<Area>} The area object with full details
   * @throws {ApiError} If the area is not found or request fails
   * @example
   * ```typescript
   * const area = await areaApi.getArea('area-123')
   * console.log(`Area: ${area.name}, Size: ${area.sizeKm2} km²`)
   * ```
   */
  getArea: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Area>>(`${BASE_URL}/${id}`)
    return response.data.data // Return just the area object
  },

  /**
   * Creates a new area for monitoring
   * @param {CreateAreaRequest} data - Area creation data
   * @param {string} data.name - Name of the area
   * @param {string} data.description - Description of the area
   * @param {AreaType} data.type - Type of area (fishing, exclusion, transit, custom)
   * @param {GeoJSON} data.boundaries - GeoJSON polygon defining area boundaries
   * @returns {Promise<Area>} The created area object
   * @throws {ApiError} If validation fails or request fails
   * @example
   * ```typescript
   * const newArea = await areaApi.createArea({
   *   name: 'North Atlantic Fishing Zone',
   *   description: 'Primary fishing area monitoring',
   *   type: 'fishing',
   *   boundaries: geoJsonPolygon
   * })
   * ```
   */
  createArea: async (data: CreateAreaRequest) => {
    const response = await apiClient.post<ApiResponse<Area>>(BASE_URL, data)
    return response.data.data // Return just the created area
  },

  /**
   * Updates an existing area
   * @param {string} id - The area ID to update
   * @param {Partial<CreateAreaRequest>} data - Partial area data to update
   * @returns {Promise<Area>} The updated area object
   * @throws {ApiError} If the area is not found or request fails
   * @example
   * ```typescript
   * const updated = await areaApi.updateArea('area-123', {
   *   name: 'Updated Area Name',
   *   description: 'New description'
   * })
   * ```
   */
  updateArea: async (id: string, data: Partial<CreateAreaRequest>) => {
    const response = await apiClient.patch<ApiResponse<Area>>(
      `${BASE_URL}/${id}`,
      data,
    )
    return response.data.data // Return just the updated area
  },

  /**
   * Deletes an area
   * @param {string} id - The area ID to delete
   * @returns {Promise<ApiResponse<void>>}
   * @throws {ApiError} If the area is not found or has active monitoring
   * @example
   * ```typescript
   * await areaApi.deleteArea('area-123')
   * console.log('Area deleted successfully')
   * ```
   */
  deleteArea: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${BASE_URL}/${id}`,
    )
    return response.data
  },

  // Monitoring
  
  /**
   * Retrieves monitoring configuration and status for an area
   * @param {string} areaId - The area ID
   * @returns {Promise<AreaMonitoring>} Current monitoring configuration and status
   * @throws {ApiError} If the area is not found or request fails
   * @example
   * ```typescript
   * const monitoring = await areaApi.getAreaMonitoring('area-123')
   * if (monitoring.status === 'active') {
   *   console.log(`Monitoring active, next update: ${monitoring.nextUpdateAt}`)
   * }
   * ```
   */
  getAreaMonitoring: async (areaId: string) => {
    const response = await apiClient.get<ApiResponse<AreaMonitoring>>(
      `${BASE_URL}/${areaId}/monitoring`,
    )
    return response.data.data // Return just the monitoring data
  },

  /**
   * Starts monitoring for an area with specified configuration
   * @param {string} areaId - The area ID to start monitoring
   * @param {Object} config - Monitoring configuration
   * @param {string[]} config.criteria - Array of monitoring criteria IDs
   * @param {3|6|12|24} config.updateFrequency - Update frequency in hours
   * @param {number} config.duration - Monitoring duration in days
   * @param {boolean} config.alertsEnabled - Whether to enable alerts
   * @returns {Promise<AreaMonitoring>} The monitoring configuration
   * @throws {ApiError} If the area is not found, already monitored, or insufficient credits
   * @example
   * ```typescript
   * const monitoring = await areaApi.startMonitoring('area-123', {
   *   criteria: ['vessel-entry', 'speed-violation'],
   *   updateFrequency: 6,
   *   duration: 30,
   *   alertsEnabled: true
   * })
   * ```
   */
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

  /**
   * Pauses active monitoring for an area
   * @param {string} areaId - The area ID
   * @returns {Promise<ApiResponse<void>>}
   * @throws {ApiError} If the area is not found or monitoring is not active
   * @example
   * ```typescript
   * await areaApi.pauseMonitoring('area-123')
   * console.log('Monitoring paused')
   * ```
   */
  pauseMonitoring: async (areaId: string) => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${BASE_URL}/${areaId}/monitoring/pause`,
    )
    return response.data
  },

  /**
   * Resumes paused monitoring for an area
   * @param {string} areaId - The area ID
   * @returns {Promise<ApiResponse<void>>}
   * @throws {ApiError} If the area is not found or monitoring is not paused
   * @example
   * ```typescript
   * await areaApi.resumeMonitoring('area-123')
   * console.log('Monitoring resumed')
   * ```
   */
  resumeMonitoring: async (areaId: string) => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${BASE_URL}/${areaId}/monitoring/resume`,
    )
    return response.data
  },

  // Alerts
  
  /**
   * Retrieves alerts for a specific area with optional filtering
   * @param {string} areaId - The area ID
   * @param {Object} [filters] - Optional filters for alerts
   * @param {'low'|'medium'|'high'|'critical'} [filters.severity] - Filter by severity
   * @param {string} [filters.type] - Filter by alert type
   * @param {boolean} [filters.isRead] - Filter by read status
   * @param {number} [filters.limit] - Number of items per page
   * @param {number} [filters.page] - Page number
   * @returns {Promise<{items: AreaAlert[], meta: PaginationMeta}>} Paginated alerts
   * @throws {ApiError} If the area is not found or request fails
   * @example
   * ```typescript
   * const alerts = await areaApi.getAreaAlerts('area-123', {
   *   severity: 'high',
   *   isRead: false,
   *   limit: 10
   * })
   * console.log(`${alerts.items.length} unread high-severity alerts`)
   * ```
   */
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

  /**
   * Marks an alert as read
   * @param {string} areaId - The area ID
   * @param {string} alertId - The alert ID to mark as read
   * @returns {Promise<ApiResponse<void>>}
   * @throws {ApiError} If the area/alert is not found or request fails
   * @example
   * ```typescript
   * await areaApi.markAlertRead('area-123', 'alert-456')
   * ```
   */
  markAlertRead: async (areaId: string, alertId: string) => {
    const response = await apiClient.patch<ApiResponse<void>>(
      `${BASE_URL}/${areaId}/alerts/${alertId}/read`,
    )
    return response.data
  },

  // Statistics
  
  /**
   * Retrieves global area monitoring statistics
   * @returns {Promise<AreaStatistics>} Statistics including total areas, active monitoring, alerts
   * @throws {ApiError} If the request fails
   * @example
   * ```typescript
   * const stats = await areaApi.getAreaStatistics()
   * console.log(`Total areas: ${stats.totalAreas}`)
   * console.log(`Active monitoring: ${stats.activeMonitoring}`)
   * console.log(`Unread alerts: ${stats.unreadAlerts}`)
   * ```
   */
  getAreaStatistics: async () => {
    const response = await apiClient.get<ApiResponse<AreaStatistics>>(
      `${BASE_URL}/statistics`,
    )
    return response.data.data // Return just the statistics object
  },

  // Criteria
  
  /**
   * Retrieves available monitoring criteria
   * @returns {Promise<MonitoringCriteria[]>} Array of monitoring criteria with pricing
   * @throws {ApiError} If the request fails
   * @example
   * ```typescript
   * const criteria = await areaApi.getMonitoringCriteria()
   * criteria.forEach(c => {
   *   console.log(`${c.name}: ${c.creditCost} credits/check`)
   * })
   * ```
   */
  getMonitoringCriteria: async () => {
    const response = await apiClient.get<ApiResponse<MonitoringCriteria[]>>(
      `${BASE_URL}/criteria`,
    )
    return response.data.data // Return just the criteria array
  },

  // Cost calculation
  
  /**
   * Calculates monitoring cost for given configuration
   * @param {Object} config - Cost calculation parameters
   * @param {number} config.sizeKm2 - Area size in square kilometers
   * @param {string[]} config.criteria - Array of monitoring criteria IDs
   * @param {number} config.updateFrequency - Update frequency in hours
   * @param {number} config.duration - Duration in days
   * @returns {Promise<{creditsPerDay: number, totalCredits: number}>} Cost breakdown
   * @throws {ApiError} If validation fails or request fails
   * @example
   * ```typescript
   * const cost = await areaApi.calculateCost({
   *   sizeKm2: 1000,
   *   criteria: ['vessel-entry', 'speed-violation'],
   *   updateFrequency: 6,
   *   duration: 30
   * })
   * console.log(`Cost: ${cost.totalCredits} credits (${cost.creditsPerDay}/day)`)
   * ```
   */
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
  
  /**
   * Retrieves vessels currently within an area
   * @param {string} areaId - The area ID
   * @returns {Promise<{items: Vessel[], meta: PaginationMeta}>} Vessels in the area
   * @throws {ApiError} If the area is not found or request fails
   * @example
   * ```typescript
   * const vessels = await areaApi.getVesselsInArea('area-123')
   * console.log(`${vessels.items.length} vessels currently in area`)
   * vessels.items.forEach(v => {
   *   console.log(`${v.name} (${v.imo}) - ${v.type}`)
   * })
   * ```
   */
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
