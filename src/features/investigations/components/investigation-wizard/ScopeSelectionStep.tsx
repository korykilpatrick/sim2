import { Card } from '@/components/common/Card'
import { InvestigationRequest, InvestigationScope } from '../../types'

interface ScopeSelectionStepProps {
  data: Partial<InvestigationRequest>
  onUpdate: (data: Partial<InvestigationRequest>) => void
}

const scopeOptions = [
  {
    value: 'vessel' as InvestigationScope,
    title: 'Vessel Activity',
    description:
      'Comprehensive analysis of vessel movements, compliance status, risk indicators, and operational patterns',
    icon: '🚢',
  },
  {
    value: 'area' as InvestigationScope,
    title: 'Maritime Area',
    description:
      'Detailed monitoring and intelligence gathering for ports, shipping lanes, and offshore infrastructure',
    icon: '🗺️',
  },
  {
    value: 'event' as InvestigationScope,
    title: 'Specific Event',
    description:
      'Investigation of dark voyages, ship-to-ship transfers, sanctions violations, or other suspicious activities',
    icon: '⚠️',
  },
]

export function ScopeSelectionStep({
  data,
  onUpdate,
}: ScopeSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Select Investigation Scope
        </h3>
        <p className="text-gray-600">
          Choose the type of investigation you need. Our experts will tailor
          their approach based on your selection.
        </p>
      </div>

      <div className="grid gap-4">
        {scopeOptions.map((option) => (
          <Card
            key={option.value}
            className={`cursor-pointer transition-all ${
              data.scope === option.value
                ? 'ring-2 ring-primary-500 border-primary-500'
                : 'hover:border-gray-400'
            }`}
            onClick={() => onUpdate({ scope: option.value })}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">{option.title}</h4>
                  <p className="text-gray-600">{option.description}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    data.scope === option.value
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}
                >
                  {data.scope === option.value && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Each investigation is customized to your
          specific needs. A SynMax analyst will contact you to refine the scope
          and objectives after submission.
        </p>
      </div>
    </div>
  )
}
