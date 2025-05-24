export interface Notification {
  id: string
  type: 'vessel' | 'area' | 'compliance' | 'system' | 'credit'
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  timestamp: string
  read: boolean
  actionUrl?: string
  data?: Record<string, any>
  source?: {
    type: 'vessel' | 'area'
    id: string
    name: string
  }
}

export interface NotificationFilters {
  type?: Notification['type'][]
  severity?: Notification['severity'][]
  read?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}
