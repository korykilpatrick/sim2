import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import { dashboardKeys } from './'
import { DEFAULT_DASHBOARD_STATS } from '../constants'

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
