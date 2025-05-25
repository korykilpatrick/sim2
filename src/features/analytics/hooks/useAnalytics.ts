import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services'

export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (timeRange: string) =>
    [...analyticsKeys.all, 'overview', timeRange] as const,
  activity: (limit: number) =>
    [...analyticsKeys.all, 'activity', limit] as const,
  revenue: (timeRange: string) =>
    [...analyticsKeys.all, 'revenue', timeRange] as const,
}

export function useAnalyticsOverview(timeRange: string = 'month') {
  return useQuery({
    queryKey: analyticsKeys.overview(timeRange),
    queryFn: () => analyticsService.getOverview(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUserActivity(limit: number = 20) {
  return useQuery({
    queryKey: analyticsKeys.activity(limit),
    queryFn: () => analyticsService.getUserActivity(limit),
    staleTime: 30 * 1000, // 30 seconds - more frequent updates for activity
  })
}

export function useRevenueBreakdown(timeRange: string = 'month') {
  return useQuery({
    queryKey: analyticsKeys.revenue(timeRange),
    queryFn: () => analyticsService.getRevenueBreakdown(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAnalyticsExport() {
  const exportData = async (format: 'csv' | 'excel', timeRange: string) => {
    const blob = await analyticsService.exportAnalytics(format, timeRange)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { exportData }
}
