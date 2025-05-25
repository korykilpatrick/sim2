import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/common'
import { cn } from '@utils/cn'
import type { UsageMetric } from '../types'

interface MetricCardProps {
  metric: UsageMetric
  className?: string
}

export default function MetricCard({ metric, className }: MetricCardProps) {
  const isPositive = metric.changeType === 'positive'
  const isNegative = metric.changeType === 'negative'

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {metric.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight">
            {metric.value}
          </p>
          {metric.change !== 0 && (
            <div className="flex items-center space-x-1">
              {isPositive && <TrendingUp className="h-4 w-4 text-green-600" />}
              {isNegative && <TrendingDown className="h-4 w-4 text-red-600" />}
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive && 'text-green-600',
                  isNegative && 'text-red-600',
                  metric.changeType === 'neutral' && 'text-gray-600',
                )}
              >
                {isPositive && '+'}
                {metric.change}%
              </span>
              <span className="text-sm text-gray-500">{metric.period}</span>
            </div>
          )}
          {metric.description && (
            <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
