import { apiClient } from '../client'
import type {
  AnalyticsOverview,
  UserActivityLog,
  RevenueBreakdown,
} from '@features/analytics/types'

export const analyticsApi = {
  getOverview: (timeRange: string = 'month') =>
    apiClient.get<AnalyticsOverview>('/analytics/overview', {
      params: { timeRange },
    }),

  getUserActivity: (limit: number = 20) =>
    apiClient.get<UserActivityLog[]>('/analytics/activity', {
      params: { limit },
    }),

  getRevenueBreakdown: (timeRange: string = 'month') =>
    apiClient.get<RevenueBreakdown[]>('/analytics/revenue/breakdown', {
      params: { timeRange },
    }),

  exportAnalytics: (format: 'csv' | 'excel', timeRange: string = 'month') =>
    apiClient.get('/analytics/export', {
      params: { format, timeRange },
      responseType: 'blob',
    }),
}
