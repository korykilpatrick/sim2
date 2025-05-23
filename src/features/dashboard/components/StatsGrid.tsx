import { Card, CardContent } from '@/components/common/Card'
import { DashboardStat } from '../types'
import { clsx } from '@/utils/clsx'

interface StatsGridProps {
  stats: DashboardStat[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="overflow-hidden">
          <CardContent className="p-6">
            <dt className="truncate text-sm font-medium text-gray-500">
              {stat.name}
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {stat.value}
            </dd>
            <dd className="mt-1 flex items-baseline">
              <span
                className={clsx(
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-500',
                  'text-sm font-semibold',
                )}
              >
                {stat.change}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                from last month
              </span>
            </dd>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
