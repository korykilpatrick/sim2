import { Card, CardContent, CardHeader, CardTitle } from '@components/common'
import { Clock, Target, Zap, TrendingUp } from 'lucide-react'

interface EngagementData {
  averageSessionDuration: number
  featuresAdopted: number
  totalFeatures: number
  conversionRate: number
}

interface EngagementMetricsProps {
  data: EngagementData
  title?: string
}

export default function EngagementMetrics({
  data,
  title = 'User Engagement',
}: EngagementMetricsProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  const adoptionRate = (data.featuresAdopted / data.totalFeatures) * 100

  const metrics = [
    {
      icon: Clock,
      label: 'Avg. Session Duration',
      value: formatDuration(data.averageSessionDuration),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Zap,
      label: 'Features Adopted',
      value: `${data.featuresAdopted}/${data.totalFeatures}`,
      subValue: `${adoptionRate.toFixed(0)}%`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Target,
      label: 'Conversion Rate',
      value: `${data.conversionRate}%`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      label: 'Growth Indicator',
      value: 'Healthy',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`${metric.bgColor} p-2 rounded-lg`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{metric.label}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {metric.value}
                </p>
                {metric.subValue && (
                  <p className="text-xs text-gray-600">{metric.subValue}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
