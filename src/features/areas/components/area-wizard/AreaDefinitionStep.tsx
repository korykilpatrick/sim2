import { Card } from '@/components/common'
import Input from '@/components/forms/Input'
import { AreaMap } from '../AreaMap'
import { MapPin, AlertCircle } from 'lucide-react'

interface AreaDefinitionStepProps {
  areaGeometry?: GeoJSON.Polygon
  onAreaGeometryChange: (geometry: GeoJSON.Polygon) => void
  areaName: string
  onAreaNameChange: (name: string) => void
  description: string
  onDescriptionChange: (description: string) => void
}

export function AreaDefinitionStep({
  areaGeometry,
  onAreaGeometryChange,
  areaName,
  onAreaNameChange,
  description,
  onDescriptionChange,
}: AreaDefinitionStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Area Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Name
            </label>
            <Input
              type="text"
              value={areaName}
              onChange={(e) => onAreaNameChange(e.target.value)}
              placeholder="e.g., Persian Gulf Monitoring Zone"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              rows={3}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe the purpose of monitoring this area..."
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Define Area Boundaries
        </h3>
        <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
          <AreaMap
            onAreaCreate={onAreaGeometryChange}
            area={areaGeometry}
          />
        </div>
        {!areaGeometry && (
          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Click on the map to start drawing your monitoring area. Click multiple
                  points to create a polygon, then double-click to finish.
                </p>
              </div>
            </div>
          </div>
        )}
        {areaGeometry && (
          <Card className="mt-4 bg-green-50 border-green-200">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  Area Defined
                </p>
                <p className="mt-1 text-sm text-green-700">
                  Your monitoring area has been successfully defined on the map.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}