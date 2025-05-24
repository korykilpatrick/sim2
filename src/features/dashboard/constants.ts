import type { DashboardStat } from './types'

/**
 * Default dashboard statistics shown while data is loading
 * or when there's no data available from the server.
 */
export const DEFAULT_DASHBOARD_STATS: DashboardStat[] = [
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
  {
    name: 'Fleet Vessels',
    value: '0',
    change: '+0%',
    changeType: 'neutral',
  },
  {
    name: 'Reports Generated',
    value: '0',
    change: '+0%',
    changeType: 'positive',
  },
]