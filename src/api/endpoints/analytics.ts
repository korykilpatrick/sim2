/**
 * Analytics API endpoints
 * Provides usage analytics, activity tracking, and revenue insights
 * @module api/endpoints/analytics
 */

import { apiClient } from '../client'
import type {
  AnalyticsOverview,
  UserActivityLog,
  RevenueBreakdown,
} from '@features/analytics/types'

/**
 * Analytics API client for business intelligence and usage metrics
 */
export const analyticsApi = {
  /**
   * Get analytics overview dashboard data
   * @param {string} [timeRange='month'] - Time range filter (day, week, month, quarter, year)
   * @returns {Promise<AnalyticsOverview>} Overview metrics and charts
   * @throws {ApiError} 401 - Not authenticated
   * @throws {ApiError} 403 - Requires admin or analytics role
   * @example
   * ```typescript
   * const overview = await analyticsApi.getOverview('month')
   * 
   * console.log('Monthly Overview:')
   * console.log(`Active users: ${overview.activeUsers}`)
   * console.log(`Total revenue: $${overview.totalRevenue}`)
   * console.log(`Credit usage: ${overview.creditUsage}`)
   * console.log(`API calls: ${overview.apiCalls}`)
   * 
   * // Display usage trend chart
   * overview.usageTrend.forEach(point => {
   *   console.log(`${point.date}: ${point.value} credits`)
   * })
   * ```
   */
  getOverview: (timeRange: string = 'month') =>
    apiClient.get<AnalyticsOverview>('/analytics/overview', {
      params: { timeRange },
    }),

  /**
   * Get recent user activity logs
   * @param {number} [limit=20] - Maximum number of activities to return (max 100)
   * @returns {Promise<UserActivityLog[]>} List of recent user activities
   * @throws {ApiError} 401 - Not authenticated
   * @throws {ApiError} 403 - Requires admin role
   * @example
   * ```typescript
   * const activities = await analyticsApi.getUserActivity(50)
   * 
   * activities.forEach(activity => {
   *   console.log(`${activity.timestamp}: ${activity.user.name}`)
   *   console.log(`  Action: ${activity.action}`)
   *   console.log(`  Resource: ${activity.resource}`)
   *   if (activity.credits) {
   *     console.log(`  Credits: ${activity.credits}`)
   *   }
   * })
   * 
   * // Filter by action type
   * const trackingActivities = activities.filter(a => a.action.includes('tracking'))
   * console.log(`${trackingActivities.length} tracking-related activities`)
   * ```
   */
  getUserActivity: (limit: number = 20) =>
    apiClient.get<UserActivityLog[]>('/analytics/activity', {
      params: { limit },
    }),

  /**
   * Get revenue breakdown by product/service
   * @param {string} [timeRange='month'] - Time range filter (day, week, month, quarter, year)
   * @returns {Promise<RevenueBreakdown[]>} Revenue breakdown by category
   * @throws {ApiError} 401 - Not authenticated
   * @throws {ApiError} 403 - Requires admin or finance role
   * @example
   * ```typescript
   * const breakdown = await analyticsApi.getRevenueBreakdown('quarter')
   * 
   * console.log('Quarterly Revenue by Product:')
   * breakdown.forEach(item => {
   *   console.log(`${item.category}: $${item.revenue} (${item.percentage}%)`)
   *   console.log(`  Transactions: ${item.transactionCount}`)
   *   console.log(`  Avg. value: $${item.averageValue}`)
   * })
   * 
   * // Calculate total revenue
   * const totalRevenue = breakdown.reduce((sum, item) => sum + item.revenue, 0)
   * console.log(`Total revenue: $${totalRevenue}`)
   * ```
   */
  getRevenueBreakdown: (timeRange: string = 'month') =>
    apiClient.get<RevenueBreakdown[]>('/analytics/revenue/breakdown', {
      params: { timeRange },
    }),

  /**
   * Export analytics data in specified format
   * @param {'csv'|'excel'} format - Export file format
   * @param {string} [timeRange='month'] - Time range for export (day, week, month, quarter, year)
   * @returns {Promise<Blob>} Analytics export file as blob
   * @throws {ApiError} 401 - Not authenticated
   * @throws {ApiError} 403 - Requires admin or analytics role
   * @throws {ApiError} 400 - Invalid format or time range
   * @example
   * ```typescript
   * // Export monthly analytics to Excel
   * const blob = await analyticsApi.exportAnalytics('excel', 'month')
   * 
   * // Create download link
   * const url = window.URL.createObjectURL(blob)
   * const a = document.createElement('a')
   * a.href = url
   * a.download = `analytics-${new Date().toISOString().split('T')[0]}.xlsx`
   * a.click()
   * window.URL.revokeObjectURL(url)
   * 
   * console.log('Analytics report downloaded')
   * ```
   */
  exportAnalytics: (format: 'csv' | 'excel', timeRange: string = 'month') =>
    apiClient.get('/analytics/export', {
      params: { format, timeRange },
      responseType: 'blob',
    }),
}
