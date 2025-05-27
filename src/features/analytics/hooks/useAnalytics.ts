/**
 * @module useAnalytics
 * @description React hooks for accessing analytics data including overview metrics, user activity, and revenue breakdowns.
 * Provides data fetching and export capabilities with React Query integration.
 */

import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services'

/**
 * Query key factory for analytics-related queries
 * @example
 * ```typescript
 * // Invalidate all analytics queries
 * queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
 *
 * // Invalidate specific overview data
 * queryClient.invalidateQueries({ queryKey: analyticsKeys.overview('month') })
 * ```
 */
export const analyticsKeys = {
  /** Base key for all analytics queries */
  all: ['analytics'] as const,
  /** Key for overview data by time range */
  overview: (timeRange: string) =>
    [...analyticsKeys.all, 'overview', timeRange] as const,
  /** Key for user activity data by limit */
  activity: (limit: number) =>
    [...analyticsKeys.all, 'activity', limit] as const,
  /** Key for revenue data by time range */
  revenue: (timeRange: string) =>
    [...analyticsKeys.all, 'revenue', timeRange] as const,
}

/**
 * Hook for fetching analytics overview data
 * @param {string} timeRange - Time range for data ('day' | 'week' | 'month' | 'year')
 * @returns {UseQueryResult} React Query result with analytics overview data
 * @example
 * ```typescript
 * function AnalyticsDashboard() {
 *   const { data, isLoading } = useAnalyticsOverview('month')
 *
 *   if (isLoading) return <Spinner />
 *
 *   return (
 *     <div>
 *       <h2>Total Revenue: ${data.totalRevenue}</h2>
 *       <h2>Active Users: {data.activeUsers}</h2>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAnalyticsOverview(timeRange: string = 'month') {
  return useQuery({
    queryKey: analyticsKeys.overview(timeRange),
    queryFn: () => analyticsService.getOverview(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for fetching recent user activity logs
 * @param {number} limit - Maximum number of activity entries to fetch
 * @returns {UseQueryResult} React Query result with user activity data
 * @example
 * ```typescript
 * function ActivityFeed() {
 *   const { data: activities } = useUserActivity(50)
 *
 *   return (
 *     <ul>
 *       {activities?.map(activity => (
 *         <li key={activity.id}>
 *           {activity.user} - {activity.action}
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useUserActivity(limit: number = 20) {
  return useQuery({
    queryKey: analyticsKeys.activity(limit),
    queryFn: () => analyticsService.getUserActivity(limit),
    staleTime: 30 * 1000, // 30 seconds - more frequent updates for activity
  })
}

/**
 * Hook for fetching revenue breakdown by product/service
 * @param {string} timeRange - Time range for revenue data
 * @returns {UseQueryResult} React Query result with revenue breakdown
 * @example
 * ```typescript
 * function RevenueChart() {
 *   const { data: revenue } = useRevenueBreakdown('quarter')
 *
 *   return (
 *     <PieChart
 *       data={revenue?.map(item => ({
 *         name: item.category,
 *         value: item.amount
 *       }))}
 *     />
 *   )
 * }
 * ```
 */
export function useRevenueBreakdown(timeRange: string = 'month') {
  return useQuery({
    queryKey: analyticsKeys.revenue(timeRange),
    queryFn: () => analyticsService.getRevenueBreakdown(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for exporting analytics data to file
 * @returns {Object} Object with exportData function
 * @example
 * ```typescript
 * function ExportButton() {
 *   const { exportData } = useAnalyticsExport()
 *   const [isExporting, setIsExporting] = useState(false)
 *
 *   const handleExport = async () => {
 *     setIsExporting(true)
 *     await exportData('excel', 'year')
 *     setIsExporting(false)
 *   }
 *
 *   return (
 *     <button onClick={handleExport} disabled={isExporting}>
 *       {isExporting ? 'Exporting...' : 'Export to Excel'}
 *     </button>
 *   )
 * }
 * ```
 */
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
