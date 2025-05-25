import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/common'
import { formatRelativeTime } from '@utils/date'
import type { UserActivityLog } from '../types'

interface ActivityFeedProps {
  activities: UserActivityLog[]
  title?: string
}

const productColors: Record<string, string> = {
  VTS: 'bg-blue-100 text-blue-800',
  AMS: 'bg-purple-100 text-purple-800',
  VCR: 'bg-green-100 text-green-800',
  VChR: 'bg-yellow-100 text-yellow-800',
  FTS: 'bg-indigo-100 text-indigo-800',
  MIS: 'bg-red-100 text-red-800',
}

export default function ActivityFeed({
  activities,
  title = 'Recent Activity',
}: ActivityFeedProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">
                      {activity.userName}
                    </span>
                    <span className="text-gray-600"> {activity.action}</span>
                  </div>
                  <div className="mt-1 flex items-center space-x-2 text-xs">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                        productColors[activity.product] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {activity.product}
                    </span>
                    {activity.creditsUsed && (
                      <span className="text-gray-500">
                        {activity.creditsUsed} credits
                      </span>
                    )}
                    <span className="text-gray-500">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
