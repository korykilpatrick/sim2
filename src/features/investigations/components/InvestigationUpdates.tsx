import { Card } from '@/components/common/Card'
import { Investigation } from '../types'
import { formatDate } from '@/utils/date'

interface InvestigationUpdatesProps {
  investigation: Investigation
}

const updateTypeConfig = {
  status_change: {
    icon: '🔄',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  progress_update: {
    icon: '📊',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  question: {
    icon: '❓',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  finding: {
    icon: '💡',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
}

export function InvestigationUpdates({
  investigation,
}: InvestigationUpdatesProps) {
  const updates = investigation.updates || []

  if (updates.length === 0) {
    return (
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Investigation Updates</h3>
        </div>
        <div className="p-4">
          <p className="text-gray-500 text-center py-8">
            No updates yet. Updates will appear here as your investigation
            progresses.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Investigation Updates</h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {updates.map((update) => {
            const config = updateTypeConfig[update.type]
            return (
              <div
                key={update.id}
                className={`rounded-lg p-4 ${config.bgColor} border border-opacity-20 ${config.color}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{config.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">
                        {update.author}
                      </p>
                      <time className="text-sm text-gray-500">
                        {formatDate(update.timestamp)}
                      </time>
                    </div>
                    <p className="text-gray-700">{update.message}</p>
                    {update.type === 'question' && (
                      <div className="mt-2">
                        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                          Reply to this question →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
