import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import { DashboardStat } from '../types'

export function useDashboardStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    // Refetch every 30 seconds
    refetchInterval: 30000,
  })

  // Fallback data while loading
  const defaultStats: DashboardStat[] = [
    {
      name: 'Active Vessel Tracking',
      value: '0',
      change: '+0%',
      changeType: 'positive',
    },
    {
      name: 'Area Monitoring',
      value: '0',
      change: '+0%',
      changeType: 'positive',
    },
    { name: 'Fleet Vessels', value: '0', change: '+0%', changeType: 'neutral' },
    {
      name: 'Reports Generated',
      value: '0',
      change: '+0%',
      changeType: 'positive',
    },
  ]

  return {
    stats: data || defaultStats,
    isLoading,
    error,
  }
}
