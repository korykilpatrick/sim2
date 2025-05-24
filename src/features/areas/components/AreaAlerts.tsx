import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/common/Card'
import { AreaAlert } from '../types'
import { AlertCircle, Ship, Clock, MapPin } from 'lucide-react'
import { cn } from '@/utils/cn'
import Button from '@/components/common/Button'

interface AreaAlertsProps {
  alerts: AreaAlert[]
  onMarkRead: (alertId: string) => void
}

export const AreaAlerts: React.FC<AreaAlertsProps> = ({
  alerts,
  onMarkRead,
}) => {
  const getSeverityIcon = (severity: AreaAlert['severity']) => {
    const baseClass = 'h-5 w-5'
    switch (severity) {
      case 'critical':
        return <AlertCircle className={`${baseClass} text-red-600`} />
      case 'high':
        return <AlertCircle className={`${baseClass} text-orange-600`} />
      case 'medium':
        return <AlertCircle className={`${baseClass} text-yellow-600`} />
      default:
        return <AlertCircle className={`${baseClass} text-blue-600`} />
    }
  }

  const getSeverityStyles = (severity: AreaAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'high':
        return 'border-orange-200 bg-orange-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No alerts in this area</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'p-4 transition-colors',
                !alert.isRead && 'bg-gray-50',
                getSeverityStyles(alert.severity),
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {alert.description}
                    </p>

                    {alert.vesselInfo && (
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Ship className="mr-1 h-3 w-3" />
                          {alert.vesselInfo.name}
                        </div>
                        <span>IMO: {alert.vesselInfo.imo}</span>
                        <span>Flag: {alert.vesselInfo.flag}</span>
                      </div>
                    )}

                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {alert.location.lat.toFixed(4)},{' '}
                        {alert.location.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>

                {!alert.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkRead(alert.id)}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
