import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/api/types'
import { DashboardStat, DashboardActivity, DashboardData } from '../types'

export const dashboardService = {
  async getStats(): Promise<DashboardStat[]> {
    const response =
      await apiClient.get<ApiResponse<DashboardStat[]>>('/dashboard/stats')
    return response.data.data
  },

  async getRecentActivity(): Promise<DashboardActivity[]> {
    const response = await apiClient.get<ApiResponse<DashboardActivity[]>>(
      '/dashboard/activity',
    )
    return response.data.data
  },

  async getDashboardData(): Promise<DashboardData> {
    const response =
      await apiClient.get<ApiResponse<DashboardData>>('/dashboard')
    return response.data.data
  },
}
