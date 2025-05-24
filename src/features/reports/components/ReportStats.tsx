import React from 'react'
import { Card, CardContent } from '@/components/common/Card'
import { FileText, Clock, CreditCard, TrendingUp } from 'lucide-react'
import { ReportStatistics } from '../types'

interface ReportStatsProps {
  stats: ReportStatistics
}

export const ReportStats: React.FC<ReportStatsProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Reports',
      value: stats.totalReports.toString(),
      change: `${stats.completedToday} today`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Pending Reports',
      value: stats.pendingReports.toString(),
      change: 'In queue',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Credits Used Today',
      value: stats.creditsUsedToday.toString(),
      change: 'Current usage',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Avg Processing Time',
      value: `${Math.round(stats.averageProcessingTime / 60)}m`,
      change: `Most popular: ${stats.popularReportType}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
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
