import { Card } from '@/components/common'
import { useCostCalculation } from '@/features/shared/hooks'
import { CreditCard, TrendingUp, Calculator } from 'lucide-react'

interface AreaCostSummaryProps {
  areaSize: number
  criteriaCount: number
  updateFrequency: number
  durationMonths: number
}

export function AreaCostSummary({
  areaSize,
  criteriaCount,
  updateFrequency,
  durationMonths,
}: AreaCostSummaryProps) {
  const { calculateAreaMonitoring } = useCostCalculation()
  
  const costDetails = calculateAreaMonitoring({
    areaSize,
    criteriaCount,
    updateFrequency,
    durationMonths,
  })

  return (
    <Card className="bg-gray-50 border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-900">Cost Summary</h4>
          </div>
          <span className="text-sm text-gray-500">Estimated</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Base area monitoring</span>
            <span className="text-sm font-medium">
              {costDetails.baseCredits} credits
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Criteria checks ({criteriaCount} selected)
            </span>
            <span className="text-sm font-medium">
              {costDetails.criteriaCredits} credits
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Updates per day ({Math.floor(24 / updateFrequency)})
            </span>
            <span className="text-sm font-medium">
              ×{Math.floor(24 / updateFrequency)}
            </span>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-900">
                  Daily cost
                </span>
              </div>
              <span className="text-base font-semibold text-primary-600">
                {costDetails.creditsPerDay} credits
              </span>
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-900">
                  Total for {durationMonths} {durationMonths === 1 ? 'month' : 'months'}
                </span>
              </div>
              <span className="text-lg font-bold text-primary-600">
                {costDetails.totalCredits.toLocaleString()} credits
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 italic">
          * Actual costs may vary based on vessel activity and alert frequency
        </p>
      </div>
    </Card>
  )
}