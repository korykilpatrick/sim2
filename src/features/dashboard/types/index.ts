export interface DashboardStat {
  name: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

export interface DashboardService {
  name: string
  description: string
  href: string
  icon: string
  color: string
}

export interface DashboardData {
  stats: DashboardStat[]
  services: DashboardService[]
  recentActivity: DashboardActivity[]
}

export interface DashboardActivity {
  id: string
  type:
    | 'vessel_tracked'
    | 'area_created'
    | 'report_generated'
    | 'alert_triggered'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}
