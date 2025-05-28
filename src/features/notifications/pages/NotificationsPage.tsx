import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Filter,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
  Calendar,
  Search,
  Settings,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import DatePicker from '@/components/forms/DatePicker'
import { PageLayout } from '@/components/layout'
import { Card } from '@/components/common'
import { useNotifications } from '../hooks/useNotifications'
import { formatRelativeTime } from '@/utils/date'
import type { Notification, NotificationFilters } from '../types'

export function NotificationsPage() {
  const [filters, setFilters] = useState<NotificationFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const {
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getFilteredNotifications,
  } = useNotifications()

  const filteredNotifications = getFilteredNotifications(filters).filter(
    (notification) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      )
    },
  )

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
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
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'area':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'compliance':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'credit':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'system':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const stats = {
    total: filteredNotifications.length,
    unread: filteredNotifications.filter((n) => !n.read).length,
    critical: filteredNotifications.filter((n) => n.severity === 'critical')
      .length,
    today: filteredNotifications.filter(
      (n) => new Date(n.timestamp).toDateString() === new Date().toDateString(),
    ).length,
  }

  return (
    <PageLayout
      title="Notifications"
      subtitle="Stay informed about your vessel and area monitoring activities"
    >
      {/* Actions */}
      <div className="flex justify-end gap-2 mb-6">
        <Link to="/settings/notifications">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-semibold">{stats.unread}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-semibold">{stats.critical}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-semibold">{stats.today}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <Select
              label="Type"
              value={filters.type?.[0] || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value
                    ? [e.target.value as Notification['type']]
                    : undefined,
                })
              }
            >
              <option value="">All Types</option>
              <option value="vessel">Vessel</option>
              <option value="area">Area</option>
              <option value="compliance">Compliance</option>
              <option value="credit">Credit</option>
              <option value="system">System</option>
            </Select>

            <Select
              label="Severity"
              value={filters.severity?.[0] || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  severity: e.target.value
                    ? [e.target.value as Notification['severity']]
                    : undefined,
                })
              }
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </Select>

            <Select
              label="Status"
              value={
                filters.read === undefined
                  ? ''
                  : filters.read
                    ? 'read'
                    : 'unread'
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  read:
                    e.target.value === ''
                      ? undefined
                      : e.target.value === 'read',
                })
              }
            >
              <option value="">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </Select>

            <DatePicker
              label="Date"
              value={filters.dateRange?.start.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dateRange: e.target.value
                    ? {
                        start: new Date(e.target.value),
                        end: new Date(
                          new Date(e.target.value).getTime() +
                            24 * 60 * 60 * 1000,
                        ),
                      }
                    : undefined,
                })
              }
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({})}
              className="text-gray-600"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          {filteredNotifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-600">
              {searchQuery || Object.keys(filters).length > 0
                ? 'Try adjusting your filters or search query'
                : "You're all caught up!"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'p-4 hover:shadow-md transition-all cursor-pointer',
                !notification.read && 'border-l-4 border-blue-500',
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {getSeverityIcon(notification.severity)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border',
                            getTypeColor(notification.type),
                          )}
                        >
                          {notification.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatRelativeTime(notification.timestamp)}
                        </span>
                        {notification.source && (
                          <span className="text-sm text-gray-500">
                            • {notification.source.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {notification.actionUrl && (
                        <Link
                          to={notification.actionUrl}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
