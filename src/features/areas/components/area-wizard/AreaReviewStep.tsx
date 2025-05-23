import { Card } from '@/components/common'
import { AreaMap } from '../AreaMap'
import { AreaCostSummary } from './AreaCostSummary'
import { useMonitoringCriteria } from '../../hooks/useAreas'
import { MapPin, Clock, Shield, Calendar } from 'lucide-react'
import type { MonitoringCriteria } from '../../types'

interface AreaReviewStepProps {
  areaName: string
  description?: string
  areaGeometry?: GeoJSON.Polygon
  monitoringCriteria: string[]
  updateFrequency: number
  durationMonths: number
}

export function AreaReviewStep({
  areaName,
  description,
  areaGeometry,
  monitoringCriteria,
  updateFrequency,
  durationMonths,
}: AreaReviewStepProps) {
  const { data: criteriaData } = useMonitoringCriteria()
  const allCriteria = criteriaData?.data?.data || []
  
  const selectedCriteriaDetails = allCriteria.filter((c: MonitoringCriteria) =>
    monitoringCriteria.includes(c.id)
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Review Your Configuration
        </h3>
        <p className="text-sm text-gray-600">
          Please review your area monitoring configuration before confirming.
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Area Details</h4>
            <div className="space-y-2">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{areaName}</p>
                  {description && (
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {areaGeometry && (
            <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
              <AreaMap area={areaGeometry} />
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Shield className="h-4 w-4 text-gray-400 mr-2" />
              Monitoring Criteria ({monitoringCriteria.length})
            </h4>
            <div className="space-y-2">
              {selectedCriteriaDetails.map((criterion: MonitoringCriteria) => (
                <div key={criterion.id} className="text-sm text-gray-600">
                  • {criterion.name}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Update Frequency
              </p>
              <p className="text-sm font-medium">Every {updateFrequency} hours</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Duration
              </p>
              <p className="text-sm font-medium">
                {durationMonths} {durationMonths === 1 ? 'month' : 'months'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <AreaCostSummary
        areaSize={areaGeometry ? calculateAreaSize(areaGeometry) : 0}
        criteriaCount={monitoringCriteria.length}
        updateFrequency={updateFrequency}
        durationMonths={durationMonths}
      />
    </div>
  )
}

// Helper function to calculate area size (simplified for now)
function calculateAreaSize(_geometry: GeoJSON.Polygon): number {
  // In a real implementation, this would use turf.js or similar
  // to calculate the actual area in square kilometers
  return 100 // Default 100 km² for now
}