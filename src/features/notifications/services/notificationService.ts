import { apiClient } from '@/api/client'
import type { Notification, NotificationFilters } from '../types'

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  types: {
    vessel: boolean
    area: boolean
    compliance: boolean
    credit: boolean
    system: boolean
  }
  severities: {
    critical: boolean
    error: boolean
    warning: boolean
    info: boolean
  }
}

export interface NotificationStats {
  total: number
  unread: number
  bySeverity: Record<Notification['severity'], number>
  byType: Record<Notification['type'], number>
  last24Hours: number
  last7Days: number
}

export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(
    filters?: NotificationFilters,
  ): Promise<Notification[]> {
    const params = new URLSearchParams()

    if (filters?.type?.length) {
      params.append('type', filters.type.join(','))
    }
    if (filters?.severity?.length) {
      params.append('severity', filters.severity.join(','))
    }
    if (filters?.read !== undefined) {
      params.append('read', String(filters.read))
    }
    if (filters?.dateRange) {
      params.append('startDate', filters.dateRange.start.toISOString())
      params.append('endDate', filters.dateRange.end.toISOString())
    }

    const { data } = await apiClient.get<Notification[]>(
      `/notifications?${params.toString()}`,
    )
    return data
  },

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStats> {
    const { data } = await apiClient.get<NotificationStats>(
      '/notifications/stats',
    )
    return data
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/notifications/${notificationId}/read`)
  },

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    await apiClient.put('/notifications/read', { ids: notificationIds })
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all')
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/notifications/${notificationId}`)
  },

  /**
   * Delete multiple notifications
   */
  async deleteMultiple(notificationIds: string[]): Promise<void> {
    await apiClient.delete('/notifications', { data: { ids: notificationIds } })
  },

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    await apiClient.delete('/notifications/all')
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const { data } = await apiClient.get<NotificationPreferences>(
      '/notifications/preferences',
    )
    return data
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    const { data } = await apiClient.put<NotificationPreferences>(
      '/notifications/preferences',
      preferences,
    )
    return data
  },

  /**
   * Test notification settings by sending a test notification
   */
  async sendTestNotification(type: Notification['type']): Promise<void> {
    await apiClient.post('/notifications/test', { type })
  },

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    await apiClient.post('/notifications/push/subscribe', subscription)
  },

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<void> {
    await apiClient.post('/notifications/push/unsubscribe')
  },
}
