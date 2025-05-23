/**
 * Key performance indicator displayed on the dashboard.
 */
export interface DashboardStat {
  /** Stat display name */
  name: string
  /** Current value (formatted for display) */
  value: string
  /** Change from previous period (e.g., "+12%") */
  change: string
  /** Whether the change is favorable */
  changeType: 'positive' | 'negative' | 'neutral'
}

/**
 * Service card displayed in the dashboard services grid.
 */
export interface DashboardService {
  /** Service name */
  name: string
  /** Brief service description */
  description: string
  /** Navigation link for the service */
  href: string
  /** Icon identifier (e.g., 'vessel', 'area', 'report') */
  icon: string
  /** Tailwind color class for the service card */
  color: string
}

/**
 * Complete dashboard data including stats, services, and activity.
 */
export interface DashboardData {
  /** Key performance indicators */
  stats: DashboardStat[]
  /** Available services/features */
  services: DashboardService[]
  /** Recent user activity feed */
  recentActivity: DashboardActivity[]
}

/**
 * Recent activity item displayed in the dashboard feed.
 */
export interface DashboardActivity {
  /** Unique activity identifier */
  id: string
  /** Type of activity */
  type:
    | 'vessel_tracked'    // New vessel tracking started
    | 'area_created'      // New monitoring area created
    | 'report_generated'  // Compliance/chronology report generated
    | 'alert_triggered'   // Monitoring alert triggered
  /** Activity title */
  title: string
  /** Detailed activity description */
  description: string
  /** ISO timestamp of the activity */
  timestamp: string
  /** Additional activity-specific data */
  metadata?: Record<string, unknown>
}
