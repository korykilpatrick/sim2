import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import { dashboardKeys } from './'
import { DEFAULT_DASHBOARD_STATS } from '../constants'

/**
 * Hook to fetch and manage dashboard statistics
 * Auto-refreshes data every 30 seconds
 * 
 * @returns {Object} Dashboard stats state
 * @returns {DashboardStat[]} stats - Array of dashboard statistics (falls back to defaults while loading)
 * @returns {boolean} isLoading - Whether the stats are being fetched
 * @returns {Error | null} error - Any error that occurred during fetching
 * 
 * @example
 * ```typescript
 * function DashboardHeader() {
 *   const { stats, isLoading, error } = useDashboardStats()
 *   
 *   if (error) {
 *     return <ErrorMessage error={error} />
 *   }
 *   
 *   return (
 *     <div className="stats-grid">
 *       {stats.map(stat => (
 *         <StatCard
 *           key={stat.label}
 *           label={stat.label}
 *           value={stat.value}
 *           trend={stat.trend}
 *           loading={isLoading}
 *         />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useDashboardStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: dashboardService.getStats,
    // Refetch every 30 seconds
    refetchInterval: 30000,
  })

  return {
    stats: data || DEFAULT_DASHBOARD_STATS,
    isLoading,
    error,
  }
}
