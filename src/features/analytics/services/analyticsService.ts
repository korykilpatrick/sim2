/**
 * @module analyticsService
 * @description Analytics service for retrieving usage statistics, revenue data, and user activity metrics.
 * Provides data export capabilities for reporting and analysis.
 */

import { analyticsApi } from '@api/endpoints'
import type {
  AnalyticsOverview,
  UserActivityLog,
  RevenueBreakdown,
} from '../types'

/**
 * Analytics service for business intelligence and reporting
 */
export const analyticsService = {
  /**
   * Get analytics overview with key metrics
   * @param {string} timeRange - Time range for analytics ('day' | 'week' | 'month' | 'year')
   * @returns {Promise<AnalyticsOverview>} Overview data with totals and trends
   * @example
   * ```typescript
   * const overview = await analyticsService.getOverview('month')
   * console.log('Total revenue:', overview.totalRevenue)
   * console.log('Active users:', overview.activeUsers)
   * ```
   */
  async getOverview(timeRange: string = 'month'): Promise<AnalyticsOverview> {
    const { data } = await analyticsApi.getOverview(timeRange)
    return data
  },

  /**
   * Get recent user activity logs
   * @param {number} limit - Maximum number of activity logs to retrieve (default: 20)
   * @returns {Promise<UserActivityLog[]>} Array of user activity entries
   * @example
   * ```typescript
   * const activities = await analyticsService.getUserActivity(50)
   * activities.forEach(activity => {
   *   console.log(`${activity.user} - ${activity.action} at ${activity.timestamp}`)
   * })
   * ```
   */
  async getUserActivity(limit: number = 20): Promise<UserActivityLog[]> {
    const { data } = await analyticsApi.getUserActivity(limit)
    return data
  },

  /**
   * Get revenue breakdown by product/service
   * @param {string} timeRange - Time range for revenue data ('day' | 'week' | 'month' | 'year')
   * @returns {Promise<RevenueBreakdown[]>} Revenue data broken down by category
   * @example
   * ```typescript
   * const revenue = await analyticsService.getRevenueBreakdown('quarter')
   * const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0)
   * console.log('Total revenue:', totalRevenue)
   * ```
   */
  async getRevenueBreakdown(
    timeRange: string = 'month',
  ): Promise<RevenueBreakdown[]> {
    const { data } = await analyticsApi.getRevenueBreakdown(timeRange)
    return data
  },

  /**
   * Export analytics data in specified format
   * @param {('csv' | 'excel')} format - Export file format
   * @param {string} timeRange - Time range for exported data
   * @returns {Promise<Blob>} File blob ready for download
   * @example
   * ```typescript
   * const blob = await analyticsService.exportAnalytics('excel', 'year')
   *
   * // Create download link
   * const url = URL.createObjectURL(blob)
   * const a = document.createElement('a')
   * a.href = url
   * a.download = 'analytics-report.xlsx'
   * a.click()
   * ```
   */
  async exportAnalytics(
    format: 'csv' | 'excel',
    timeRange: string = 'month',
  ): Promise<Blob> {
    const { data } = await analyticsApi.exportAnalytics(format, timeRange)
    return data
  },
}
