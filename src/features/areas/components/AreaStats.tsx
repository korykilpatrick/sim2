import React from 'react'
import { Card, CardContent } from '@/components/common/Card'
import { MapPin, Activity, AlertCircle, CreditCard } from 'lucide-react'
import { AreaStatistics } from '../types'

interface AreaStatsProps {
  stats: AreaStatistics
}

export const AreaStats: React.FC<AreaStatsProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Active Monitoring',
      value: stats.activeMonitoring.toString(),
      change: `${stats.totalAreas} total areas`,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Alerts Today',
      value: stats.alertsToday.toString(),
      change: `${stats.highRiskVessels} high risk`,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Vessels Monitored',
      value: stats.vesselsMonitored.toString(),
      change: 'Across all areas',
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Credits/Day',
      value: stats.creditsPerDay.toString(),
      change: 'Current usage',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}