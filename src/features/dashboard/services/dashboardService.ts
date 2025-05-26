import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/api/types'
import { DashboardStat, DashboardActivity, DashboardData } from '../types'

/**
 * Service for managing dashboard data operations
 * @module dashboardService
 */
export const dashboardService = {
  /**
   * Retrieves dashboard statistics for the current user
   * @returns {Promise<DashboardStat[]>} Array of dashboard statistics
   * @throws {ApiError} If the request fails
   * @example
   * ```typescript
   * const stats = await dashboardService.getStats()
   * stats.forEach(stat => {
   *   console.log(`${stat.label}: ${stat.value}`)
   * })
   * ```
   */
  async getStats(): Promise<DashboardStat[]> {
    const response =
      await apiClient.get<ApiResponse<DashboardStat[]>>('/dashboard/stats')
    return response.data.data
  },

  /**
   * Retrieves recent activity items for the dashboard
   * @returns {Promise<DashboardActivity[]>} Array of recent activities
   * @throws {ApiError} If the request fails
   * @example
   * ```typescript
   * const activities = await dashboardService.getRecentActivity()
   * activities.forEach(activity => {
   *   console.log(`${activity.timestamp}: ${activity.description}`)
   * })
   * ```
   */
  async getRecentActivity(): Promise<DashboardActivity[]> {
    const response = await apiClient.get<ApiResponse<DashboardActivity[]>>(
      '/dashboard/activity',
    )
    return response.data.data
  },

  /**
   * Retrieves complete dashboard data including stats and activities
   * @returns {Promise<DashboardData>} Complete dashboard data
   * @throws {ApiError} If the request fails
   * @example
   * ```typescript
   * const dashboard = await dashboardService.getDashboardData()
   * console.log(`Total vessels: ${dashboard.stats.totalVessels}`)
   * console.log(`Recent activities: ${dashboard.recentActivity.length}`)
   * ```
   */
  async getDashboardData(): Promise<DashboardData> {
    const response =
      await apiClient.get<ApiResponse<DashboardData>>('/dashboard')
    return response.data.data
  },
}
