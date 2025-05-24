import { Card } from '@/components/common/Card'
import { Investigation, InvestigationStatus as StatusType } from '../types'
import { formatDate } from '@/utils/date'

interface InvestigationStatusProps {
  investigation: Investigation
}

const statusConfig: Record<
  StatusType,
  {
    label: string
    color: string
    bgColor: string
    icon: string
  }
> = {
  draft: {
    label: 'Draft',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '📝',
  },
  submitted: {
    label: 'Submitted',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '📤',
  },
  under_review: {
    label: 'Under Review',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: '🔍',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: '⚙️',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✅',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '❌',
  },
}

const statusSteps: StatusType[] = [
  'submitted',
  'under_review',
  'in_progress',
  'completed',
]

export function InvestigationStatus({
  investigation,
}: InvestigationStatusProps) {
  const currentStatusIndex = statusSteps.indexOf(investigation.status)
  const statusInfo = statusConfig[investigation.status]

  return (
    <Card>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Investigation Status</h3>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
          >
            <span className="mr-1">{statusInfo.icon}</span>
            {statusInfo.label}
          </div>
        </div>
      </div>
      <div className="p-4 space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium">
              {investigation.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${investigation.progress}%` }}
            />
          </div>
        </div>

        {/* Status Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const isCompleted = currentStatusIndex >= index
              const isCurrent = statusSteps[currentStatusIndex] === step
              const stepInfo = statusConfig[step]

              return (
                <div key={step} className="relative flex items-start gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      isCompleted
                        ? isCurrent
                          ? stepInfo.bgColor
                          : 'bg-green-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <span className="text-sm">
                      {isCompleted && !isCurrent ? '✓' : stepInfo.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-medium ${
                        isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {stepInfo.label}
                    </h4>
                    {step === 'submitted' && investigation.submittedAt && (
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(investigation.submittedAt)}
                      </p>
                    )}
                    {step === 'completed' && investigation.completedAt && (
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(investigation.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Key Dates */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-gray-900 mb-2">Key Dates</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">
                {formatDate(investigation.createdAt)}
              </span>
            </div>
            {investigation.estimatedCompletion && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Completion:</span>
                <span className="font-medium">
                  {formatDate(investigation.estimatedCompletion)}
                </span>
              </div>
            )}
            {investigation.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium">
                  {formatDate(investigation.completedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Analyst Assignment */}
        {investigation.analystName && (
          <div className="bg-primary-50 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 mb-1">
              Assigned Analyst
            </h4>
            <p className="text-primary-700">{investigation.analystName}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
