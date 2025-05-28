import { useState } from 'react'
import { PageLayout } from '@components/layout'
import { Button } from '@components/common'
import { Select } from '@components/forms'
import { LoadingSpinner, ErrorBoundary } from '@components/feedback'
import { Download, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { formatPrice } from '@utils/formatPrice'
import { useToast } from '@hooks/useToast'
import {
  MetricCard,
  RevenueChart,
  ProductUsageTable,
  ActivityFeed,
  EngagementMetrics,
} from '../components'
import {
  useAnalyticsOverview,
  useUserActivity,
  useRevenueBreakdown,
  useAnalyticsExport,
  analyticsKeys,
} from '../hooks'
import type { UsageMetric } from '../types'

const timeRangeOptions = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'quarter', label: 'Last 90 days' },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month')
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { exportData } = useAnalyticsExport()

  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useAnalyticsOverview(timeRange)
  const { data: activities } = useUserActivity(20)
  const { data: revenueBreakdown } = useRevenueBreakdown(timeRange)

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
    showToast({ message: 'Analytics data refreshed', type: 'success' })
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      await exportData(format, timeRange)
      showToast({
        message: `Analytics exported as ${format.toUpperCase()}`,
        type: 'success',
      })
    } catch (error) {
      showToast({ message: 'Failed to export analytics', type: 'error' })
    }
  }

  if (overviewLoading) {
    return (
      <PageLayout title="Analytics">
        <LoadingSpinner fullScreen />
      </PageLayout>
    )
  }

  if (overviewError || !overview) {
    return (
      <PageLayout title="Analytics">
        <ErrorBoundary>
          <div className="text-center py-12">
            <p className="text-gray-500">Failed to load analytics data</p>
            <Button onClick={handleRefresh} className="mt-4">
              Try Again
            </Button>
          </div>
        </ErrorBoundary>
      </PageLayout>
    )
  }

  // Prepare metrics for display
  const metrics: UsageMetric[] = [
    {
      label: 'Total Revenue',
      value: formatPrice(overview.revenue.total),
      change: overview.revenue.change,
      changeType:
        overview.revenue.change > 0
          ? 'positive'
          : overview.revenue.change < 0
            ? 'negative'
            : 'neutral',
      period: 'from last period',
    },
    {
      label: 'Active Users',
      value: overview.users.active.toLocaleString(),
      change: overview.users.change,
      changeType:
        overview.users.change > 0
          ? 'positive'
          : overview.users.change < 0
            ? 'negative'
            : 'neutral',
      period: 'from last period',
    },
    {
      label: 'New Users',
      value: overview.users.new.toLocaleString(),
      change: 0,
      changeType: 'neutral',
      period: 'this period',
    },
    {
      label: 'Credits Used',
      value: overview.products.totalCreditsUsed.toLocaleString(),
      change: 0,
      changeType: 'neutral',
      period: 'this period',
      description: `Avg ${overview.products.averageCreditsPerUser} per user`,
    },
  ]

  return (
    <PageLayout
      title="Analytics Dashboard"
      subtitle="Monitor your platform's performance and user engagement"
    >
      {/* Time range and actions */}
      <div className="flex items-center justify-between mb-6">
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-40"
        >
          {timeRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="mb-8">
        <RevenueChart
          data={overview.revenue.chartData}
          title="Revenue Trend"
          onExport={() => handleExport('excel')}
        />
      </div>

      {/* Product Performance and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <ProductUsageTable products={overview.products.topProducts} />
        </div>
        <div>
          <ActivityFeed activities={activities || []} />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EngagementMetrics data={overview.engagement} />

        {/* Revenue Breakdown */}
        {revenueBreakdown && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue by Product</h3>
            <div className="space-y-3">
              {revenueBreakdown.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {item.productName}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.transactions} txns
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
