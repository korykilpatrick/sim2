import { useState, useEffect, useCallback } from 'react'
import { useWebSocketEvent } from '@/hooks/useWebSocket'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { Alert, AreaAlert } from '@/types/websocket'
import type { Notification, NotificationFilters } from '../types'

const STORAGE_KEY = 'sim_notifications'
const MAX_NOTIFICATIONS = 100

/**
 * Manages application notifications with WebSocket integration and localStorage persistence.
 * Automatically listens for WebSocket events and converts them to notifications.
 * Persists notifications across page reloads and browser sessions.
 *
 * @returns Notification state and management functions
 *
 * @example
 * ```tsx
 * const {
 *   notifications,
 *   unreadCount,
 *   markAsRead,
 *   addNotification
 * } = useNotifications()
 *
 * // Manually add a notification
 * addNotification({
 *   type: 'system',
 *   title: 'Update Available',
 *   message: 'A new version is ready',
 *   severity: 'info'
 * })
 * ```
 *
 * @remarks
 * - Automatically subscribes to WebSocket events: alert_created, area_alert, credit_balance_updated, etc.
 * - Limits stored notifications to MAX_NOTIFICATIONS (100) to prevent excessive storage
 * - Provides filtering capabilities via getFilteredNotifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>(
    STORAGE_KEY,
    [],
  )
  const [unreadCount, setUnreadCount] = useState(0)

  // Update unread count
  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length
    setUnreadCount(count)
  }, [notifications])

  // Add notification helper
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        read: false,
      }

      setNotifications((prev) => {
        const updated = [newNotification, ...prev]
        // Keep only the most recent notifications
        return updated.slice(0, MAX_NOTIFICATIONS)
      })
    },
    [setNotifications],
  )

  // Listen for WebSocket events
  useWebSocketEvent('alert_created', (alert: Alert) => {
    addNotification({
      type: alert.type,
      title: alert.title,
      message: alert.message,
      severity: alert.severity as Notification['severity'],
      actionUrl: alert.actionUrl,
      data: alert.data,
    })
  })

  useWebSocketEvent('area_alert', (alert: AreaAlert) => {
    addNotification({
      type: 'area',
      title: `Alert in ${alert.areaName}`,
      message: alert.message,
      severity:
        alert.severity === 'critical'
          ? 'critical'
          : alert.severity === 'high'
            ? 'error'
            : alert.severity === 'medium'
              ? 'warning'
              : 'info',
      actionUrl: `/areas/${alert.areaId}`,
      data: alert.data,
      source: {
        type: 'area',
        id: alert.areaId,
        name: alert.areaName,
      },
    })
  })

  useWebSocketEvent('credit_balance_updated', (data) => {
    if (data.change < 0) {
      addNotification({
        type: 'credit',
        title: 'Credits Deducted',
        message: `${Math.abs(data.change)} credits deducted. Balance: ${data.balance}`,
        severity: 'info',
        actionUrl: '/credits',
      })
    }
  })

  useWebSocketEvent('credit_low_balance', (data) => {
    addNotification({
      type: 'credit',
      title: 'Low Credit Balance',
      message: `Your credit balance (${data.balance}) is below the threshold (${data.threshold})`,
      severity: 'warning',
      actionUrl: '/credits',
    })
  })

  useWebSocketEvent('server_message', (data) => {
    addNotification({
      type: 'system',
      title: 'System Message',
      message: data.message,
      severity: data.type as Notification['severity'],
    })
  })

  // Mark as read
  const markAsRead = useCallback(
    (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      )
    },
    [setNotifications],
  )

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [setNotifications])

  // Delete notification
  const deleteNotification = useCallback(
    (notificationId: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    },
    [setNotifications],
  )

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [setNotifications])

  // Get filtered notifications
  const getFilteredNotifications = useCallback(
    (filters?: NotificationFilters) => {
      if (!filters) return notifications

      return notifications.filter((notification) => {
        // Type filter
        if (filters.type?.length && !filters.type.includes(notification.type)) {
          return false
        }

        // Severity filter
        if (
          filters.severity?.length &&
          !filters.severity.includes(notification.severity)
        ) {
          return false
        }

        // Read filter
        if (filters.read !== undefined && notification.read !== filters.read) {
          return false
        }

        // Date range filter
        if (filters.dateRange) {
          const notificationDate = new Date(notification.timestamp)
          if (
            notificationDate < filters.dateRange.start ||
            notificationDate > filters.dateRange.end
          ) {
            return false
          }
        }

        return true
      })
    },
    [notifications],
  )

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getFilteredNotifications,
  }
}
