export interface UsageMetric {
  label: string
  value: string
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  period: string
  description?: string
}

export interface ProductUsageStats {
  productId: string
  productName: string
  activeUsers: number
  totalUsage: number
  revenue: number
  trend: number
}

export interface TimeSeriesData {
  date: string
  value: number
}

export interface AnalyticsOverview {
  revenue: {
    total: number
    change: number
    chartData: TimeSeriesData[]
  }
  users: {
    total: number
    active: number
    new: number
    change: number
    chartData: TimeSeriesData[]
  }
  products: {
    topProducts: ProductUsageStats[]
    totalCreditsUsed: number
    averageCreditsPerUser: number
  }
  engagement: {
    averageSessionDuration: number
    featuresAdopted: number
    totalFeatures: number
    conversionRate: number
  }
}

export interface UserActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  product: string
  timestamp: string
  creditsUsed?: number
}

export interface RevenueBreakdown {
  productId: string
  productName: string
  revenue: number
  percentage: number
  transactions: number
}

export interface MetricTimeRange {
  label: string
  value: 'day' | 'week' | 'month' | 'quarter' | 'year'
  startDate: Date
  endDate: Date
}
