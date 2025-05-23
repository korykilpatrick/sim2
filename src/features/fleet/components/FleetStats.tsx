import { Card, CardContent } from '@/components/common/Card'
import type { FleetStats } from '../types'

interface FleetStatsProps {
  stats: FleetStats
  loading?: boolean
}

export function FleetStatsCard({ stats, loading }: FleetStatsProps) {
  const statItems = [
    { label: 'Total Fleets', value: stats.totalFleets, icon: '⚓' },
    { label: 'Tracked Vessels', value: stats.trackedVessels, icon: '🚢' },
    { label: 'Active Alerts', value: stats.activeAlerts, icon: '🔔' },
    { label: 'Credits/Month', value: stats.creditsPerMonth, icon: '💳' },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500">
                  {stat.label}
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {loading ? (
                    <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </dd>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
