import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  X,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import Button from '@/components/common/Button'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useNotifications } from '../hooks/useNotifications'
import { formatRelativeTime } from '@/utils/date'
import type { Notification, NotificationFilters } from '../types'

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<NotificationFilters>({})
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  const {
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getFilteredNotifications,
  } = useNotifications()

  const filteredNotifications = getFilteredNotifications(filters)

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      setIsOpen(false)
    }
  }

  const getSeverityIcon = (severity: Notification['severity']) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'vessel':
        return 'bg-blue-50 text-blue-700'
      case 'area':
        return 'bg-purple-50 text-purple-700'
      case 'compliance':
        return 'bg-orange-50 text-orange-700'
      case 'credit':
        return 'bg-green-50 text-green-700'
      case 'system':
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                {filteredNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 border-b border-gray-100 flex gap-2">
            <button
              onClick={() => setFilters({})}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors',
                !filters.type && 'bg-gray-900 text-white',
                filters.type && 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilters({ read: false })}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors',
                filters.read === false && 'bg-gray-900 text-white',
                filters.read !== false &&
                  'bg-gray-100 text-gray-700 hover:bg-gray-200',
              )}
            >
              Unread
            </button>
            <button
              onClick={() => setFilters({ severity: ['error', 'critical'] })}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors',
                filters.severity?.includes('error') && 'bg-gray-900 text-white',
                !filters.severity?.includes('error') &&
                  'bg-gray-100 text-gray-700 hover:bg-gray-200',
              )}
            >
              Alerts
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
                      !notification.read && 'bg-blue-50',
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 pt-0.5">
                        {getSeverityIcon(notification.severity)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="mt-0.5 text-sm text-gray-600">
                              {notification.message}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={cn(
                                  'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
                                  getTypeColor(notification.type),
                                )}
                              >
                                {notification.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatRelativeTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Action Link */}
                        {notification.actionUrl && (
                          <Link
                            to={notification.actionUrl}
                            className="mt-2 inline-flex items-center text-xs text-primary-600 hover:text-primary-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <Link
                to="/notifications"
                className="text-sm text-primary-600 hover:text-primary-700"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
