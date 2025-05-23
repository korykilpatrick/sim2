import React from 'react'
import { Area } from '../types'
import { Card, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import { MapPin, Activity, AlertCircle, Clock } from 'lucide-react'
import { clsx } from '@/utils/clsx'

interface AreaListProps {
  areas: Area[]
  onSelectArea: (area: Area) => void
  onEditArea: (area: Area) => void
  onDeleteArea: (area: Area) => void
  selectedAreaId?: string
}

export const AreaList: React.FC<AreaListProps> = ({
  areas,
  onSelectArea,
  onEditArea,
  onDeleteArea,
  selectedAreaId,
}) => {
  if (areas.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-900">
            No areas defined
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first area of interest
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {areas.map((area) => (
        <Card
          key={area.id}
          className={clsx(
            'cursor-pointer transition-all hover:shadow-md',
            selectedAreaId === area.id && 'ring-2 ring-primary-500',
          )}
          onClick={() => onSelectArea(area)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {area.name}
                  </h3>
                  {area.isActive ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <Activity className="mr-1 h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
                {area.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {area.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {area.sizeKm2.toLocaleString()} km²
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {area.totalAlerts} alerts
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {area.creditsPerDay} credits/day
                  </div>
                </div>
                {area.criteria.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {area.criteria.slice(0, 3).map((criterion) => (
                      <span
                        key={criterion}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                      >
                        {criterion}
                      </span>
                    ))}
                    {area.criteria.length > 3 && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        +{area.criteria.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="ml-4 flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditArea(area)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteArea(area)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}