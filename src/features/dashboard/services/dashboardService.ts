import { apiClient } from '@/lib/api/client'
import { DashboardStat, DashboardActivity, DashboardData } from '../types'

export const dashboardService = {
  async getStats(): Promise<DashboardStat[]> {
    const response = await apiClient.get<{ stats: DashboardStat[] }>(
      '/dashboard/stats',
    )
    return response.data.stats
  },

  async getRecentActivity(): Promise<DashboardActivity[]> {
    const response = await apiClient.get<{ activities: DashboardActivity[] }>(
      '/dashboard/activity',
    )
    return response.data.activities
  },

  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>('/dashboard')
    return response.data
  },
}
