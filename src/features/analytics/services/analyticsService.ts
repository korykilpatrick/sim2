import { analyticsApi } from '@api/endpoints'
import type {
  AnalyticsOverview,
  UserActivityLog,
  RevenueBreakdown,
} from '../types'

export const analyticsService = {
  async getOverview(timeRange: string = 'month'): Promise<AnalyticsOverview> {
    const { data } = await analyticsApi.getOverview(timeRange)
    return data
  },

  async getUserActivity(limit: number = 20): Promise<UserActivityLog[]> {
    const { data } = await analyticsApi.getUserActivity(limit)
    return data
  },

  async getRevenueBreakdown(
    timeRange: string = 'month',
  ): Promise<RevenueBreakdown[]> {
    const { data } = await analyticsApi.getRevenueBreakdown(timeRange)
    return data
  },

  async exportAnalytics(
    format: 'csv' | 'excel',
    timeRange: string = 'month',
  ): Promise<Blob> {
    const { data } = await analyticsApi.exportAnalytics(format, timeRange)
    return data
  },
}
