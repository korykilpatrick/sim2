import { Card } from '@/components/common'
import Button from '@/components/common/Button'
import { MapPin, AlertTriangle, Edit2, Trash2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Area } from '../types'

interface AreaCardProps {
  area: Area
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export function AreaCard({
  area,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: AreaCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        isSelected
          ? 'ring-2 ring-primary-500 border-primary-500'
          : 'hover:shadow-md'
      )}
      onClick={onSelect}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {area.name}
              </h3>
              {area.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {area.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              {area.sizeKm2.toLocaleString()} km²
            </span>
            {area.totalAlerts > 0 && (
              <span className="flex items-center text-yellow-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {area.totalAlerts} alerts
              </span>
            )}
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              area.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            )}
          >
            {area.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {area.creditsPerDay} credits/day
            </span>
            <span>{area.criteria.length} criteria</span>
          </div>
        </div>

        {area.criteria.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {area.criteria.slice(0, 2).map((criterion) => (
              <span
                key={criterion}
                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
              >
                {criterion}
              </span>
            ))}
            {area.criteria.length > 2 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                +{area.criteria.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}