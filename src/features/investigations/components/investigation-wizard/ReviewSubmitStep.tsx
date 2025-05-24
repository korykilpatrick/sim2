import { Card } from '@/components/common/Card'
import Alert from '@/components/feedback/Alert'
import { InvestigationRequest } from '../../types'
import { useCreditPricing } from '@/features/shared/hooks/useCreditPricing'

interface ReviewSubmitStepProps {
  data: Partial<InvestigationRequest>
}

export function ReviewSubmitStep({ data }: ReviewSubmitStepProps) {
  const { calculateInvestigationCost } = useCreditPricing()

  // Calculate estimated cost based on scope and sources
  const sourceCount = Object.values(data.requestedSources || {}).filter(
    Boolean,
  ).length
  const estimatedCredits = calculateInvestigationCost(
    data.scope || 'vessel',
    sourceCount,
    data.priority || 'standard',
  )

  const priorityLabels = {
    standard: 'Standard (5-7 business days)',
    urgent: 'Urgent (2-3 business days)',
    critical: 'Critical (24-48 hours)',
  }

  const scopeLabels = {
    vessel: 'Vessel Activity Investigation',
    area: 'Maritime Area Investigation',
    event: 'Specific Event Investigation',
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Review Your Investigation Request
        </h3>
        <p className="text-gray-600">
          Please review the details below before submitting your request. A
          SynMax analyst will contact you within 24 hours to discuss your
          investigation.
        </p>
      </div>

      <Card>
        <div className="p-4 border-b">
          <h4 className="font-semibold">Investigation Details</h4>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <span className="font-medium text-gray-700">Title:</span>
            <p className="text-gray-900">{data.title || 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Scope:</span>
            <p className="text-gray-900">
              {scopeLabels[data.scope || 'vessel']}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Priority:</span>
            <p className="text-gray-900">
              {priorityLabels[data.priority || 'standard']}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Description:</span>
            <p className="text-gray-900 whitespace-pre-wrap">
              {data.description || 'Not provided'}
            </p>
          </div>
          {data.vesselIds && data.vesselIds.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Vessel IMOs:</span>
              <p className="text-gray-900">{data.vesselIds.join(', ')}</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h4 className="font-semibold">Investigation Objectives</h4>
        </div>
        <div className="p-4">
          {data.objectives && data.objectives.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {data.objectives.map((objective, index) => (
                <li key={index} className="text-gray-900">
                  {objective}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No objectives specified</p>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h4 className="font-semibold">Intelligence Sources</h4>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(data.requestedSources || {}).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded ${
                    value ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h4 className="font-semibold">Timeframe & Delivery</h4>
        </div>
        <div className="p-4 space-y-2">
          <div>
            <span className="font-medium text-gray-700">
              Investigation Period:
            </span>
            <p className="text-gray-900">
              {data.timeframe?.start} to {data.timeframe?.end}
            </p>
          </div>
          {data.additionalRequests && (
            <div>
              <span className="font-medium text-gray-700">
                Additional Requests:
              </span>
              <p className="text-gray-900">{data.additionalRequests}</p>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">
              Contact Preferences:
            </span>
            <p className="text-gray-900">
              {Object.entries(data.contactPreferences || {})
                .filter(([_, value]) => value)
                .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
                .join(', ') || 'None selected'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-primary-50 border-primary-200">
        <div className="p-6">
          <div className="text-center">
            <p className="text-lg font-semibold text-primary-900 mb-2">
              Estimated Cost
            </p>
            <p className="text-3xl font-bold text-primary-700">
              {estimatedCredits.toLocaleString()} -{' '}
              {(estimatedCredits * 1.5).toLocaleString()} Credits
            </p>
            <p className="text-sm text-primary-700 mt-2">
              Final cost will be confirmed after consultation
            </p>
          </div>
        </div>
      </Card>

      <Alert
        type="info"
        message={
          <div className="space-y-2">
            <p className="font-semibold">What happens next?</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>A SynMax analyst will review your request within 24 hours</li>
              <li>
                They will contact you to refine scope and provide a final quote
              </li>
              <li>Upon approval, the investigation will begin immediately</li>
              <li>
                You'll receive regular updates throughout the investigation
              </li>
              <li>
                Final report will be delivered within the agreed timeframe
              </li>
            </ol>
          </div>
        }
      />
    </div>
  )
}
