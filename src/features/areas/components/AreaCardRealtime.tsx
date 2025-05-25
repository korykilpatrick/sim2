import { useState, useEffect } from 'react'
import { Card } from '@/components/common'
import Button from '@/components/common/Button'
import { MapPin, AlertTriangle, Edit2, Trash2, Clock, Bell } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useWebSocketEvent, useWebSocketRoom } from '@/hooks/useWebSocket'
import { useToast } from '@/hooks/useToast'
import type { Area } from '../types'
import type { AreaAlert, AreaVesselEvent } from '@/types/websocket'

interface AreaCardRealtimeProps {
  area: Area
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export function AreaCardRealtime({
  area: initialArea,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: AreaCardRealtimeProps) {
  const [area, setArea] = useState(initialArea)
  const [recentAlerts, setRecentAlerts] = useState<AreaAlert[]>([])
  const [isLive, setIsLive] = useState(false)
  const [lastAlert, setLastAlert] = useState<Date | null>(null)
  const { showToast } = useToast()

  // Subscribe to area room for real-time updates
  useWebSocketRoom('area', area.id, area.isActive)

  // Handle area alerts
  useWebSocketEvent('area_alert', (alert: AreaAlert) => {
    if (alert.areaId === area.id) {
      setArea((prev) => ({
        ...prev,
        totalAlerts: prev.totalAlerts + 1,
      }))

      setRecentAlerts((prev) => [alert, ...prev].slice(0, 5))
      setLastAlert(new Date())
      setIsLive(true)

      // Show toast for high severity alerts
      if (alert.severity === 'high' || alert.severity === 'critical') {
        showToast({
          type: 'error',
          message: `${alert.severity.toUpperCase()} alert in ${area.name}: ${alert.message}`,
        })
      }
    }
  })

  // Handle vessel entry events
  useWebSocketEvent('area_vessel_entered', (event: AreaVesselEvent) => {
    if (event.areaId === area.id) {
      showToast({
        type: 'info',
        message: `Vessel ${event.vesselName} entered ${area.name}`,
      })
    }
  })

  // Handle vessel exit events
  useWebSocketEvent('area_vessel_exited', (event: AreaVesselEvent) => {
    if (event.areaId === area.id) {
      showToast({
        type: 'info',
        message: `Vessel ${event.vesselName} exited ${area.name}`,
      })
    }
  })

  // Show live indicator for 10 seconds after last alert
  useEffect(() => {
    if (lastAlert) {
      const timer = setTimeout(() => {
        setIsLive(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [lastAlert])

  // Update area when props change
  useEffect(() => {
    setArea(initialArea)
  }, [initialArea])

  const mostRecentAlert = recentAlerts[0]

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all relative',
        isSelected
          ? 'ring-2 ring-primary-500 border-primary-500'
          : 'hover:shadow-md',
        isLive && 'animate-pulse-subtle',
      )}
      onClick={onSelect}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="absolute -top-1 -right-1 flex items-center">
          <div className="relative">
            <div className="h-3 w-3 bg-red-500 rounded-full" />
            <div className="absolute inset-0 h-3 w-3 bg-red-500 rounded-full animate-ping" />
          </div>
        </div>
      )}

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

        {/* Most recent alert */}
        {mostRecentAlert && (
          <div
            className={cn(
              'p-2 rounded-md text-xs',
              mostRecentAlert.severity === 'critical' &&
                'bg-red-50 text-red-700',
              mostRecentAlert.severity === 'high' &&
                'bg-orange-50 text-orange-700',
              mostRecentAlert.severity === 'medium' &&
                'bg-yellow-50 text-yellow-700',
              mostRecentAlert.severity === 'low' && 'bg-blue-50 text-blue-700',
            )}
          >
            <div className="flex items-start space-x-2">
              <Bell className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">
                  {mostRecentAlert.type.replace('_', ' ')}
                </p>
                <p className="mt-0.5">{mostRecentAlert.message}</p>
                <p className="mt-1 text-xs opacity-75">
                  {new Date(mostRecentAlert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              {area.sizeKm2.toLocaleString()} km²
            </span>
            {area.totalAlerts > 0 && (
              <span
                className={cn(
                  'flex items-center',
                  isLive ? 'text-red-600 font-medium' : 'text-yellow-600',
                )}
              >
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
                : 'bg-gray-100 text-gray-800',
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
